package handlers

import (
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/livekit/protocol/auth"
)

type Token struct {
	Room     string `json:"room"`
	Identity string `json:"identity"`
}

func LivitKitTokenGeneration(input Token) (string, error) {
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatal(err.Error())
	}

	at := auth.NewAccessToken(os.Getenv("LIVEKIT_API_KEY"), os.Getenv("LIVEKIT_API_SECRET"))
	grant := &auth.VideoGrant{
		RoomJoin: true,
		Room:     input.Room,
	}

	identity := "anu"

	uuid := uuid.New()

	uuID := identity + uuid.String()

	at.SetVideoGrant(grant).SetIdentity(uuID).SetValidFor(time.Hour)

	token, _ := at.ToJWT()
	return token, nil
}
