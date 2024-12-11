package main

import (
	"context"
	"fmt"
	"net/http"
	"reflect"

	"github.com/gin-gonic/gin"
)

type slidesInput struct {
	Metadata string `json:"metadata"`
}

func (app *Applications) GetSlides(c *gin.Context) {
	var input slidesInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Println("input", input.Metadata)

	fmt.Println("metadata type ", reflect.TypeOf(input.Metadata))

	val, err := app.redisClient.Get(context.Background(), input.Metadata).Result()

	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"response": val})
}
