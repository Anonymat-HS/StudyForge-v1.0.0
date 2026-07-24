import type { LLMProvider, QuizOptions, FlashcardOptions, GeneratedQuizItem, GeneratedFlashcard } from "../types"

function truncateText(text: string, maxWords = 6000): string {
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text
  const half = Math.floor(maxWords / 2)
  const firstPart = words.slice(0, half).join(" ")
  const lastPart = words.slice(-half).join(" ")
  const omitted = words.length - maxWords
  return `${firstPart}\n\n[... ${omitted} words truncated — keeping essential introduction and conclusion ...]\n\n${lastPart}`
}

function getOllamaUrl(): string {
  return Deno.env.get("OLLAMA_URL") ?? "http://localhost:11434"
}

async function callOllama(prompt: string): Promise<string> {
  const res = await fetch(`${getOllamaUrl()}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.1",
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 3000,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Ollama API error: ${res.status} - ${err}`)
  }

  const data = await res.json()
  return data.response ?? ""
}

function parseJsonArray<T>(text: string): T[] {
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error("LLM response is not a valid JSON array")
  return JSON.parse(match[0]) as T[]
}

const QUIZ_PROMPT = (n: number, text: string) => {
  const truncated = truncateText(text)
  return `Tu es un générateur de quiz pédagogique. À partir du texte de cours suivant, génère ${n} questions à choix multiples (QCM).

Règles :
- Chaque question doit tester la compréhension, pas juste la mémorisation pure
- 4 options par question, une seule correcte
- Ajoute une courte explication (1-2 phrases) justifiant la bonne réponse
- Réponds UNIQUEMENT en JSON valide, sans texte avant/après, format :
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "bonne_reponse": "...",
    "explication": "..."
  }
]

Texte du cours :
${truncated}`
}

const FLASHCARD_PROMPT = (n: number, text: string) => {
  const truncated = truncateText(text)
  return `Tu es un générateur de flashcards de révision. À partir du texte de cours suivant, génère ${n} flashcards (recto = question/concept court, verso = réponse/définition claire).

Règles :
- Recto court et précis (une question ou un terme clé)
- Verso concis mais complet (pas de blabla)
- Réponds UNIQUEMENT en JSON valide, format :
[
  { "recto": "...", "verso": "..." }
]

Texte du cours :
${truncated}`
}

export const ollamaProvider: LLMProvider = {
  async generateQuiz(courseText: string, options?: QuizOptions): Promise<GeneratedQuizItem[]> {
    const n = options?.numberOfQuestions ?? 10
    const prompt = QUIZ_PROMPT(n, courseText)
    const response = await callOllama(prompt)
    return parseJsonArray<GeneratedQuizItem>(response)
  },

  async generateFlashcards(courseText: string, options?: FlashcardOptions): Promise<GeneratedFlashcard[]> {
    const n = options?.numberOfCards ?? 15
    const prompt = FLASHCARD_PROMPT(n, courseText)
    const response = await callOllama(prompt)
    return parseJsonArray<GeneratedFlashcard>(response)
  },
}