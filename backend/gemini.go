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

// Use a model name supported by your Gemini API key.
const geminiModel = "gemini-3.5-flash-lite"

type GeminiEvaluation struct {
	Score    int    `json:"score"`
	Feedback string `json:"feedback"`
}

func evaluateAnswer(question, answer string) (GeminiEvaluation, error) {
	question = strings.TrimSpace(question)
	answer = strings.TrimSpace(answer)

	if question == "" {
		return GeminiEvaluation{}, fmt.Errorf(
			"question cannot be empty",
		)
	}

	if answer == "" {
		return GeminiEvaluation{
			Score:    0,
			Feedback: "No answer provided. Try answering this question.",
		}, nil
	}

	apiKey := strings.TrimSpace(os.Getenv("GEMINI_API_KEY"))

	if apiKey == "" {
		return GeminiEvaluation{}, fmt.Errorf(
			"GEMINI_API_KEY is not configured",
		)
	}

	prompt := fmt.Sprintf(`
You are an experienced technical interviewer evaluating a candidate.

Question:
%s

Candidate's answer:
%s

Evaluate the answer fairly based on:
1. Technical correctness
2. Relevance
3. Clarity
4. Completeness

Return only valid JSON in this exact format:
{
  "score": 75,
  "feedback": "Explain what was correct and what could be improved."
}

Rules:
- Score must be an integer between 0 and 100.
- Be fair and constructive.
- Give specific, beginner-friendly improvement suggestions.
- Do not reward an answer simply because it is long.
- Do not include Markdown code fences.
`, question, answer)

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
		return GeminiEvaluation{}, fmt.Errorf(
			"could not create Gemini request: %w", err,
		)
	}

	apiURL := "https://generativelanguage.googleapis.com/v1beta/models/" +
		geminiModel + ":generateContent"

	client := &http.Client{
		Timeout: 45 * time.Second,
	}

	// Retry temporary server and rate-limit errors.
	delays := []time.Duration{
		0,
		2 * time.Second,
		5 * time.Second,
	}

	var lastError error

	for attempt, delay := range delays {
		if delay > 0 {
			time.Sleep(delay)
		}

		req, err := http.NewRequest(
			http.MethodPost,
			apiURL,
			bytes.NewReader(body),
		)
		if err != nil {
			return GeminiEvaluation{}, fmt.Errorf(
				"could not create Gemini request: %w", err,
			)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("x-goog-api-key", apiKey)
		resp, err := client.Do(req)

		if err != nil {
			lastError = fmt.Errorf(
				"Gemini network request failed: %w", err,
			)

			if attempt < len(delays)-1 {
				continue
			}

			break
		}

		responseBytes, readErr := io.ReadAll(resp.Body)
		statusCode := resp.StatusCode
		resp.Body.Close()

		if readErr != nil {
			return GeminiEvaluation{}, fmt.Errorf(
				"could not read Gemini response: %w", readErr,
			)
		}

		if statusCode != http.StatusOK {
			apiError := fmt.Errorf(
				"Gemini API returned status %d: %s",
				statusCode,
				string(responseBytes),
			)

			// Retry temporary failures only.
			retryable := statusCode == http.StatusTooManyRequests ||
				statusCode == http.StatusBadGateway ||
				statusCode == http.StatusServiceUnavailable ||
				statusCode == http.StatusGatewayTimeout ||
				statusCode >= 500

			if retryable {
				lastError = apiError

				if attempt < len(delays)-1 {
					continue
				}

				break
			}

			// Report invalid keys, models, and requests immediately.
			return GeminiEvaluation{}, apiError
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

		if err := json.Unmarshal(
			responseBytes,
			&geminiResponse,
		); err != nil {
			return GeminiEvaluation{}, fmt.Errorf(
				"could not parse Gemini response: %w", err,
			)
		}

		if len(geminiResponse.Candidates) == 0 ||
			len(geminiResponse.Candidates[0].Content.Parts) == 0 {
			return GeminiEvaluation{}, fmt.Errorf(
				"Gemini returned no evaluation",
			)
		}

		evaluationText :=
			geminiResponse.Candidates[0].Content.Parts[0].Text

		var evaluation GeminiEvaluation

		if err := json.Unmarshal(
			[]byte(evaluationText),
			&evaluation,
		); err != nil {
			return GeminiEvaluation{}, fmt.Errorf(
				"could not parse evaluation JSON: %w", err,
			)
		}

		if evaluation.Score < 0 || evaluation.Score > 100 {
			return GeminiEvaluation{}, fmt.Errorf(
				"Gemini returned an invalid score",
			)
		}

		if strings.TrimSpace(evaluation.Feedback) == "" {
			return GeminiEvaluation{}, fmt.Errorf(
				"Gemini returned empty feedback",
			)
		}

		return evaluation, nil
	}

	if lastError == nil {
		lastError = fmt.Errorf("unknown Gemini API failure")
	}

	return GeminiEvaluation{}, fmt.Errorf(
		"Gemini request failed after retries: %w",
		lastError,
	)
}
