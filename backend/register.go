package main

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func registerHandler(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var request RegisterRequest

	err := json.NewDecoder(r.Body).Decode(&request)

	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(request.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		http.Error(w, "Password hashing failed", http.StatusInternalServerError)
		return
	}

	_, err = db.Exec(
		"INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)",
		request.Name,
		request.Email,
		string(hashedPassword),
	)

	if err != nil {
		var pqErr *pq.Error

		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			http.Error(
				w,
				"This email is already registered. Please log in or use another email.",
				http.StatusConflict,
			)
			return
		}

		http.Error(
			w,
			"Registration failed. Please try again.",
			http.StatusInternalServerError,
		)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Account created successfully",
	})
}
