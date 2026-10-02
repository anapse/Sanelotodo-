export type QuestionCategory =
  | "Cultura General"
  | "Historia"
  | "Geografía"
  | "Perú"
  | "Latinoamérica"
  | "Ciencia Cotidiana"
  | "Deportes"
  | "Entretenimiento"
  | "Vida Cotidiana"
  | string;

export type QuestionDifficulty = "easy" | "medium" | "hard" | "bonus";

export interface Question {
  id: string;
  category: QuestionCategory;
  region?: string;
  difficulty: QuestionDifficulty;
  question: string;
  options: [string, string, string, string]; // Siempre 4 respuestas
  correctIndex: number; // 0, 1, 2, o 3
  verificationSource?: string; // Información de control / fuente
}

export interface QuestionsFileStructure {
  normalQuestions: Question[];
  bonusQuestions: Question[];
}
