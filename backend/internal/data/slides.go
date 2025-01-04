package data

import (
	"database/sql"
	"time"
)

type SlidesModel struct {
	DB *sql.DB
}

type Slides struct {
	ID        int
	Metadata  string `json:"metadata"`
	CreatedAt time.Time
}

func (s SlidesModel) Insert(slides Slides) error {
	slides.CreatedAt = time.Now()
	query := `
	INSERT INTO slides (metadata,created_at)
	VALUES ($1,$2)
	RETURNING id,
	`

	args := []interface{}{slides.Metadata, slides.CreatedAt}

	return s.DB.QueryRow(query, args...).Scan(slides.ID)
}

func (s *SlidesModel) Get(id int) (*Slides, error) {
	return nil, nil
}

func (s *SlidesModel) Update(slides *Slides) error {
	return nil
}

func (s *SlidesModel) Delete(id int) error {
	return nil
}
