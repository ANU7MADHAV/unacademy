package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"reflect"
	"time"
	"uncademy-app/handlers"

	"github.com/gin-gonic/gin"
)

const (
	MaxFileSize  = 20 * 1024 * 1024
	MaxPages     = 100
	ImageQuality = 90
)

func (app *Applications) InsertSlides(c *gin.Context) {

	metadata := c.PostForm("metadata")

	// Getting file
	file, err := c.FormFile("file")

	fmt.Print("file", file)
	fmt.Println("metadata", metadata)

	if err != nil {
		app.logger.Println(err.Error())
	}

	response, err := handlers.ConvertAndUploadHandler(metadata, file)
	if err != nil {
		log.Println(err.Error())
	}

	jsonStringify, err := json.Marshal(response.ImageURLs)

	if err != nil {
		fmt.Println(err.Error())
	}

	err = app.redisClient.Set(context.Background(), metadata, jsonStringify, 30*time.Minute).Err()

	if err != nil {
		fmt.Println(err.Error())
	}

	fmt.Println("type of the metadata", reflect.TypeOf(metadata))

	val, err := app.redisClient.Get(context.Background(), metadata).Result()

	if err != nil {
		fmt.Println(err.Error())
	}

	valType := reflect.TypeOf(val)

	fmt.Println("valType", valType)

	var dat []string

	if err := json.Unmarshal([]byte(val), &dat); err != nil {
		fmt.Println(err.Error())
		return
	}

	fmt.Println("value", dat)

	c.JSON(200, gin.H{"imageUrls": dat})
}
