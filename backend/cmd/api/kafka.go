package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

func (app *Applications) ReplayHandler(c *gin.Context) {

	var input struct {
		ID string `json:"id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		fmt.Println("hello")
	}

	fmt.Println("hello id is there", input.ID)

	app.KafkaRecordigRecording.ReplayDrawingEvent()
}
