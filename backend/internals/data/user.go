package data

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type Logininput struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
