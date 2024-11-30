package handlers

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/livekit/protocol/auth"
)

type Content struct {
	Room     string `json:"room"`
	Identity string `json:"identity"`
}

func GetJoinToken(c *gin.Context) {
	var content Content

	if err := c.ShouldBindJSON(&content); err != nil {

		c.AbortWithStatus(http.StatusBadRequest)
		c.JSON(400, "Missing request body")
		return
	}

	err := godotenv.Load(".env")

	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	apikey := os.Getenv("LIVEKIT_API_KEY")
	apiSecret := os.Getenv("LIVEKIT_API_SECRET")

	at := auth.NewAccessToken(apikey, apiSecret)

	grant := &auth.VideoGrant{
		RoomJoin: true,
		Room:     content.Room,
	}
	at.SetVideoGrant(grant).SetIdentity(content.Identity).SetValidFor(time.Hour)
	jwt, err := at.ToJWT()
	if err != nil {
		log.Fatal(err)
	}

	c.JSON(200, gin.H{"jwt": jwt, "room": content.Room, "identity": content.Identity})
}
