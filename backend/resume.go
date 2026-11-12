package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/ledongthuc/pdf"
	"github.com/nguyenthenguyen/docx"
)

const maxResumeSize = 5 << 20 // 5 MB

type ResumeAnalysis struct {
	ATSScore      int      `json:"ats_score"`
	Summary       string   `json:"summary"`
	Strengths     []string `json:"strengths"`
	MissingSkills []string `json:"missing_skills"`
	MatchedSkills []string `json:"matched_skills"`
	Suggestions   []string `json:"suggestions"`
	KeywordMatch  int      `json:"keyword_match"`
}

type GeminiRequest struct {
	Contents         []GeminiContent `json:"contents"`
	GenerationConfig struct {
		ResponseMimeType string  `json:"responseMimeType"`
		Temperature      float64 `json:"temperature"`
	} `json:"generationConfig"`
}

type GeminiContent struct {
	Parts []GeminiPart `json:"parts"`
}

type GeminiPart struct {
	Text string `json:"text"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []GeminiPart `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`

	Error struct {
		Message string `json:"message"`
	} `json:"error"`
}

func resumeAnalyzeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method != http.MethodPost {
		writeResumeJSON(w, http.StatusMethodNotAllowed, map[string]string{
			"error": "Only POST requests are allowed.",
		})
		return
	}

	apiKey := strings.TrimSpace(os.Getenv("GEMINI_API_KEY"))

	if apiKey == "" {
		writeResumeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Gemini API key is missing. Check your backend .env file.",
		})
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxResumeSize+1<<20)

	err := r.ParseMultipartForm(maxResumeSize)
	if err != nil {
		writeResumeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Unable to read the upload. Keep the resume under 5 MB and try again.",
		})
		return
	}

	resumeFile, fileHeader, err := r.FormFile("resume")
	if err != nil {
		writeResumeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Please upload a PDF or DOCX resume using the 'resume' field.",
		})
		return
	}
	defer resumeFile.Close()

	if fileHeader.Size > maxResumeSize {
		writeResumeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Resume size must not exceed 5 MB.",
		})
		return
	}

	extension := strings.ToLower(filepath.Ext(fileHeader.Filename))

	if extension != ".pdf" && extension != ".docx" {
		writeResumeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Unsupported file type. Please upload a PDF or DOCX file.",
		})
		return
	}

	jobDescription := strings.TrimSpace(r.FormValue("job_description"))

	if jobDescription == "" {
		writeResumeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Please provide a job description.",
		})
		return
	}

	if len(jobDescription) > 30000 {
		writeResumeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Job description is too long. Keep it under 30,000 characters.",
		})
		return
	}

	tempFile, err := os.CreateTemp("", "mockmate-resume-*"+extension)
	if err != nil {
		writeResumeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Unable to process the uploaded file.",
		})
		return
	}

	tempPath := tempFile.Name()
	defer os.Remove(tempPath)

	_, copyErr := io.Copy(tempFile, resumeFile)
	closeErr := tempFile.Close()

	if copyErr != nil || closeErr != nil {
		writeResumeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Unable to save the uploaded resume for processing.",
		})
		return
	}

	resumeText, err := extractResumeText(tempPath, extension)

	if err != nil {
		writeResumeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Could not extract text from this resume. Please use a text-based PDF or DOCX file.",
		})
		return
	}

	resumeText = strings.TrimSpace(resumeText)

	if len(resumeText) < 50 {
		writeResumeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Very little text was found. The resume may be scanned or image-based. Please upload a text-based PDF or DOCX.",
		})
		return
	}

	if len(resumeText) > 30000 {
		resumeText = resumeText[:30000]
	}

	analysis, err := analyzeResumeWithGemini(
		apiKey,
		resumeText,
		jobDescription,
	)

	if err != nil {
		log.Println("Resume analysis error:", err)

		writeResumeJSON(w, http.StatusBadGateway, map[string]string{
			"error": "AI resume analysis failed. Please try again. Check the backend terminal for details.",
		})
		return
	}

	writeResumeJSON(w, http.StatusOK, analysis)
}

func extractResumeText(path string, extension string) (string, error) {
	switch extension {

	case ".pdf":
		file, reader, err := pdf.Open(path)
		if err != nil {
			return "", err
		}
		defer file.Close()

		textReader, err := reader.GetPlainText()
		if err != nil {
			return "", err
		}

		var buffer bytes.Buffer

		if _, err := buffer.ReadFrom(textReader); err != nil {
			return "", err
		}

		return buffer.String(), nil

	case ".docx":
		document, err := docx.ReadDocxFile(path)
		if err != nil {
			return "", err
		}
		defer document.Close()

		content := document.Editable().GetContent()

		tagPattern := regexp.MustCompile(`<[^>]*>`)
		text := tagPattern.ReplaceAllString(content, " ")

		text = strings.ReplaceAll(text, "</w:p>", "\n")
		text = html.UnescapeString(text)

		return strings.TrimSpace(text), nil

	default:
		return "", fmt.Errorf("unsupported resume file type")
	}
}

func analyzeResumeWithGemini(
	apiKey string,
	resumeText string,
	jobDescription string,
) (*ResumeAnalysis, error) {

	prompt := fmt.Sprintf(`
You are an AI resume analyzer for a job application platform.

Compare the resume against the target job description.

RESUME:
%s

JOB DESCRIPTION:
%s

Evaluate the following:
1. ATS compatibility from 0 to 100.
2. A short summary of the resume's suitability for the job.
3. Existing strengths supported by the resume.
4. Skills explicitly present in the resume that match the job.
5. Important job skills missing from the resume.
6. Actionable suggestions for improvement.
7. Keyword match percentage from 0 to 100.

Rules:
- Do not invent experience, qualifications, or skills.
- Do not reward keywords alone when the resume provides no supporting evidence.
- Be constructive, fair, and specific.
- Treat ATS compatibility as an estimate, not a guarantee of passing an actual ATS.
- Return valid JSON only, without Markdown fences.
- Use this exact JSON structure:

{
  "ats_score": 0,
  "summary": "Short assessment",
  "strengths": ["strength one"],
  "missing_skills": ["skill one"],
  "matched_skills": ["skill one"],
  "suggestions": ["suggestion one"],
  "keyword_match": 0
}
`, resumeText, jobDescription)

	var requestBody GeminiRequest

	requestBody.Contents = []GeminiContent{
		{
			Parts: []GeminiPart{
				{Text: prompt},
			},
		},
	}

	requestBody.GenerationConfig.ResponseMimeType = "application/json"
	requestBody.GenerationConfig.Temperature = 0.2

	body, err := json.Marshal(requestBody)
	if err != nil {
		return nil, err
	}

	// Try the primary model first, then fallback models.
	models := []string{
		geminiModel,
		"gemini-3.6-flash",
		"gemini-3.8-flash",
	}

	client := &http.Client{
		Timeout: 45 * time.Second,
	}

	var lastErr error

	for _, model := range models {

		endpoint := fmt.Sprintf(
			"https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent",
			model,
		)

		request, err := http.NewRequest(
			http.MethodPost,
			endpoint,
			bytes.NewReader(body),
		)

		if err != nil {
			return nil, err
		}

		request.Header.Set("Content-Type", "application/json")
		request.Header.Set("x-goog-api-key", apiKey)

		log.Printf("Trying Gemini model: %s", model)

		response, err := client.Do(request)

		if err != nil {
			lastErr = fmt.Errorf("model %s request failed: %w", model, err)
			log.Println(lastErr)
			continue
		}

		responseBody, readErr := io.ReadAll(
			io.LimitReader(response.Body, 2<<20),
		)

		statusCode := response.StatusCode
		response.Body.Close()

		if readErr != nil {
			lastErr = fmt.Errorf("model %s response read failed: %w", model, readErr)
			log.Println(lastErr)
			continue
		}

		if statusCode < 200 || statusCode >= 300 {

			lastErr = fmt.Errorf(
				"model %s returned HTTP %d: %s",
				model,
				statusCode,
				string(responseBody),
			)

			log.Println(lastErr)

			// Try another model for temporary errors or unavailable models.
			if statusCode == 404 ||
				statusCode == 429 ||
				statusCode == 500 ||
				statusCode == 502 ||
				statusCode == 503 ||
				statusCode == 504 {
				continue
			}

			return nil, lastErr
		}

		var geminiResponse GeminiResponse

		if err := json.Unmarshal(responseBody, &geminiResponse); err != nil {
			lastErr = fmt.Errorf("unable to decode Gemini response: %w", err)
			log.Println(lastErr)
			continue
		}

		if len(geminiResponse.Candidates) == 0 ||
			len(geminiResponse.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("Gemini model %s returned no analysis", model)
			log.Println(lastErr)
			continue
		}

		resultText := strings.TrimSpace(
			geminiResponse.Candidates[0].Content.Parts[0].Text,
		)

		resultText = strings.TrimPrefix(resultText, "```json")
		resultText = strings.TrimPrefix(resultText, "```")
		resultText = strings.TrimSuffix(resultText, "```")
		resultText = strings.TrimSpace(resultText)

		var analysis ResumeAnalysis

		if err := json.Unmarshal([]byte(resultText), &analysis); err != nil {
			lastErr = fmt.Errorf(
				"invalid JSON returned by model %s: %w",
				model,
				err,
			)
			log.Println(lastErr)
			continue
		}

		if analysis.ATSScore < 0 || analysis.ATSScore > 100 {
			lastErr = fmt.Errorf("invalid ATS score returned by model %s", model)
			log.Println(lastErr)
			continue
		}

		if analysis.KeywordMatch < 0 || analysis.KeywordMatch > 100 {
			lastErr = fmt.Errorf("invalid keyword match score returned by model %s", model)
			log.Println(lastErr)
			continue
		}

		if analysis.Strengths == nil {
			analysis.Strengths = []string{}
		}

		if analysis.MissingSkills == nil {
			analysis.MissingSkills = []string{}
		}

		if analysis.MatchedSkills == nil {
			analysis.MatchedSkills = []string{}
		}

		if analysis.Suggestions == nil {
			analysis.Suggestions = []string{}
		}

		log.Printf("Resume analysis completed successfully using %s", model)

		return &analysis, nil
	}

	if lastErr == nil {
		lastErr = fmt.Errorf("all Gemini models failed")
	}

	return nil, fmt.Errorf(
		"resume analysis failed after trying all Gemini models: %w",
		lastErr,
	)
}

func writeResumeJSON(
	w http.ResponseWriter,
	status int,
	data interface{},
) {
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
