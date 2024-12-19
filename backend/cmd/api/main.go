package main

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
	"uncademy-app/internals/data"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

type config struct {
	port  int
	env   string
	db    db
	redis redisConfig
}

type db struct {
	dsn          string
	maxOpenConns int
	maxIdleConns int
	maxIdleTime  string
}

type redisConfig struct {
	port     string
	password string
	db       int
}

type Applications struct {
	config                 config
	logger                 *log.Logger
	models                 data.Models
	webSocket              WebSocketServer
	redisClient            *redis.Client
	KafkaRecordigRecording *KafkaRecordigRecording
}

func main() {
	var config config

	flag.IntVar(&config.port, "port", 8080, "API server PORT")
	flag.StringVar(&config.env, "env", "development", "Environment")

	flag.StringVar(&config.db.dsn, "postgres", "postgres://anumadhav:password@localhost:5432/unacademy?sslmode=disable", "PostgreSQL DSN")
	flag.IntVar(&config.db.maxOpenConns, "db-max-open-conns", 25, "PostgreSQL maximum open connections")
	flag.IntVar(&config.db.maxIdleConns, "db-max-idle-conns", 25, "PostgreSQL maximum idle connections")
	flag.StringVar(&config.db.maxIdleTime, "db-max-idle-time", "15m", "PostgreSQL maximum idle time")

	flag.StringVar(&config.redis.port, "redis port", "localhost:6379", "Redis running port")
	flag.StringVar(&config.redis.password, "redis-passowrd", "", "Redis password")
	flag.IntVar(&config.redis.db, "redis-db", 0, "RedisDb")

	flag.Parse()

	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)

	db, err := OpenDb(config)

	if err != nil {
		log.Println(err)
	}

	defer db.Close()

	wsService := NewWebSocketService()

	redisClient, err := connectRedis(&config)

	if err != nil {
		logger.Fatal(err)
	}

	defer redisClient.Close()

	if err != nil {
		logger.Fatal(err)
	}

	kafkaDrawing := NewRecodringDrawing([]string{"localhost:9092"}, "drawing")

	app := &Applications{
		config:                 config,
		logger:                 logger,
		models:                 data.NewModels(db),
		webSocket:              *wsService,
		redisClient:            redisClient,
		KafkaRecordigRecording: kafkaDrawing,
	}

	router := SetupRoutes(app)

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", config.port),
		Handler:      router,
		ReadTimeout:  20 * time.Second,
		WriteTimeout: 20 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	err = srv.ListenAndServe()

	if err != nil {
		log.Fatal(err)
	}
}

func OpenDb(cfg config) (*sql.DB, error) {
	db, err := sql.Open("postgres", cfg.db.dsn)

	if err != nil {
		log.Println("sql error", err)
	}

	db.SetMaxOpenConns(cfg.db.maxOpenConns)

	db.SetMaxIdleConns(cfg.db.maxIdleConns)

	duration, err := time.ParseDuration(cfg.db.maxIdleTime)

	if err != nil {
		log.Fatal(err)
	}

	db.SetConnMaxIdleTime(duration)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = db.PingContext(ctx)
	if err != nil {
		return nil, err
	}

	fmt.Println("Database connected")

	return db, nil
}

func connectRedis(cfg *config) (*redis.Client, error) {

	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.redis.port,
		Password: cfg.redis.password,
		DB:       cfg.redis.db,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pong, err := rdb.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Redis:%w", err)
	}

	fmt.Println("Connected to redis", pong)
	return rdb, nil
}
