# 🤖 MockMate AI – AI-Powered Mock Interview Platform

MockMate AI is an AI-powered mock interview platform designed to help students and job seekers prepare for technical and HR interviews. It generates interview questions, evaluates user responses using AI, provides personalized feedback, and tracks interview performance.

The platform combines a modern web interface, a Go backend, PostgreSQL database, and Google's Gemini API to deliver an interactive interview preparation experience.

## ✨ Features

- **AI-Powered Interviews:** Generate interview questions based on job roles, interview types, and difficulty levels.
- **Multiple Interview Types:** Practice Technical, HR, and Mixed interviews.
- **Answer Evaluation:** Receive AI-generated scores, feedback, and improvement suggestions.
- **Performance Dashboard:** Track interview scores, progress, and performance analytics.
- **Interview History:** View completed interviews and revisit individual interview reviews.
- **Resume Analyzer:** Upload PDF or DOCX resumes for AI-powered analysis.
- **ATS Score Analysis:** Evaluate resume quality and identify missing skills.
- **Personalized Recommendations:** Get suggestions to improve interview and resume performance.
- **User Authentication:** Register and log in to access the platform.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js, React.js, TypeScript |
| Styling | Tailwind CSS |
| Backend | Go (Golang) |
| Database | PostgreSQL |
| AI Integration | Google Gemini API |
| Resume Processing | PDF and DOCX parsing |
| Development Tools | VS Code, Git, GitHub |

## 📸 Screenshots

Add screenshots of your application in the `docs/screenshots/` folder.

Suggested screenshots:

| Page | Screenshot |
|---|---|
| Home Page | `home.png` |
| Login / Register | `login.png` |
| Dashboard | `dashboard.png` |
| Interview Setup | `interview-setup.png` |
| Interview Results | `results.png` |
| Resume Analyzer | `resume-analyzer.png` |

Once you add the images, display them using:

```markdown
![Home Page](docs/screenshots/home.png)
```

## 📁 Project Structure

```text
MOCK MATE AI/
│
├── backend/
│   ├── main.go
│   ├── auth.go
│   ├── dashboard.go
│   ├── db.go
│   ├── gemini.go
│   ├── interview.go
│   ├── login.go
│   ├── register.go
│   ├── resume.go
│   └── go.mod
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

- Go
- Node.js and npm
- PostgreSQL
- Git
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/kowsalyaS28/MockMate-AI.git
cd MockMate-AI
```

### 2. Configure the Backend

```bash
cd backend
```

Install Go dependencies:

```bash
go mod download
```

Configure your environment variables for the Gemini API key and PostgreSQL database connection according to the backend configuration.

Make sure your PostgreSQL server is running and the required database has been created.

Start the backend:

```bash
go run .
```

Backend runs at:

```text
http://localhost:8080
```

### 3. Configure the Frontend

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

### 4. Open the Application

Visit the following address in your browser:

```text
http://localhost:3000
```

Make sure both the frontend and backend servers are running.

## 🔐 Environment Variables

Keep API keys, database credentials, and other secrets in local environment files.

**Important:** Never upload your `.env` files or API keys to GitHub.

## 🚀 Future Enhancements

- Voice-based mock interviews.
- Real-time speech analysis.
- Emotion and confidence analysis.
- Advanced AI interview recommendations.
- More detailed career progress tracking.

## 👩‍💻 Developer

**Kowsalya S.**

- GitHub: [@kowsalyaS28](https://github.com/kowsalyaS28)
- Project: [MockMate AI](https://github.com/kowsalyaS28/MockMate-AI)

## 📄 License

This project is developed for educational and placement preparation purposes.
