# StudyForge

> Upload your course notes, get AI-generated quizzes & flashcards instantly.

StudyForge turns any course material (PDF or plain text) into active revision tools: auto-generated multiple-choice quizzes and flashcards powered by an LLM, with spaced-repetition-style progress tracking.

Born out of a personal need — revising my own networking, Java, and API development coursework as a first-year CS student — StudyForge is designed to grow into a tool usable by any student or institution.

## Features

- **Upload** course material (PDF, TXT, or Markdown)
- **Auto-generated quizzes** with multiple-choice questions and explanations
- **Auto-generated flashcards** with spaced-repetition rating (new/hard/good/easy)
- **Progress tracking** — streak, avg score, course breakdown, weekly activity
- **Swappable LLM provider** — Gemini, Groq (default), or Ollama
- **Dark mode UI** with violet accent theme
- **Responsive** — works on mobile and desktop
- **Freemium-ready** — question/card limits per plan

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind CSS v4 |
| UI Icons | Lucide React |
| Charts | Recharts |
| Backend | Supabase Edge Functions (Deno) |
| Database & Auth | Supabase (PostgreSQL + RLS) |
| AI / LLM | Groq API (`llama-3.3-70b-versatile`) via abstraction layer |
| PDF Parsing | `unpdf` (Deno-compatible) |

## Project Structure

```
src/
  screens/        # Login, Signup, CompleteProfile, Dashboard, Upload, Quiz, Flashcards, Progress
  lib/
    supabase/     # Client, auth hook
    types.ts      # Shared TypeScript interfaces
  data/           # Quotes
supabase/
  schema.sql      # Full DB schema + RLS + indexes
  functions/
    extract-course/         # PDF/TXT/MD → text extraction
    generate-quiz/          # LLM → quiz questions → DB
    generate-flashcards/    # LLM → flashcards → DB
    _shared/llm/            # LLM abstraction (Gemini, Groq, Ollama providers)
```

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
