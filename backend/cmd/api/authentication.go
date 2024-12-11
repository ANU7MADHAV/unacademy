package main

import (
	"fmt"
	"net/http"
	"time"
	"uncademy-app/internals/data"

	"github.com/gin-gonic/gin"
)

func (app *Applications) Signup(c *gin.Context) {

	var input struct {
		Username string        `json:"username"`
		Password string        `json:"password"`
		Role     data.UserRole `json:"role"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	user := &data.User{
		Username: input.Username,
		Password: input.Password,
		Role:     input.Role,
	}

	err := app.models.User.Insert(user)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password", "details": err.Error()})
		return
	}

	token, err := app.CreatToken(user.Username, string(user.Role))

	if err != nil {
		fmt.Println(err)
	}

	c.SetCookie("jwt-token", token, int(24*time.Hour.Seconds()), "/", "", false, true)
	c.JSON(http.StatusOK, token)
}

func (app *Applications) Login(c *gin.Context) {
	var input struct {
		Username string        `json:"username"`
		Password string        `json:"password"`
		Role     data.UserRole `json:"role"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	user := &data.User{
		Username: input.Username,
		Password: input.Password,
		Role:     input.Role,
	}

	if err := app.models.User.SelectUser(user.Username, user.Password); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password", "details": err.Error()})
		return
	}

	token, err := app.CreatToken(input.Username, string(user.Role))

	if err != nil {
		fmt.Println(err)
	}

	c.SetCookie("jwt-token", token, int(24*time.Hour.Seconds()), "/", "", false, true)
	c.JSON(http.StatusOK, token)
}
