export interface QuizOptions {
  numberOfQuestions?: number
}

export interface FlashcardOptions {
  numberOfCards?: number
}

export interface GeneratedQuizItem {
  question: string
  options: string[]
  bonne_reponse: string
  explication: string
}

export interface GeneratedFlashcard {
  recto: string
  verso: string
}

export interface LLMProvider {
  generateQuiz(courseText: string, options?: QuizOptions): Promise<GeneratedQuizItem[]>
  generateFlashcards(courseText: string, options?: FlashcardOptions): Promise<GeneratedFlashcard[]>
}
