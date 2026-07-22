import type { LLMProvider, QuizOptions, FlashcardOptions, GeneratedQuizItem, GeneratedFlashcard } from "../types"

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

function getApiKey(): string {
  const key = Deno.env.get("GEMINI_API_KEY")
  if (!key) throw new Error("GEMINI_API_KEY not set")
  return key
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(`${GEMINI_API_URL}?key=${getApiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error: ${res.status} - ${err}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
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

export const geminiProvider: LLMProvider = {
  async generateQuiz(courseText: string, options?: QuizOptions): Promise<GeneratedQuizItem[]> {
    const n = options?.numberOfQuestions ?? 10
    const prompt = QUIZ_PROMPT(n, courseText)
    const response = await callGemini(prompt)
    return parseJsonArray<GeneratedQuizItem>(response)
  },

  async generateFlashcards(courseText: string, options?: FlashcardOptions): Promise<GeneratedFlashcard[]> {
    const n = options?.numberOfCards ?? 15
    const prompt = FLASHCARD_PROMPT(n, courseText)
    const response = await callGemini(prompt)
    return parseJsonArray<GeneratedFlashcard>(response)
  },
}
