package handlers

import (
	"context"
	"fmt"
	"os"
	"time"
	"uncademy-app/internals/data"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/livekit/protocol/livekit"
	lksdk "github.com/livekit/server-sdk-go/v2"
)

func Initialize() (*lksdk.RoomServiceClient, error) {
	err := godotenv.Load(".env")

	if err != nil {
		fmt.Println(err)
		return &lksdk.RoomServiceClient{}, err
	}

	host := "https://anu-7uptrtvw.livekit.cloud"
	apiKey := os.Getenv("LIVEKIT_API_KEY")
	apiSecret := os.Getenv("LIVEKIT_API_SECRET")

	if apiKey == "" || apiSecret == "" {
		return nil, fmt.Errorf("LIVEKIT_API_KEY or LIVEKIT_API_SECRET environment variables not set")
	}

	roomClient := lksdk.NewRoomServiceClient(host, apiKey, apiSecret)
	return roomClient, nil
}

func CreateRoom(opts data.RoomOptions) (string, error) {

	if opts.MaxParticipants == 0 {
		opts.MaxParticipants = 20
	}

	if opts.MaxEmpty == 0 {
		opts.MaxEmpty = 10 * time.Second
	}

	uuid := uuid.New()

	opts.Name = opts.Name + uuid.String()

	roomClient, err := Initialize()

	if err != nil {
		fmt.Println(err)
	}

	room, err := roomClient.CreateRoom(context.Background(), &livekit.CreateRoomRequest{
		Name:            opts.Name,
		EmptyTimeout:    uint32(opts.MaxEmpty),
		MaxParticipants: uint32(opts.MaxParticipants),
	})

	if err != nil {
		println("error during creating rooom", err.Error())
		return "", nil
	}

	fmt.Print("room.Name", room.Name)

	return room.Name, nil
}

func ListRoom() (*livekit.ListRoomsResponse, error) {
	roomClient, err := Initialize()

	if err != nil {
		println(err)
	}
	rooms, err := roomClient.ListRooms(context.Background(), &livekit.ListRoomsRequest{})

	if err != nil {
		println(err)
	}

	return rooms, nil
}

func DeleteRooms(room string) error {
	roomClient, err := Initialize()

	if err != nil {
		println(err)
	}

	_, err = roomClient.DeleteRoom(context.Background(), &livekit.DeleteRoomRequest{
		Room: room,
	})

	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}
