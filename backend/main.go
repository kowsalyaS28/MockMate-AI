package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func homeHandler(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Content-Type", "application/json")

	response := map[string]string{
		"message": "Welcome to MockMate AI Backend!",
		"status":  "running",
	}

	json.NewEncoder(w).Encode(response)
}

func main() {

	// Load environment variables from .env
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found")
	}

	// Verify that the Gemini API key exists without printing it.
	if os.Getenv("GEMINI_API_KEY") != "" {
		log.Println("Gemini API key loaded successfully!")
	} else {
		log.Println("Gemini API key not found. Check your .env file.")
	}

	// Connect to PostgreSQL
	connectDatabase()

	// Register API routes
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/api/register", registerHandler)
	http.HandleFunc("/api/login", loginHandler)
	http.HandleFunc("/api/interviews", createInterviewHandler)
	http.HandleFunc("/api/interviews/review", interviewReviewHandler)
	http.HandleFunc("/api/dashboard", dashboardHandler)
	http.HandleFunc("/api/resume/analyze", resumeAnalyzeHandler)
	http.HandleFunc("/api/interviews/adaptive-question", adaptiveQuestionHandler)
	http.HandleFunc("/api/interviews/evaluate-answer", evaluateInterviewAnswerHandler)

	log.Println("MockMate AI Backend running on http://localhost:8080")

	err = http.ListenAndServe(":8080", nil)

	if err != nil {
		log.Fatal("Server error: ", err)
	}
}
