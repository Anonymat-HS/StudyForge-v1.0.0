import type { LLMProvider, QuizOptions, FlashcardOptions, GeneratedQuizItem, GeneratedFlashcard } from "../types"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

function getApiKey(): string {
  const key = Deno.env.get("GROQ_API_KEY")
  if (!key) throw new Error("GROQ_API_KEY not set")
  return key
}

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 8192,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error: ${res.status} - ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ""
}

function parseJsonArray<T>(text: string): T[] {
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error("LLM response is not a valid JSON array")
  return JSON.parse(match[0]) as T[]
}

const QUIZ_PROMPT = (n: number, text: string) => `Tu es un générateur de quiz pédagogique. À partir du texte de cours suivant, génère ${n} questions à choix multiples (QCM).

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
${text}`

const FLASHCARD_PROMPT = (n: number, text: string) => `Tu es un générateur de flashcards de révision. À partir du texte de cours suivant, génère ${n} flashcards (recto = question/concept court, verso = réponse/définition claire).

Règles :
- Recto court et précis (une question ou un terme clé)
- Verso concis mais complet (pas de blabla)
- Réponds UNIQUEMENT en JSON valide, format :
[
  { "recto": "...", "verso": "..." }
]

Texte du cours :
${text}`

export const groqProvider: LLMProvider = {
  async generateQuiz(courseText: string, options?: QuizOptions): Promise<GeneratedQuizItem[]> {
    const n = options?.numberOfQuestions ?? 10
    const prompt = QUIZ_PROMPT(n, courseText)
    const response = await callGroq(prompt)
    return parseJsonArray<GeneratedQuizItem>(response)
  },

  async generateFlashcards(courseText: string, options?: FlashcardOptions): Promise<GeneratedFlashcard[]> {
    const n = options?.numberOfCards ?? 15
    const prompt = FLASHCARD_PROMPT(n, courseText)
    const response = await callGroq(prompt)
    return parseJsonArray<GeneratedFlashcard>(response)
  },
}
