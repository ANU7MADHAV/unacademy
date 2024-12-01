package data

import (
	"database/sql"

	"golang.org/x/crypto/bcrypt"
)

type UserRole string

type User struct {
	ID       int
	Username string   `json:"username"`
	Password []byte   `json:"password"`
	Role     UserRole `json:"role"`
}

const (
	RoleTeacher UserRole = "teacher"
	RoleStudent UserRole = "student"
)

type UserModel struct {
	DB *sql.DB
}
type Logininput struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (u UserModel) Insert(user *User) error {
	query := `INSERT INTO users(username,password,role)
			VALUES($1,$2,$3)
			RETURNING ID,
`

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)

	if err != nil {
		println(err)
	}

	user.Password = hashPassword

	args := []interface{}{user.Username, user.Password, user.Role}

	return u.DB.QueryRow(query, args...).Scan(&user.ID)
}

func (u UserModel) SelectUser(user *User) error {

	query := `SELECT id,username,password,role FROM users WHERE username = $1, RETURNING Password`

	args := []interface{}{user.Username, user.Password}

	var storeUser User

	err := u.DB.QueryRow(query, args...).Scan(&storeUser.ID, &storeUser.Username, &storeUser.Password, &storeUser.Role)

	if err != nil {
		println(err)
		return err
	}

	err = bcrypt.CompareHashAndPassword(storeUser.Password, user.Password)

	if err != nil {
		println(err)
		return err
	}

	return nil
}
