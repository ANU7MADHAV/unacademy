package data

import "time"

type RoomOptions struct {
	Name            string        `json:"name"`
	MaxEmpty        time.Duration `json:"max_time"`
	MaxParticipants int           `json:"max_people"`
}
