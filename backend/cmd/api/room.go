package main

import (
	"fmt"
	"net/http"
	"uncademy-app/handlers"
	"uncademy-app/internals/data"

	"github.com/gin-gonic/gin"
)

func (app *Applications) CreateRoom(c *gin.Context) {
	var room data.RoomOptions

	if err := c.ShouldBindJSON(&room); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	roomName, err := handlers.CreateRoom(room)

	fmt.Print("room-name", roomName)

	if err != nil {
		fmt.Println(err)
	}

	c.JSON(http.StatusOK, gin.H{"room": roomName})
}

func (app *Applications) GetRooms(c *gin.Context) {

	rooms, err := handlers.ListRoom()
	if err != nil {
		println(err)
		c.JSON(http.StatusBadRequest, gin.H{"message": err})
	}

	c.JSON(http.StatusOK, rooms)
}

func (app *Applications) DeleteRooms(c *gin.Context) {
	var room string
	if err := c.ShouldBindJSON(&room); err != nil {
		c.JSON(http.StatusBadRequest, err)
	}
	err := handlers.DeleteRooms(room)

	if err != nil {
		println(err)
	}

	c.JSON(http.StatusOK, gin.H{"message": true})

}
