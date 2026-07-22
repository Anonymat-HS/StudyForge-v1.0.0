export interface Course {
  id: string;
  user_id: string;
  titre: string;
  texte_extrait: string;
  created_at: string;
}

export interface QuizItem {
  id: string;
  course_id: string;
  question: string;
  options: string[];
  bonne_reponse: string;
  explication: string | null;
  created_at: string;
}

export interface Flashcard {
  id: string;
  course_id: string;
  recto: string;
  verso: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  quiz_id: string;
  correct: boolean | null;
  tentatives: number;
  last_reviewed: string;
}

export interface FlashcardProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  niveau: "nouveau" | "difficile" | "bien" | "facile";
  last_reviewed: string;
  next_review: string | null;
}

export interface QuizOptions {
  numberOfQuestions?: number;
}

export interface FlashcardOptions {
  numberOfCards?: number;
}
