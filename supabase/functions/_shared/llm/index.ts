import type { LLMProvider } from "./types"
import { geminiProvider } from "./providers/gemini"
import { groqProvider } from "./providers/groq"
import { ollamaProvider } from "./providers/ollama"

export type { LLMProvider, QuizOptions, FlashcardOptions, GeneratedQuizItem, GeneratedFlashcard } from "./types"

const providers: Record<string, LLMProvider> = {
  gemini: geminiProvider,
  groq: groqProvider,
  ollama: ollamaProvider,
}

export function getLLMProvider(): LLMProvider {
  const name = Deno.env.get("LLM_PROVIDER") ?? "gemini"
  const provider = providers[name]
  if (!provider) {
    throw new Error(
      `Unknown LLM provider "${name}". Available: ${Object.keys(providers).join(", ")}`
    )
  }
  return provider
}
