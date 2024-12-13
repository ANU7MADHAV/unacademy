package handlers

import (
	"bytes"
	"fmt"
	"image/jpeg"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/gen2brain/go-fitz"
	"github.com/joho/godotenv"
)

type ImageResponse struct {
	Message    string   `json:"message"`
	ImageURLs  []string `json:"image_urls"`
	NumPages   int      `json:"num_pages"`
	UploadedAt string   `json:"uploaded_at"`
}

const (
	MaxFileSize  = 10 * 1024 * 1024
	MaxPages     = 100
	ImageQuality = 90
)

func ConvertAndUploadHandler(metadata string, file *multipart.FileHeader) (ImageResponse, error) {

	if file.Size > MaxFileSize {
		log.Fatal("File size is not allowed")
	}

	if filepath.Ext(file.Filename) != ".pdf" {
		log.Fatal("Pdf files are only accepted")
	}

	srcFile, err := file.Open()

	if err != nil {
		log.Fatal(err)
	}

	defer srcFile.Close()

	tempFile, err := os.CreateTemp("", "uploaded-*.pdf")
	if err != nil {
		log.Fatal(err)
	}

	defer os.Remove(tempFile.Name())
	defer tempFile.Close()

	if _, err := io.Copy(tempFile, srcFile); err != nil {
		log.Fatal(err)
	}

	doc, err := fitz.New(tempFile.Name())
	if err != nil {
		log.Fatal(err)

	}
	defer doc.Close()

	s3Config := getS3Config()

	imageUrls, err := convertAndUploadPages(doc, s3Config)
	if err != nil {
		log.Fatal(err)

	}

	response := ImageResponse{
		Message:    "PDF successfully converted and images uploaded",
		ImageURLs:  imageUrls,
		NumPages:   len(imageUrls),
		UploadedAt: time.Now().UTC().Format(time.RFC3339),
	}

	return response, nil
}

func convertAndUploadPages(doc *fitz.Document, config S3Config) ([]string, error) {
	var imageUrls []string
	sess, err := createS3Session(config)
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS session: %w", err)
	}

	svc := s3.New(sess)
	pagesToProcess := doc.NumPage()

	if pagesToProcess > MaxPages {
		pagesToProcess = MaxPages
	}

	for n := 0; n < pagesToProcess; n++ {

		img, err := doc.Image(n)
		if err != nil {
			log.Printf("Failed to extract image for page %d: %v", n, err)
			continue
		}

		var buf bytes.Buffer
		if err := jpeg.Encode(&buf, img, &jpeg.Options{Quality: ImageQuality}); err != nil {
			log.Printf("Failed to encode image for page %d: %v", n, err)
			continue
		}

		filename := fmt.Sprintf("%s/page-%d-%s.jpg",
			config.Prefix,
			n+1,
			time.Now().Format("20060102-150405"),
		)

		output, err := svc.PutObject(&s3.PutObjectInput{
			Bucket:        aws.String(config.Bucket),
			Key:           aws.String(filename),
			Body:          bytes.NewReader(buf.Bytes()),
			ContentType:   aws.String("image/jpeg"),
			ContentLength: aws.Int64(int64(buf.Len())),
			ACL:           aws.String("public-read"),
		})

		if err != nil {
			log.Printf("Failed to upload image for page %d: %v", n, err)
			continue
		}

		fmt.Println("output", output)

		imageUrl := fmt.Sprintf("https://%s.s3.%s.amazonaws.com%s", config.Bucket, config.Region, filename)
		fmt.Println("imageurl", imageUrl)
		imageUrls = append(imageUrls, imageUrl)
	}

	if len(imageUrls) == 0 {
		return nil, fmt.Errorf("failed to process and upload any images")
	}

	return imageUrls, nil
}

type S3Config struct {
	Bucket    string
	Prefix    string
	Region    string
	AccessKey string
	SecretKey string
}

func getS3Config() S3Config {
	err := godotenv.Load()
	if err != nil {
		log.Printf("Warning: Error loading .env file: %v", err)
	}

	return S3Config{
		Bucket: getEnvWithDefault("AWS_BUCKET", "unacademy-anu"),
		// Prefix:    getEnvWithDefault("AWS_PREFIX", "pdf-images"),
		Region:    getEnvWithDefault("AWS_REGION", "ap-south-1"),
		AccessKey: os.Getenv("AWS_ACCESSKEY"),
		SecretKey: os.Getenv("AWS_SECRET"),
	}
}

func getEnvWithDefault(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func createS3Session(config S3Config) (*session.Session, error) {
	return session.NewSession(&aws.Config{
		Region: aws.String(config.Region),
		Credentials: credentials.NewStaticCredentials(
			config.AccessKey,
			config.SecretKey,
			"",
		),
	})
}
