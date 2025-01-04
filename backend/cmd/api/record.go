package main

import (
	"context"
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/livekit/protocol/livekit"
	lksdk "github.com/livekit/server-sdk-go/v2"
)

func (app *Applications) RecordRoom(c *gin.Context) {

	roomId := c.Param("roomId")
	track := c.Query("track")

	fmt.Println("roomId", roomId)
	fmt.Println("track", track)

	if roomId == "" {
		app.logger.Fatal("Room id is missing")
	}

	err := godotenv.Load(".env")

	if err != nil {
		app.logger.Fatal("error", err.Error())
	}

	// egressClient := lksdk.NewEgressClient(
	// 	"https://anu-7uptrtvw.livekit.cloud",
	// 	os.Getenv("LIVEKIT_API_KEY"),
	// 	os.Getenv("LIVEKIT_API_SECRET"),
	// )
	//
	// 	req := &livekit.TrackEgressRequest{
	// 		RoomName: roomId,
	// 		TrackId:  track,
	// 		Output: &livekit.TrackEgressRequest_File{
	// 			File: &livekit.DirectFileOutput{
	// 				Filepath: roomId + track,
	// 				Output: &livekit.DirectFileOutput_S3{
	// 					S3: &livekit.S3Upload{
	// 						AccessKey: os.Getenv("AWS_ACCESSKEY"),
	// 						Secret:    os.Getenv("AWS_SECRET"),
	// 						Bucket:    "uncademy-live-anu07",
	// 					},
	// 				},
	// 			},
	// 		},
	// 	}
	// 	info, err := egressClient.StartTrackEgress(context.Background(), req)
	//
	// 	if err != nil {
	// 		app.logger.Fatal(err.Error())
	// 	}
	//
	// 	fmt.Println("info", info)

	req := &livekit.RoomCompositeEgressRequest{
		RoomName: roomId,
		// Layout:        "speaker",
		CustomBaseUrl: "https://anu-7uptrtvw.livekit.cloud",
		Options: &livekit.RoomCompositeEgressRequest_Preset{
			Preset: livekit.EncodingOptionsPreset_PORTRAIT_H264_1080P_30,
		},
	}

	req.SegmentOutputs = []*livekit.SegmentedFileOutput{
		{
			FilenamePrefix:   "uncademy",
			PlaylistName:     "uncademy",
			LivePlaylistName: "uncademy-live",
			SegmentDuration:  2,
			Output: &livekit.SegmentedFileOutput_S3{
				S3: &livekit.S3Upload{
					AccessKey:      os.Getenv("AWS_ACCESSKEY"),
					Secret:         os.Getenv("AWS_SECRET"),
					Bucket:         "uncademy-live-anu07",
					ForcePathStyle: true,
				},
			},
		},
	}

	apikey := os.Getenv("LIVEKIT_API_KEY")
	fmt.Println("apikey", apikey)
	egressClient := lksdk.NewEgressClient(
		"wss://anu-7uptrtvw.livekit.cloud",
		os.Getenv("LIVEKIT_API_KEY"),
		os.Getenv("LIVEKIT_API_SECRET"),
	)

	fmt.Println("req", req)
	res, err := egressClient.StartRoomCompositeEgress(context.Background(), req)

	if err != nil {
		fmt.Println(err)
	}

	fmt.Println("res", res)
}
