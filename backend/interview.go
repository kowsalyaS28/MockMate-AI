package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

type InterviewAnswer struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Score    int    `json:"score"`
	Feedback string `json:"feedback"`
}

type InterviewRequest struct {
	UserID        int               `json:"user_id"`
	JobRole       string            `json:"job_role"`
	InterviewType string            `json:"interview_type"`
	Difficulty    string            `json:"difficulty"`
	Score         int               `json:"score"`
	Answers       []InterviewAnswer `json:"answers"`
}

func createInterviewHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var request InterviewRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if request.UserID <= 0 {
		http.Error(w, "Valid user ID is required", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(request.JobRole) == "" ||
		strings.TrimSpace(request.InterviewType) == "" ||
		strings.TrimSpace(request.Difficulty) == "" {
		http.Error(w, "Interview details are required", http.StatusBadRequest)
		return
	}

	if len(request.Answers) == 0 {
		http.Error(w, "At least one interview answer is required", http.StatusBadRequest)
		return
	}

	// Evaluate each answer using Gemini.
	totalScore := 0

	for i := range request.Answers {
		item := &request.Answers[i]

		if strings.TrimSpace(item.Question) == "" {
			http.Error(w, "Question cannot be empty", http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(item.Answer) == "" {
			item.Score = 0
			item.Feedback = "No answer provided. Try answering this question."
		} else {
			evaluation, err := evaluateAnswer(item.Question, item.Answer)
			if err != nil {
				log.Printf("Gemini evaluation failed: %v", err)
				http.Error(
					w,
					"AI evaluation failed. Please check your Gemini API configuration and try again.",
					http.StatusBadGateway,
				)
				return
			}

			item.Score = evaluation.Score
			item.Feedback = evaluation.Feedback
		}

		totalScore += item.Score
	}

	// Calculate the average score across all submitted questions.
	request.Score = totalScore / len(request.Answers)

	// Start a database transaction.
	tx, err := db.Begin()
	if err != nil {
		http.Error(w, "Failed to start database transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Save the interview and retrieve its ID.
	var interviewID int

	err = tx.QueryRow(
		`INSERT INTO interviews
		(user_id, job_role, interview_type, difficulty, score)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id`,
		request.UserID,
		request.JobRole,
		request.InterviewType,
		request.Difficulty,
		request.Score,
	).Scan(&interviewID)

	if err != nil {
		log.Printf("Failed to save interview: %v", err)
		http.Error(w, "Failed to save interview", http.StatusInternalServerError)
		return
	}

	// Save every evaluated answer.
	for _, item := range request.Answers {
		_, err = tx.Exec(
			`INSERT INTO interview_answers
			(interview_id, question, answer, score, feedback)
			VALUES ($1, $2, $3, $4, $5)`,
			interviewID,
			item.Question,
			item.Answer,
			item.Score,
			item.Feedback,
		)

		if err != nil {
			log.Printf("Failed to save answer: %v", err)
			http.Error(w, "Failed to save interview answers", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		log.Printf("Failed to commit interview: %v", err)
		http.Error(w, "Failed to complete interview save", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":      "Interview evaluated and saved successfully",
		"interview_id": interviewID,
		"score":        request.Score,
		"answers":      request.Answers,
	})
}
func interviewReviewHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	interviewID := strings.TrimSpace(r.URL.Query().Get("interview_id"))

	if interviewID == "" {
		http.Error(w, "Interview ID is required", http.StatusBadRequest)
		return
	}

	var interview struct {
		ID            int    `json:"id"`
		JobRole       string `json:"job_role"`
		InterviewType string `json:"interview_type"`
		Difficulty    string `json:"difficulty"`
		Score         int    `json:"score"`
		CreatedAt     string `json:"created_at"`
	}

	err := db.QueryRow(
		`SELECT id, job_role, interview_type, difficulty, score, created_at
		 FROM interviews
		 WHERE id = $1`,
		interviewID,
	).Scan(
		&interview.ID,
		&interview.JobRole,
		&interview.InterviewType,
		&interview.Difficulty,
		&interview.Score,
		&interview.CreatedAt,
	)

	if err != nil {
		log.Printf("Failed to find interview: %v", err)
		http.Error(w, "Interview not found", http.StatusNotFound)
		return
	}

	rows, err := db.Query(
		`SELECT question, answer, score, feedback
		 FROM interview_answers
		 WHERE interview_id = $1
		 ORDER BY id ASC`,
		interviewID,
	)

	if err != nil {
		log.Printf("Failed to retrieve interview answers: %v", err)
		http.Error(w, "Failed to retrieve interview answers", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	answers := make([]InterviewAnswer, 0)

	for rows.Next() {
		var answer InterviewAnswer

		if err := rows.Scan(
			&answer.Question,
			&answer.Answer,
			&answer.Score,
			&answer.Feedback,
		); err != nil {
			log.Printf("Failed to read interview answer: %v", err)
			http.Error(w, "Failed to read interview answers", http.StatusInternalServerError)
			return
		}

		answers = append(answers, answer)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Failed while reading interview answers: %v", err)
		http.Error(w, "Failed to retrieve interview answers", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"interview": interview,
		"answers":   answers,
	})
}
