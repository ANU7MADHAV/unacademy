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
	User   UserModel
}

func NewModels(db *sql.DB) Models {
	return Models{
		Slides: SlidesModel{DB: db},
		User:   UserModel{DB: db},
	}
}
