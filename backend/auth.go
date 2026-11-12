package main

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("mockmate-secret-key")

func generateToken(userID int, email string) (string, error) {

	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(jwtSecret)
}
