# StudyForge

> Turn your course material into AI-generated quizzes and flashcards for active learning.

StudyForge is an AI-powered study tool that transforms course notes, slides, and documents into interactive revision resources. It solves the problem of passive, time-consuming revision by automating the creation of practice materials and pushing students towards active recall — the method proven to be most effective for long-term retention. 

Born out of a personal need — revising networking, Java, and API development coursework as a first-year CS student — StudyForge is designed to grow into a tool usable by any student or institution.

## Features

- **Upload course material** (PDF, TXT, or Markdown) to generate study resources
- **AI-generated quizzes** with multiple-choice questions and explanations
- **AI-generated flashcards** with spaced-repetition rating (new/hard/good/easy)
- **Active recall practice** through interactive quiz and flashcard sessions
- **Progress tracking** — streak, average score, course breakdown, and weekly activity
- **Personal dashboard** to organize and access all generated courses and resources
- **User profiles & authentication** with Supabase Auth
- **Swappable LLM provider** — Gemini, Groq (default), or Ollama
- **Dark mode UI** with violet accent theme
- **Responsive** — works seamlessly on mobile and desktop
- **Freemium-ready** — question/card limits per plan

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 + TypeScript + Tailwind CSS v4 |
| UI Icons | Lucide React |
| Charts | Recharts |
| Routing | Local screen state (no router) |
| Backend | Supabase Edge Functions (Deno) |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| AI / LLM | Groq API (`llama-3.3-70b-versatile`) via abstraction layer (Gemini, Groq, Ollama) |
| PDF Parsing | `unpdf` (Deno-compatible) |

## Project Structure

```
src/
  App.tsx                # Main app with routing/state and auth flow
  main.tsx               # React entry point
  index.css              # Global styles and Tailwind CSS import
  pages/                 # Screen components (Landing, Login, Signup, CompleteProfile, Dashboard, Upload, Quiz, Flashcards, Progress, Profile)
  components/
    layout/              # Layout chrome (Sidebar, AvatarMenu)
  hooks/                 # Shared hooks (useUserStats)
  lib/
    api/                 # Typed data-access layer (only place that queries Supabase tables)
    supabase/            # Client, auth context (useAuth), edge-function calls
    types.ts             # Shared TypeScript interfaces
    utils/               # Pure helpers (quotes, streak stats)

supabase/
  schema.sql             # Full DB schema + RLS + indexes
  functions/
    extract-course/      # PDF/TXT/MD → text extraction
    generate-quiz/       # LLM → quiz questions → DB
    generate-flashcards/ # LLM → flashcards → DB
    _shared/llm/         # LLM abstraction (Gemini, Groq, Ollama providers)
```

## How It Works

1. **Upload** – Students upload their course material (PDF, TXT, or Markdown) through the Upload screen.
2. **Extract & Generate** – Supabase Edge Functions extract the content and use an LLM to automatically generate quizzes and flashcards.
3. **Practice Actively** – Students practice using the Quiz and Flashcards interfaces, engaging in active recall rather than passive reading.
4. **Track Progress** – The Progress dashboard and `useUserStats` hook track streaks, scores, and performance across courses to keep students motivated.

## Getting Started

```bash
git clone https://github.com/Anonymat-HS/StudyForge-v1.0.0.git
cd StudyForge
pnpm install
cp .env.example .env
# Configure VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, LLM_PROVIDER, GROQ_API_KEY
pnpm dev
```

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Deploy Edge Functions via the Supabase Dashboard
4. Set secrets: `LLM_PROVIDER=groq`, `GROQ_API_KEY=<your-key>`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `LLM_PROVIDER` | `gemini`, `groq`, or `ollama` |
| `GROQ_API_KEY` | Groq API key (if using Groq) |
| `GEMINI_API_KEY` | Gemini API key (if using Gemini) |
| `OLLAMA_BASE_URL` | Ollama endpoint (if using Ollama) |

## Project Context

See [`PROJECT.md`](./PROJECT.md) for the full architecture, database schema, LLM prompts, freemium plans, and detailed roadmap.

See [`ROADMAP.md`](./ROADMAP.md) for the development progress tracker.

## License

MIT
