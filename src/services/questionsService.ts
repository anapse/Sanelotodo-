import { Question, QuestionsFileStructure } from "../types/question";
import { resolvePublicAssetPath } from "../config/assetManager";

let cachedQuestions: QuestionsFileStructure | null = null;
let cachedStarterQuestions: Question[] | null = null;
let cachedEasyQuestions: Question[] | null = null;
let cachedIntermediateQuestions: Question[] | null = null;

/**
 * Carga el banco de preguntas desde el archivo JSON de preguntas principales.
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
    return {
      normalQuestions: [],
      bonusQuestions: [],
    };
  }
}

/**
 * Carga el banco de preguntas STARTER desde el archivo starterQuestions.json.
 */
export async function loadStarterQuestionsBank(): Promise<Question[]> {
  if (cachedStarterQuestions) {
    return cachedStarterQuestions;
  }

  try {
    const starterUrl = resolvePublicAssetPath("/starterQuestions.json");
    const response = await fetch(starterUrl);
    if (!response.ok) {
      throw new Error(`No se pudo cargar el archivo starterQuestions.json desde ${starterUrl}`);
    }
    const data: Question[] = await response.json();
    cachedStarterQuestions = data;
    return data;
  } catch (error) {
    console.error("Error al cargar banco de preguntas starter:", error);
    return [];
  }
}

/**
 * Carga el banco de preguntas EASY desde el archivo easyQuestions.json.
 */
export async function loadEasyQuestionsBank(): Promise<Question[]> {
  if (cachedEasyQuestions) {
    return cachedEasyQuestions;
  }

  try {
    const easyUrl = resolvePublicAssetPath("/easyQuestions.json");
    const response = await fetch(easyUrl);
    if (!response.ok) {
      throw new Error(`No se pudo cargar el archivo easyQuestions.json desde ${easyUrl}`);
    }
    const data: Question[] = await response.json();
    cachedEasyQuestions = data;
    return data;
  } catch (error) {
    console.error("Error al cargar banco de preguntas easy:", error);
    return [];
  }
}

/**
 * Carga el banco de preguntas INTERMEDIATE desde el archivo intermediateQuestions.json.
 */
export async function loadIntermediateQuestionsBank(): Promise<Question[]> {
  if (cachedIntermediateQuestions) {
    return cachedIntermediateQuestions;
  }

  try {
    const intUrl = resolvePublicAssetPath("/intermediateQuestions.json");
    const response = await fetch(intUrl);
    if (!response.ok) {
      throw new Error(`No se pudo cargar el archivo intermediateQuestions.json desde ${intUrl}`);
    }
    const data: Question[] = await response.json();
    cachedIntermediateQuestions = data;
    return data;
  } catch (error) {
    console.error("Error al cargar banco de preguntas intermediate:", error);
    return [];
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
