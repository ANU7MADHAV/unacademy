package data

import (
	"database/sql"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

type UserRole string

type User struct {
	ID       int
	Username string   `json:"username"`
	Password string   `json:"password"`
	Role     UserRole `json:"role"`
}

const (
	RoleTeacher UserRole = "teacher"
	RoleStudent UserRole = "student"
)

type UserModel struct {
	DB *sql.DB
}

func (u UserModel) Insert(user *User) error {
	query := `INSERT INTO users(username,password,role)
			VALUES($1,$2,$3)
			RETURNING ID
`

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)

	if err != nil {
		println("error during hash", err)
	}

	user.Password = string(hashPassword)

	fmt.Println("user-password", user.Password)

	args := []interface{}{user.Username, user.Password, user.Role}

	return u.DB.QueryRow(query, args...).Scan(&user.ID)
}

func (u UserModel) SelectUser(username string, password string) error {

	query := `SELECT id, username, password, role FROM users WHERE username = $1`

	args := []interface{}{username}

	var storeUser User

	err := u.DB.QueryRow(query, args...).Scan(&storeUser.ID, &storeUser.Username, &storeUser.Password, &storeUser.Role)

	if err != nil {
		println(err)
		return err
	}

	err = bcrypt.CompareHashAndPassword([]byte(storeUser.Password), []byte(password))

	if err != nil {
		println(err)
		return err
	}

	return nil
}

func (u UserModel) FindUser(username string) (*User, error) {
	query := `SELECT id, username, role FROM users WHERE username = $1`

	args := []interface{}{username}

	var storedUser User

	err := u.DB.QueryRow(query, args...).Scan(&storedUser.ID, &storedUser.Username, &storedUser.Role)

	if err != nil {
		return nil, err
	}
	return &storedUser, nil
}
