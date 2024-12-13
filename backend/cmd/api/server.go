package main

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(app *Applications) *gin.Engine {
	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"POST", "GET", "PUT", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization", "Accept", "User-Agent", "Cache-Control", "Pragma"}
	config.ExposeHeaders = []string{"Content-Length", "Set-Cookie"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour

	r.MaxMultipartMemory = 8 << 20

	r.Use(cors.New(config))
	r.GET("/ws", app.WebsocketHandler)

	v1 := r.Group("/v1")

	{
		v1.POST("/token", app.TokenGeneration)
		v1.POST("/file-upload", app.InsertSlides)
		v1.POST("/slides", app.GetSlides)

		v1.POST("/create/rooms", app.CreateRoom)
		v1.GET("/rooms", app.GetRooms)

		v1.POST("/users/register", app.Signup)
		v1.POST("/users/login", app.Login)

		v1.POST("/token/create", app.TokenGeneration)
	}

	return r
}
