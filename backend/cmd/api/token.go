package main

import (
	"net/http"
	"uncademy-app/handlers"
	"uncademy-app/internals/data"

	"github.com/gin-gonic/gin"
)

func (app *Applications) TokenGeneration(c *gin.Context) {
	var input handlers.Token

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	models := data.NewModels(app.models.User.DB)

	token, err := handlers.LivitKitTokenGeneration(input, &models)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}
