package main

import (
	"context"
	"fmt"
	"net/http"
	"reflect"

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

	fmt.Println("input", input.Metadata)
	fmt.Println("metadata type", reflect.TypeOf(input.Metadata))

	val, err := app.redisClient.Get(context.Background(), input.Metadata).Result()
	if err != nil {
		if err == redis.Nil {
			// Key not found in Redis
			c.JSON(http.StatusNotFound, gin.H{"error": "No slides found for given metadata"})
		} else {
			// Other Redis errors
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve slides"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"response": val})
}
