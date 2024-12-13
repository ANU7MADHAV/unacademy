package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type slidesInput struct {
	Metadata string `json:"metadata"`
}

func (app *Applications) GetSlides(c *gin.Context) {
	var input slidesInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	val, err := app.redisClient.Get(context.Background(), input.Metadata).Result()
	if err != nil {
		if err == redis.Nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No slides found for given metadata"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve slides"})
		}
		return
	}

	var dat []string

	if err := json.Unmarshal([]byte(val), &dat); err != nil {
		fmt.Println(err.Error())
		return
	}

	fmt.Println("value", val)

	c.JSON(http.StatusOK, dat)
}
