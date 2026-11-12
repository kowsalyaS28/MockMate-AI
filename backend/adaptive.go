package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// AdaptiveQuestionRequest represents a request to generate an interview question.
type AdaptiveQuestionRequest struct {
	JobRole          string `json:"job_role"`
	InterviewType    string `json:"interview_type"`
	Difficulty       string `json:"difficulty"`
	PreviousQuestion string `json:"previous_question"`
	PreviousAnswer   string `json:"previous_answer"`
	PreviousScore    int    `json:"previous_score"`
	QuestionNumber   int    `json:"question_number"`
}

// AdaptiveQuestionResponse represents the generated interview question.
type AdaptiveQuestionResponse struct {
	Question            string `json:"question"`
	Difficulty          string `json:"difficulty"`
	Reason              string `json:"reason"`
	PreviousAnswerScore int    `json:"previous_answer_score"`
}

// adaptiveQuestionHandler generates the first question and subsequent
// adaptive questions using Gemini.
func adaptiveQuestionHandler(w http.ResponseWriter, r *http.Request) {
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

	var request AdaptiveQuestionRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	request.JobRole = strings.TrimSpace(request.JobRole)
	request.InterviewType = strings.TrimSpace(request.InterviewType)
	request.Difficulty = strings.ToLower(strings.TrimSpace(request.Difficulty))
	request.PreviousQuestion = strings.TrimSpace(request.PreviousQuestion)
	request.PreviousAnswer = strings.TrimSpace(request.PreviousAnswer)

	if request.JobRole == "" ||
		request.InterviewType == "" ||
		request.Difficulty == "" {
		http.Error(
			w,
			"Job role, interview type, and difficulty are required",
			http.StatusBadRequest,
		)
		return
	}

	switch request.Difficulty {
	case "beginner", "intermediate", "advanced":
		// Valid difficulty.
	default:
		http.Error(
			w,
			"Difficulty must be beginner, intermediate, or advanced",
			http.StatusBadRequest,
		)
		return
	}

	if request.PreviousScore < 0 || request.PreviousScore > 100 {
		http.Error(
			w,
			"Previous score must be between 0 and 100",
			http.StatusBadRequest,
		)
		return
	}

	if request.QuestionNumber < 1 {
		http.Error(
			w,
			"Question number must be positive",
			http.StatusBadRequest,
		)
		return
	}

	// Every question after the first must have a previous question and answer.
	if request.QuestionNumber > 1 {
		if request.PreviousQuestion == "" || request.PreviousAnswer == "" {
			http.Error(
				w,
				"Previous question and answer are required for adaptive questions",
				http.StatusBadRequest,
			)
			return
		}
	}

	// Keep the selected difficulty for the first question.
	// Adapt the difficulty only for subsequent questions.
	nextDifficulty := request.Difficulty

	if request.QuestionNumber > 1 {
		switch {
		case request.PreviousScore >= 80:
			nextDifficulty = increaseDifficulty(nextDifficulty)

		case request.PreviousScore < 50:
			nextDifficulty = decreaseDifficulty(nextDifficulty)

		default:
			// Scores from 50 to 79 keep the same difficulty.
		}
	}

	var prompt string

	if request.QuestionNumber == 1 {
		// Generate the first question without requiring a previous answer.
		prompt = fmt.Sprintf(`
You are an expert AI interviewer for the MockMate AI platform.

Candidate's job role: %s
Interview type: %s
Selected difficulty: %s
Question number: 1

Generate exactly ONE opening interview question.

Requirements:
- Match the candidate's job role and interview type.
- Follow the selected difficulty.
- For Technical interviews, ask a relevant technical question.
- For HR interviews, ask a relevant human-resources or behavioral question.
- For Mixed interviews, choose an appropriate interview question.
- Make the question clear and suitable for a real job interview.
- Do not include an answer or explanation in the question.
- Do not ask multiple questions at once.
- Return only valid JSON in this format:
{
  "question": "Your interview question",
  "reason": "Brief explanation of why this question suits the selected difficulty"
}
`, request.JobRole, request.InterviewType, nextDifficulty)
	} else {
		// Generate a new question based on the candidate's previous performance.
		prompt = fmt.Sprintf(`
You are an adaptive AI interviewer for the MockMate AI platform.

Candidate's job role: %s
Interview type: %s
Previous difficulty: %s
Next question difficulty: %s
Question number: %d

Previous question:
%s

Candidate's previous answer:
%s

Previous answer score: %d/100

Generate exactly ONE new interview question.

Requirements:
- Match the candidate's job role and interview type.
- Follow the next question difficulty.
- If the previous score was 80 or higher, increase the challenge where appropriate.
- If the previous score was below 50, focus on fundamental concepts.
- If the previous score was between 50 and 79, maintain a similar level.
- Do not repeat the previous question.
- Use the previous answer to guide the next question when appropriate.
- Ask only one clear question.
- Do not provide the answer.
- Return only valid JSON in this format:
{
  "question": "Your new interview question",
  "reason": "Brief explanation of why this question suits the selected difficulty and previous performance"
}
`,
			request.JobRole,
			request.InterviewType,
			request.Difficulty,
			nextDifficulty,
			request.QuestionNumber,
			request.PreviousQuestion,
			request.PreviousAnswer,
			request.PreviousScore,
		)
	}

	requestBody := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{"text": prompt},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"responseMimeType": "application/json",
		},
	}

	body, err := json.Marshal(requestBody)
	if err != nil {
		http.Error(
			w,
			"Failed to prepare AI request",
			http.StatusInternalServerError,
		)
		return
	}

	apiKey := strings.TrimSpace(os.Getenv("GEMINI_API_KEY"))

	if apiKey == "" {
		http.Error(
			w,
			"Gemini API key is not configured",
			http.StatusInternalServerError,
		)
		return
	}

	apiURL := "https://generativelanguage.googleapis.com/v1beta/models/" +
		geminiModel + ":generateContent"

	req, err := http.NewRequest(
		http.MethodPost,
		apiURL,
		bytes.NewReader(body),
	)
	if err != nil {
		http.Error(
			w,
			"Failed to create AI request",
			http.StatusInternalServerError,
		)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-goog-api-key", apiKey)

	client := &http.Client{
		Timeout: 45 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Gemini connection failed: %v\n", err)
		http.Error(
			w,
			"Failed to connect to Gemini",
			http.StatusBadGateway,
		)
		return
	}
	defer resp.Body.Close()

	responseBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(
			w,
			"Failed to read AI response",
			http.StatusBadGateway,
		)
		return
	}

	if resp.StatusCode != http.StatusOK {
		fmt.Printf(
			"Adaptive question Gemini error: %s\n",
			string(responseBytes),
		)
		http.Error(
			w,
			"Gemini could not generate the interview question",
			http.StatusBadGateway,
		)
		return
	}

	var geminiResponse struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.Unmarshal(responseBytes, &geminiResponse); err != nil {
		http.Error(
			w,
			"Invalid Gemini response",
			http.StatusBadGateway,
		)
		return
	}

	if len(geminiResponse.Candidates) == 0 ||
		len(geminiResponse.Candidates[0].Content.Parts) == 0 {
		http.Error(
			w,
			"Gemini returned no question",
			http.StatusBadGateway,
		)
		return
	}

	var generated struct {
		Question string `json:"question"`
		Reason   string `json:"reason"`
	}

	generatedText := geminiResponse.Candidates[0].Content.Parts[0].Text

	if err := json.Unmarshal([]byte(generatedText), &generated); err != nil {
		fmt.Printf("Could not parse Gemini question: %v\n", err)
		http.Error(
			w,
			"Could not parse generated question",
			http.StatusBadGateway,
		)
		return
	}

	generated.Question = strings.TrimSpace(generated.Question)
	generated.Reason = strings.TrimSpace(generated.Reason)

	if generated.Question == "" {
		http.Error(
			w,
			"Generated question was empty",
			http.StatusBadGateway,
		)
		return
	}

	response := AdaptiveQuestionResponse{
		Question:            generated.Question,
		Difficulty:          nextDifficulty,
		Reason:              generated.Reason,
		PreviousAnswerScore: request.PreviousScore,
	}

	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		fmt.Printf("Failed to send adaptive question response: %v\n", err)
	}
}

// increaseDifficulty moves to the next difficulty level.
func increaseDifficulty(difficulty string) string {
	switch strings.ToLower(difficulty) {
	case "beginner":
		return "intermediate"

	case "intermediate":
		return "advanced"

	default:
		return "advanced"
	}
}

// decreaseDifficulty moves to the previous difficulty level.
func decreaseDifficulty(difficulty string) string {
	switch strings.ToLower(difficulty) {
	case "advanced":
		return "intermediate"

	case "intermediate":
		return "beginner"

	default:
		return "beginner"
	}
}

// AnswerEvaluationRequest represents an answer submitted for evaluation.
type AnswerEvaluationRequest struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

// evaluateInterviewAnswerHandler evaluates one answer immediately using Gemini.
func evaluateInterviewAnswerHandler(w http.ResponseWriter, r *http.Request) {
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

	var request AnswerEvaluationRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(
			w,
			"Invalid request body",
			http.StatusBadRequest,
		)
		return
	}

	request.Question = strings.TrimSpace(request.Question)
	request.Answer = strings.TrimSpace(request.Answer)

	if request.Question == "" {
		http.Error(
			w,
			"Question is required",
			http.StatusBadRequest,
		)
		return
	}

	if request.Answer == "" {
		http.Error(
			w,
			"Answer is required",
			http.StatusBadRequest,
		)
		return
	}

	evaluation, err := evaluateAnswer(request.Question, request.Answer)
	if err != nil {
		fmt.Printf("Answer evaluation failed: %v\n", err)
		http.Error(
			w,
			"AI evaluation failed",
			http.StatusBadGateway,
		)
		return
	}

	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(evaluation); err != nil {
		fmt.Printf("Failed to send evaluation response: %v\n", err)
	}
}
