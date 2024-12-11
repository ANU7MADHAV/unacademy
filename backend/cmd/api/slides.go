package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"reflect"
	"time"
	"uncademy-app/handlers"
	"uncademy-app/internals/data"

	"github.com/gin-gonic/gin"
)

const (
	MaxFileSize  = 20 * 1024 * 1024
	MaxPages     = 100
	ImageQuality = 90
)

func (app *Applications) InsertSlides(c *gin.Context) {
	var slides data.Slides

	metadata := c.PostForm("metadata")

	fmt.Println(slides)

	// Getting file
	file, err := c.FormFile("file")

	if err != nil {
		fmt.Println("error", err.Error())
	}

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

	err = app.redisClient.Set(context.Background(), metadata, jsonStringify, 5*time.Minute).Err()

	if err != nil {
		fmt.Println(err.Error())
	}

	fmt.Println("type of the metadata", reflect.TypeOf(metadata))

	val, err := app.redisClient.Get(context.Background(), metadata).Result()

	if err != nil {
		fmt.Println(err.Error())
	}

	fmt.Println("value", val)

	c.JSON(200, response)
}
