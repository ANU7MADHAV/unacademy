package handlers

import (
	"fmt"
	"log"
	"os"
	"time"
	"uncademy-app/internals/data"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/livekit/protocol/auth"
)

type Token struct {
	Room     string `json:"room"`
	Identity string `json:"identity"`
}

func LivitKitTokenGeneration(input Token, models *data.Models) (string, error) {
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatal(err.Error())
	}

	user, err := models.User.FindUser(input.Identity)
	if err != nil {
		log.Fatal(err.Error())
	}

	fmt.Println(user.Role)

	admin := false
	publishdata := false

	if user.Role == "teacher" {
		admin = true
		publishdata = true
	}
	at := auth.NewAccessToken(os.Getenv("LIVEKIT_API_KEY"), os.Getenv("LIVEKIT_API_SECRET"))
	grant := &auth.VideoGrant{
		RoomJoin:   true,
		Room:       input.Room,
		RoomAdmin:  admin,
		CanPublish: &publishdata,
		RoomRecord: true,
	}

	uuid := uuid.New()

	uuID := input.Identity + uuid.String()

	at.SetVideoGrant(grant).SetIdentity(uuID).SetValidFor(time.Hour)

	token, _ := at.ToJWT()
	return token, nil
}
