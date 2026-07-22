# 🧠 StudyForge

> Upload your course notes, get AI-generated quizzes & flashcards instantly.

StudyForge turns any course material (PDF or plain text) into active revision tools: auto-generated multiple-choice quizzes and flashcards powered by an LLM, with spaced-repetition-style progress tracking.

Born out of a personal need — revising my own networking, Java, and API development coursework as a first-year CS student — StudyForge is designed to grow into a tool usable by any student or institution.

## ✨ Features

- 📄 Upload course material (PDF or plain text)
- 🎯 Auto-generated multiple-choice quizzes with explanations
- 🃏 Auto-generated flashcards (front/back)
- 📊 Progress tracking and revision statistics
- 🔌 Swappable LLM provider (Gemini, Groq, Ollama...)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes
- **Database & Auth**: Supabase
- **AI**: Swappable LLM provider via an abstraction layer (`lib/llm/`)
- **PDF Parsing**: `pdf-parse`

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/studyforge.git
cd studyforge
npm install
cp .env.example .env.local  # configure Supabase + LLM API key
npm run dev
```

## 📖 Project Context

See [`PROJECT.md`](./PROJECT.md) for the full architecture, database schema, LLM prompts, and roadmap.

## 📝 License

MIT
