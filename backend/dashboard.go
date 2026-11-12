package main

import (
	"encoding/json"
	"net/http"
)

func dashboardHandler(w http.ResponseWriter, r *http.Request) {
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

	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	// Overall statistics
	var totalInterviews int
	var averageScore float64
	var bestScore int

	err := db.QueryRow(`
		SELECT
			COUNT(*),
			COALESCE(AVG(score), 0),
			COALESCE(MAX(score), 0)
		FROM interviews
		WHERE user_id = $1
	`, userID).Scan(
		&totalInterviews,
		&averageScore,
		&bestScore,
	)

	if err != nil {
		http.Error(w, "Unable to load interview statistics", http.StatusInternalServerError)
		return
	}

	// Recent interviews
	rows, err := db.Query(`
		SELECT id, job_role, interview_type, difficulty, score, created_at
		FROM interviews
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 10
	`, userID)

	if err != nil {
		http.Error(w, "Unable to load recent interviews", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	recentInterviews := []map[string]interface{}{}

	for rows.Next() {
		var id int
		var jobRole, interviewType, difficulty string
		var score int
		var createdAt interface{}

		err := rows.Scan(
			&id,
			&jobRole,
			&interviewType,
			&difficulty,
			&score,
			&createdAt,
		)

		if err != nil {
			http.Error(w, "Unable to read interview data", http.StatusInternalServerError)
			return
		}

		recentInterviews = append(recentInterviews, map[string]interface{}{
			"id":             id,
			"interview_id":   id,
			"job_role":       jobRole,
			"interview_type": interviewType,
			"difficulty":     difficulty,
			"score":          score,
			"created_at":     createdAt,
		})
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Unable to read interview data", http.StatusInternalServerError)
		return
	}

	// Score trend: 10 most recent interviews, oldest first
	trendRows, err := db.Query(`
		SELECT id, score, created_at
		FROM (
			SELECT id, score, created_at
			FROM interviews
			WHERE user_id = $1
			ORDER BY created_at DESC
			LIMIT 10
		) AS recent
		ORDER BY created_at ASC
	`, userID)

	if err != nil {
		http.Error(w, "Unable to load score trend", http.StatusInternalServerError)
		return
	}
	defer trendRows.Close()

	scoreTrend := []map[string]interface{}{}

	for trendRows.Next() {
		var id, score int
		var createdAt interface{}

		err := trendRows.Scan(&id, &score, &createdAt)
		if err != nil {
			http.Error(w, "Unable to read score trend", http.StatusInternalServerError)
			return
		}

		scoreTrend = append(scoreTrend, map[string]interface{}{
			"interview_id": id,
			"score":        score,
			"created_at":   createdAt,
		})
	}

	if err := trendRows.Err(); err != nil {
		http.Error(w, "Unable to read score trend", http.StatusInternalServerError)
		return
	}

	// Average score by interview type
	typeRows, err := db.Query(`
		SELECT
			interview_type,
			COUNT(*),
			COALESCE(AVG(score), 0)
		FROM interviews
		WHERE user_id = $1
		GROUP BY interview_type
		ORDER BY interview_type
	`, userID)

	if err != nil {
		http.Error(w, "Unable to load interview type statistics", http.StatusInternalServerError)
		return
	}
	defer typeRows.Close()

	typePerformance := []map[string]interface{}{}

	for typeRows.Next() {
		var interviewType string
		var count int
		var avgScore float64

		err := typeRows.Scan(&interviewType, &count, &avgScore)
		if err != nil {
			http.Error(w, "Unable to read interview type statistics", http.StatusInternalServerError)
			return
		}

		typePerformance = append(typePerformance, map[string]interface{}{
			"interview_type":  interviewType,
			"interview_count": count,
			"average_score":   avgScore,
		})
	}

	if err := typeRows.Err(); err != nil {
		http.Error(w, "Unable to read interview type statistics", http.StatusInternalServerError)
		return
	}

	// Recommendations based on actual interview scores
	recommendations := []string{}

	if totalInterviews == 0 {
		recommendations = append(
			recommendations,
			"Complete your first mock interview to start tracking your performance.",
		)
	} else {
		if averageScore < 60 {
			recommendations = append(
				recommendations,
				"Review fundamental concepts and practise explaining answers clearly.",
			)
		} else if averageScore < 80 {
			recommendations = append(
				recommendations,
				"Keep practising and explain technical concepts with examples.",
			)
		} else {
			recommendations = append(
				recommendations,
				"Your average score is strong. Practise advanced questions to maintain progress.",
			)
		}

		if totalInterviews < 5 {
			recommendations = append(
				recommendations,
				"Complete more mock interviews to build consistency and confidence.",
			)
		}

		if len(scoreTrend) >= 2 {
			firstScore := scoreTrend[0]["score"].(int)
			lastScore := scoreTrend[len(scoreTrend)-1]["score"].(int)

			if lastScore > firstScore {
				recommendations = append(
					recommendations,
					"Your recent score is higher than your earliest score in this chart. Keep it up!",
				)
			} else if lastScore < firstScore {
				recommendations = append(
					recommendations,
					"Your recent score is lower than your earliest score in this chart. Review recent answers and practise weaker topics.",
				)
			} else {
				recommendations = append(
					recommendations,
					"Your scores are level across the selected interviews. Practise varied questions to improve further.",
				)
			}
		}
	}

	// Final API response
	response := map[string]interface{}{
		"total_interviews":  totalInterviews,
		"average_score":     averageScore,
		"best_score":        bestScore,
		"recent_interviews": recentInterviews,
		"score_trend":       scoreTrend,
		"type_performance":  typePerformance,
		"recommendations":   recommendations,
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		return
	}
}
