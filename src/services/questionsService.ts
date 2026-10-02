import { Question, QuestionsFileStructure } from "../types/question";
import { resolvePublicAssetPath } from "../config/assetManager";

let cachedQuestions: QuestionsFileStructure | null = null;

/**
 * Carga el banco de preguntas desde el archivo JSON de preguntas.
 */
export async function loadQuestionsBank(): Promise<QuestionsFileStructure> {
  if (cachedQuestions) {
    return cachedQuestions;
  }

  try {
    const questionsUrl = resolvePublicAssetPath("/questions.json");
    const response = await fetch(questionsUrl);
    if (!response.ok) {
      throw new Error(`No se pudo cargar el archivo questions.json desde ${questionsUrl}`);
    }
    const data: QuestionsFileStructure = await response.json();
    cachedQuestions = data;
    return data;
  } catch (error) {
    console.error("Error al cargar banco de preguntas:", error);
    // Retorno de contingencia limpia si fallara el fetch
    return {
      normalQuestions: [],
      bonusQuestions: [],
    };
  }
}

/**
 * Mezcla las 4 opciones de una pregunta sin perder el rastreo de la respuesta correcta.
 */
export function shuffleQuestionOptions(question: Question): Question {
  const originalOptions = [...question.options];
  const correctAnswerText = originalOptions[question.correctIndex];

  // Algoritmo Fisher-Yates para mezclar
  const shuffledOptions = [...originalOptions];
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }

  const newCorrectIndex = shuffledOptions.findIndex((opt) => opt === correctAnswerText);

  return {
    ...question,
    options: shuffledOptions as [string, string, string, string],
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}
