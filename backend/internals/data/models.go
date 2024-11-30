package data

import (
	"database/sql"
	"errors"
)

var (
	ErrRecodNotFound = errors.New("record not found")
)

type Models struct {
	Slides SlidesModel
}

func NewModels(db *sql.DB) Models {
	return Models{
		Slides: SlidesModel{DB: db},
	}
}
