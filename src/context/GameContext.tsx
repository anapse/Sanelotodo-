import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { GameConfig, defaultConfig } from "../config/gameConfig";
import { Question } from "../types/question";
import { loadQuestionsBank, loadStarterQuestionsBank, shuffleQuestionOptions } from "../services/questionsService";
import { saveGameScore } from "../services/rankingService";
import { soundService } from "../services/soundService";
import { IconName } from "../components/SpriteIcon";

export type GamePhase =
  | "MENU"
  | "NAME_INPUT"
  | "PLAYING"
  | "ROULETTE"
  | "BONUS_ROUND"
  | "PAUSED"
  | "GAME_OVER"
  | "TOP50"
  | "HOW_TO_PLAY"
  | "ADMIN"
  | "ASSET_MANAGER";

export type RoundDifficulty = "starter" | "easy" | "medium" | "hard" | "expert";

/**
 * Define la dificultad de cada ronda según la progresión oficial:
 * Rondas 1, 2, 3: Starter (banco starterQuestions.json de cultura pop y reconocimiento inmediato)
 * Rondas 4, 5: Easy (banco normal)
 * Rondas 6, 7: Medium (banco normal)
 * Rondas 8, 9: Hard (banco normal)
 * Rondas 10+: Expert (banco normal)
 */
export function getDifficultyForRound(roundNumber: number): RoundDifficulty {
  if (roundNumber <= 3) return "starter";
  if (roundNumber <= 5) return "easy";
  if (roundNumber <= 7) return "medium";
  if (roundNumber <= 9) return "hard";
  return "expert";
}

export interface LifelinesState {
  fiftyFiftyCount: number;
  skipCount: number;
  shieldCount: number;
  correctAnswerCount: number;
  extraLifeCount: number;
}

export interface MysterySlotDef {
  id: string;
  name: string;
  shortName: string;
  icon: IconName;
  whatItDoes: string;
  whenToUse: string;
}

export const MYSTERY_SLOTS_DEFINITIONS: MysterySlotDef[] = [
  {
    id: "mystery_double",
    name: "DOBLE PUNTUACIÓN",
    shortName: "2X PUNTOS",
    icon: "coins",
    whatItDoes: "Duplica los puntos obtenidos al responder correctamente la pregunta activa.",
    whenToUse: "En cualquier pregunta que conozcas con certeza la respuesta.",
  },
  {
    id: "mystery_freeze",
    name: "CONGELAR TIEMPO",
    shortName: "PAUSA 20S",
    icon: "hourglass",
    whatItDoes: "Pausa el temporizador durante 20 segundos para pensar con calma la respuesta.",
    whenToUse: "Cuando el tiempo esté en rojo (últimos 5 segundos).",
  },
  {
    id: "mystery_clue",
    name: "PISTA FOCALIZADA",
    shortName: "PISTA",
    icon: "target",
    whatItDoes: "Resalta con aura dorada la respuesta correcta de la pregunta.",
    whenToUse: "En preguntas de dificultad alta o experta.",
  },
  {
    id: "mystery_shield",
    name: "MEGA ESCUDO",
    shortName: "ESCUDO",
    icon: "shield",
    whatItDoes: "Te protege contra 1 fallo sin perder corazón y te permite reintentar la misma pregunta.",
    whenToUse: "Antes de responder cuando tengas dudas sobre la opción correcta.",
  },
  {
    id: "mystery_crown",
    name: "CORONA TRIUNFAL",
    shortName: "+1000 PTS",
    icon: "crown",
    whatItDoes: "Bonificación suprema de +1.000 puntos directos para tu récord.",
    whenToUse: "Úsalo para asegurar tu récord personal en el ranking.",
  },
];

export interface GameContextType {
  // Config
  config: GameConfig;
  updateConfig: (newConfig: Partial<GameConfig>) => void;

  // Estado del juego
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  previousPhase: GamePhase | null;

  // Jugador
  playerName: string;
  setPlayerName: (name: string) => void;
  isNameValid: boolean;

  // Estado de la partida y Arquitectura de Rondas
  lives: number;
  score: number;
  questionsAnsweredCount: number;
  currentRound: number; // Ronda actual (inicia en 1)
  currentRoundDifficulty: RoundDifficulty; // Dificultad de la ronda actual
  correctAnswersForRouletteCount: number; // Cuenta exactamente: 1 -> 2 -> 3 -> Ruleta (Fin de Ronda)

  // Pregunta actual
  currentQuestion: Question | null;
  hiddenOptionIndices: number[];
  highlightedCorrectOption: number | null;
  shieldActive: boolean;
  selectedAnswerIndex: number | null;
  isAnswerSubmitted: boolean;
  isAnswerCorrect: boolean | null;

  // 5 comodines oficiales + comodines misteriosos
  lifelines: LifelinesState;
  unlockedMysteryIndices: number[];
  useMysteryBooster: (index: number) => boolean;

  // Flujo de Ruleta y Ronda Bonus
  roulettePrizeMessage: string | null;
  bonusQuestionsRemaining: number;

  // Acciones principales
  startNewGameSession: () => void;
  submitPlayerNameAndBegin: (name: string) => boolean;
  handleAnswerSelection: (optionIndex: number) => void;
  advanceToNextQuestion: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  quitGameToMenu: () => void;

  // Uso de los 5 comodines oficiales
  useFiftyFifty: () => boolean;
  useSkip: () => boolean;
  useShield: () => boolean;
  useCorrectAnswerHighlight: () => boolean;
  useExtraLife: () => boolean;

  // Ruleta
  spinRoulette: () => { prizeType: string; label: string };
  claimRoulettePrizeAndContinue: () => void;

  // Carga
  isLoadingQuestions: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<GameConfig>(defaultConfig);
  const [phase, setPhaseState] = useState<GamePhase>("MENU");
  const [previousPhase, setPreviousPhase] = useState<GamePhase | null>(null);

  const [playerName, setPlayerNameState] = useState<string>("");
  const [isNameValid, setIsNameValid] = useState<boolean>(false);

  // Vidas: Inicio 3, Máximo 5
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [questionsAnsweredCount, setQuestionsAnsweredCount] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);

  // Ruleta: Cuenta exactamente 3 preguntas correctas para el cierre de ronda
  const [correctAnswersForRouletteCount, setCorrectAnswersForRouletteCount] = useState<number>(0);

  // Bancos de preguntas en memoria
  const [normalQuestions, setNormalQuestions] = useState<Question[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<Question[]>([]);
  const [starterQuestions, setStarterQuestions] = useState<Question[]>([]);

  // Pools de preguntas disponibles por dificultad para la partida
  const [unusedStarterPool, setUnusedStarterPool] = useState<Question[]>([]);
  const [unusedEasyPool, setUnusedEasyPool] = useState<Question[]>([]);
  const [unusedMediumPool, setUnusedMediumPool] = useState<Question[]>([]);
  const [unusedHardPool, setUnusedHardPool] = useState<Question[]>([]);
  const [unusedExpertPool, setUnusedExpertPool] = useState<Question[]>([]);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);

  // Estados de comodines y respuestas
  const [hiddenOptionIndices, setHiddenOptionIndices] = useState<number[]>([]);
  const [highlightedCorrectOption, setHighlightedCorrectOption] = useState<number | null>(null);
  const [shieldActive, setShieldActive] = useState<boolean>(false);

  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Guard de transición contra congelamiento
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ÚNICOS 5 COMODINES OFICIALES
  const [lifelines, setLifelines] = useState<LifelinesState>({
    fiftyFiftyCount: 1,
    skipCount: 1,
    shieldCount: 1,
    correctAnswerCount: 0,
    extraLifeCount: 0,
  });

  // ÍNDICES DE COMODINES MISTERIOSOS DESBLOQUEADOS (Fila 2: 0 a 4)
  const [unlockedMysteryIndices, setUnlockedMysteryIndices] = useState<number[]>([]);

  // Estado de Ruleta y Bonus
  const [roulettePrizeMessage, setRoulettePrizeMessage] = useState<string | null>(null);
  const [currentPrizeEffect, setCurrentPrizeEffect] = useState<(() => void) | null>(null);
  const [bonusQuestionsRemaining, setBonusQuestionsRemaining] = useState<number>(0);

  // Carga inicial de los bancos de preguntas (Principal y Starter)
  useEffect(() => {
    async function init() {
      setIsLoadingQuestions(true);
      const [bank, starterBank] = await Promise.all([
        loadQuestionsBank(),
        loadStarterQuestionsBank(),
      ]);
      setNormalQuestions(bank.normalQuestions);
      setBonusQuestions(bank.bonusQuestions);
      setStarterQuestions(starterBank);
      setIsLoadingQuestions(false);
    }
    init();
  }, []);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const setPhase = (newPhase: GamePhase) => {
    setPreviousPhase(phase);
    setPhaseState(newPhase);
  };

  const updateConfig = (newConfigPartial: Partial<GameConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfigPartial }));
  };

  const setPlayerName = (name: string) => {
    setPlayerNameState(name);
    setIsNameValid(name.trim().length > 0);
  };

  const startNewGameSession = () => {
    setPhase("NAME_INPUT");
  };

  const currentRoundDifficulty = getDifficultyForRound(currentRound);

  // =========================================================================
  // SISTEMA DE EXTRACCIÓN DINÁMICA DE PREGUNTAS POR DIFICULTAD DE RONDA
  // =========================================================================
  const getNextQuestionForRound = (
    roundNumber: number,
    currentPoolsOverride?: {
      starter?: Question[];
      easy?: Question[];
      medium?: Question[];
      hard?: Question[];
      expert?: Question[];
    }
  ): { nextQ: Question } => {
    const diff = getDifficultyForRound(roundNumber);

    let activePool: Question[];
    let setter: (updater: (prev: Question[]) => Question[]) => void;
    let sourceBank: Question[];

    if (diff === "starter") {
      activePool = currentPoolsOverride?.starter ?? unusedStarterPool;
      setter = (updater) => setUnusedStarterPool(updater);
      sourceBank = starterQuestions;
    } else if (diff === "easy") {
      activePool = currentPoolsOverride?.easy ?? unusedEasyPool;
      setter = (updater) => setUnusedEasyPool(updater);
      sourceBank = normalQuestions.filter((q) => q.difficulty === "easy");
    } else if (diff === "medium") {
      activePool = currentPoolsOverride?.medium ?? unusedMediumPool;
      setter = (updater) => setUnusedMediumPool(updater);
      sourceBank = normalQuestions.filter((q) => q.difficulty === "medium");
    } else if (diff === "hard") {
      activePool = currentPoolsOverride?.hard ?? unusedHardPool;
      setter = (updater) => setUnusedHardPool(updater);
      sourceBank = normalQuestions.filter((q) => q.difficulty === "hard");
    } else {
      activePool = currentPoolsOverride?.expert ?? unusedExpertPool;
      setter = (updater) => setUnusedExpertPool(updater);
      sourceBank = normalQuestions.filter((q) => q.difficulty === "expert");
    }

    // Si el pool de la dificultad se agota, rellenar y mezclar sin repetir la pregunta actual
    if (!activePool || activePool.length === 0) {
      const fresh = [...sourceBank].sort(() => Math.random() - 0.5);
      activePool = fresh.filter((q) => !currentQuestion || q.id !== currentQuestion.id);
      if (activePool.length === 0) activePool = fresh;
    }

    const nextRaw = activePool[0] || sourceBank[0] || starterQuestions[0];
    setter((prev) => (prev.length > 0 ? prev.slice(1) : activePool.slice(1)));

    const nextQ = shuffleQuestionOptions(nextRaw);
    return { nextQ };
  };

  // =========================================================================
  // INICIO DE PARTIDA: RONDA 1 STARTER
  // =========================================================================
  const submitPlayerNameAndBegin = (name: string): boolean => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setIsNameValid(false);
      return false;
    }

    setPlayerNameState(trimmed);
    setIsNameValid(true);

    // Reiniciar estadísticas de partida: 3 vidas iniciales, Ronda 1
    setLives(3);
    setScore(0);
    setQuestionsAnsweredCount(0);
    setCurrentRound(1);
    setCorrectAnswersForRouletteCount(0);

    // Comodines iniciales
    setLifelines({
      fiftyFiftyCount: 1,
      skipCount: 1,
      shieldCount: 1,
      correctAnswerCount: 0,
      extraLifeCount: 0,
    });
    setUnlockedMysteryIndices([]);

    // Inicializar los pools barajados para cada dificultad
    const shuffledStarter = [...starterQuestions].sort(() => Math.random() - 0.5);
    const shuffledEasy = normalQuestions.filter((q) => q.difficulty === "easy").sort(() => Math.random() - 0.5);
    const shuffledMedium = normalQuestions.filter((q) => q.difficulty === "medium").sort(() => Math.random() - 0.5);
    const shuffledHard = normalQuestions.filter((q) => q.difficulty === "hard").sort(() => Math.random() - 0.5);
    const shuffledExpert = normalQuestions.filter((q) => q.difficulty === "expert").sort(() => Math.random() - 0.5);

    setUnusedStarterPool(shuffledStarter.slice(1));
    setUnusedEasyPool(shuffledEasy);
    setUnusedMediumPool(shuffledMedium);
    setUnusedHardPool(shuffledHard);
    setUnusedExpertPool(shuffledExpert);

    const firstRaw = shuffledStarter[0] || starterQuestions[0] || normalQuestions[0];
    if (firstRaw) {
      setCurrentQuestion(shuffleQuestionOptions(firstRaw));
    } else {
      setCurrentQuestion(null);
    }

    resetQuestionStates();
    setPhase("PLAYING");
    return true;
  };

  const resetQuestionStates = () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    setHiddenOptionIndices([]);
    setHighlightedCorrectOption(null);
    setSelectedAnswerIndex(null);
    setIsAnswerSubmitted(false);
    setIsAnswerCorrect(null);
  };

  // =========================================================================
  // AVANCE DE PREGUNTA DENTRO DE LA MISMA RONDA
  // =========================================================================
  const advanceToNextQuestion = () => {
    resetQuestionStates();

    // 1. Si estamos en modo BONUS (Ronda de 3 preguntas fáciles)
    if (bonusQuestionsRemaining > 0) {
      const remainingBonus = bonusQuestionsRemaining - 1;
      setBonusQuestionsRemaining(remainingBonus);

      if (remainingBonus > 0 && bonusQuestions.length > 0) {
        const randomBonus = bonusQuestions[Math.floor(Math.random() * bonusQuestions.length)];
        setCurrentQuestion(shuffleQuestionOptions(randomBonus));
        setPhase("BONUS_ROUND");
        return;
      } else {
        // Fin del bonus: continuar en la ronda actual
        const { nextQ } = getNextQuestionForRound(currentRound);
        setCurrentQuestion(nextQ);
        setPhase("PLAYING");
        return;
      }
    }

    // 2. Incrementar contador global de preguntas respondidas
    setQuestionsAnsweredCount((prev) => prev + 1);

    // 3. Cargar la siguiente pregunta del MISMO nivel de la ronda actual
    const { nextQ } = getNextQuestionForRound(currentRound);
    setCurrentQuestion(nextQ);
    setPhase("PLAYING");
  };

  // =========================================================================
  // GESTIÓN DE RESPUESTAS Y CONDICIÓN DE FIN DE RONDA (3 ACIERTOS -> RULETA)
  // =========================================================================
  const handleAnswerSelection = (optionIndex: number) => {
    if (isAnswerSubmitted || !currentQuestion) return;

    setSelectedAnswerIndex(optionIndex);
    setIsAnswerSubmitted(true);

    const isCorrect = optionIndex === currentQuestion.correctIndex;
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      soundService.playCorrectSound();
      const pointsToAdd =
        bonusQuestionsRemaining > 0 ? config.pointsBonusQuestionCorrect : config.pointsNormalQuestionCorrect;
      setScore((prev) => prev + pointsToAdd);

      // Si no estamos en ronda bonus, verificar la condición de 3 aciertos para la Ruleta (Fin de Ronda)
      if (bonusQuestionsRemaining <= 0) {
        const nextCorrectCount = correctAnswersForRouletteCount + 1;

        if (nextCorrectCount >= 3) {
          // ¡3 PREGUNTAS CORRECTAS ALCANZADAS! → RULETA → FIN DE LA RONDA ACTUAL
          setCorrectAnswersForRouletteCount(0);

          transitionTimeoutRef.current = setTimeout(() => {
            resetQuestionStates();
            setPhase("ROULETTE");
          }, 1200);
          return;
        } else {
          setCorrectAnswersForRouletteCount(nextCorrectCount);
        }
      }

      transitionTimeoutRef.current = setTimeout(() => {
        advanceToNextQuestion();
      }, 1200);
    } else {
      soundService.playIncorrectSound();

      // En caso de ESCUDO ACTIVO: reintentar la misma pregunta
      if (shieldActive) {
        transitionTimeoutRef.current = setTimeout(() => {
          setShieldActive(false);
          setIsAnswerSubmitted(false);
          setSelectedAnswerIndex(null);
          setIsAnswerCorrect(null);
          if (optionIndex >= 0) {
            setHiddenOptionIndices((prev) => [...prev, optionIndex]);
          }
        }, 800);
        return;
      }

      // Pérdida de 1 vida
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        // Fin de partida inmediato si no quedan vidas (sin ruleta)
        transitionTimeoutRef.current = setTimeout(() => {
          resetQuestionStates();
          saveGameScore({ playerName, score, questionsAnswered: questionsAnsweredCount });
          setPhase("GAME_OVER");
        }, 1200);
        return;
      }

      // Si quedan vidas, la ronda continúa con otra pregunta de la misma dificultad
      transitionTimeoutRef.current = setTimeout(() => {
        advanceToNextQuestion();
      }, 1200);
    }
  };

  // =========================================================================
  // USO DE COMODINES OFICIALES
  // =========================================================================
  const useFiftyFifty = (): boolean => {
    if (lifelines.fiftyFiftyCount <= 0 || isAnswerSubmitted || !currentQuestion) return false;
    soundService.playLifelineSound();

    const correctIdx = currentQuestion.correctIndex;
    const incorrectIndices = [0, 1, 2, 3].filter((idx) => idx !== correctIdx);
    const shuffledIncorrect = incorrectIndices.sort(() => Math.random() - 0.5);
    const toHide = shuffledIncorrect.slice(0, 2);

    setHiddenOptionIndices(toHide);
    setLifelines((prev) => ({ ...prev, fiftyFiftyCount: prev.fiftyFiftyCount - 1 }));
    return true;
  };

  const useSkip = (): boolean => {
    if (lifelines.skipCount <= 0 || isAnswerSubmitted || !currentQuestion) return false;
    soundService.playLifelineSound();
    setLifelines((prev) => ({ ...prev, skipCount: prev.skipCount - 1 }));
    advanceToNextQuestion();
    return true;
  };

  const useShield = (): boolean => {
    if (lifelines.shieldCount <= 0 || isAnswerSubmitted || shieldActive) return false;
    soundService.playLifelineSound();
    setShieldActive(true);
    setLifelines((prev) => ({ ...prev, shieldCount: prev.shieldCount - 1 }));
    return true;
  };

  const useCorrectAnswerHighlight = (): boolean => {
    if (lifelines.correctAnswerCount <= 0 || isAnswerSubmitted || !currentQuestion) return false;
    soundService.playCorrectSound();
    setHighlightedCorrectOption(currentQuestion.correctIndex);
    setLifelines((prev) => ({ ...prev, correctAnswerCount: prev.correctAnswerCount - 1 }));
    return true;
  };

  const useExtraLife = (): boolean => {
    if (lifelines.extraLifeCount <= 0 || lives >= 5) return false;
    soundService.playLifelineSound();
    setLives((l) => Math.min(l + 1, 5));
    setLifelines((prev) => ({ ...prev, extraLifeCount: prev.extraLifeCount - 1 }));
    return true;
  };

  const useMysteryBooster = (mysteryIndex: number): boolean => {
    if (!unlockedMysteryIndices.includes(mysteryIndex) || isAnswerSubmitted) return false;
    soundService.playLifelineSound();

    switch (mysteryIndex) {
      case 0: // Doble Puntos
        setScore((s) => s + 200);
        break;
      case 1: // Congelar Tiempo
        break;
      case 2: // Pista Focalizada
        if (currentQuestion) {
          setHighlightedCorrectOption(currentQuestion.correctIndex);
        }
        break;
      case 3: // Mega Escudo
        setShieldActive(true);
        break;
      case 4: // Corona Triunfal (+1000 PTS)
        setScore((s) => s + 1000);
        break;
      default:
        break;
    }

    setUnlockedMysteryIndices((prev) => prev.filter((idx) => idx !== mysteryIndex));
    return true;
  };

  // =========================================================================
  // RULETA Y PREMIOS OFICIALES (PROBABILIDADES PONDERADAS)
  // =========================================================================
  const spinRoulette = () => {
    interface WeightedPrize {
      type: string;
      label: string;
      weight: number;
      effect: () => void;
    }

    const prizeTable: WeightedPrize[] = [
      // Premios de Puntos (70% de probabilidad total)
      {
        type: "POINTS_SMALL",
        label: "+150 Puntos",
        weight: 25,
        effect: () => setScore((s) => s + 150),
      },
      {
        type: "POINTS_MEDIUM",
        label: "+350 Puntos",
        weight: 22,
        effect: () => setScore((s) => s + 350),
      },
      {
        type: "POINTS_LARGE",
        label: "+750 Puntos",
        weight: 15,
        effect: () => setScore((s) => s + 750),
      },
      {
        type: "POINTS_EPIC",
        label: "+1.500 Puntos Supremos",
        weight: 8,
        effect: () => setScore((s) => s + 1500),
      },

      // Premios Especiales y Comodines (30% de probabilidad total)
      {
        type: "EXTRA_LIFE",
        label: "+1 Vida Extra",
        weight: 8,
        effect: () => setLives((l) => Math.min(l + 1, 5)),
      },
      {
        type: "FIFTY_FIFTY",
        label: "Comodín 50/50",
        weight: 4,
        effect: () => setLifelines((prev) => ({ ...prev, fiftyFiftyCount: prev.fiftyFiftyCount + 1 })),
      },
      {
        type: "SHIELD",
        label: "Comodín Escudo",
        weight: 4,
        effect: () => setLifelines((prev) => ({ ...prev, shieldCount: prev.shieldCount + 1 })),
      },
      {
        type: "CORRECT_ANSWER",
        label: "Comodín Pista (Desbloqueado)",
        weight: 4,
        effect: () => setLifelines((prev) => ({ ...prev, correctAnswerCount: prev.correctAnswerCount + 1 })),
      },
      {
        type: "SKIP",
        label: "Comodín Saltar Pregunta",
        weight: 4,
        effect: () => setLifelines((prev) => ({ ...prev, skipCount: prev.skipCount + 1 })),
      },
      {
        type: "MYSTERY_LIFELINE",
        label: "¡Comodín Misterioso Desbloqueado!",
        weight: 4,
        effect: () => {
          setUnlockedMysteryIndices((prev) => {
            const nextSlot = [0, 1, 2, 3, 4].find((idx) => !prev.includes(idx));
            return nextSlot !== undefined ? [...prev, nextSlot] : prev;
          });
        },
      },
      {
        type: "BONUS_ROUND",
        label: "Ronda de Preguntas Fáciles (3 Preguntas)",
        weight: 2,
        effect: () => {
          setBonusQuestionsRemaining(3);
        },
      },
    ];

    const totalWeight = prizeTable.reduce((sum, p) => sum + p.weight, 0);
    let randomNum = Math.random() * totalWeight;

    let selected = prizeTable[0];
    for (const prize of prizeTable) {
      if (randomNum < prize.weight) {
        selected = prize;
        break;
      }
      randomNum -= prize.weight;
    }

    setRoulettePrizeMessage(selected.label);
    setCurrentPrizeEffect(() => selected.effect);

    return { prizeType: selected.type, label: selected.label };
  };

  // =========================================================================
  // RECLAMAR PREMIO DE RULETA Y COMENZAR LA SIGUIENTE RONDA
  // =========================================================================
  const claimRoulettePrizeAndContinue = () => {
    // 1. Aplicar efecto del premio de la ruleta
    if (currentPrizeEffect) {
      currentPrizeEffect();
      setCurrentPrizeEffect(null);
    }

    // 2. Reiniciar contador de aciertos de ruleta a 0 para la nueva ronda
    setCorrectAnswersForRouletteCount(0);

    // 3. Incrementar el número de ronda (Checkpoint completado)
    const nextRoundNumber = currentRound + 1;
    setCurrentRound(nextRoundNumber);

    // 4. Si se activó la ronda bonus, presentarla
    if (bonusQuestionsRemaining > 0 && bonusQuestions.length > 0) {
      const randomBonus = bonusQuestions[Math.floor(Math.random() * bonusQuestions.length)];
      setCurrentQuestion(shuffleQuestionOptions(randomBonus));
      setPhase("BONUS_ROUND");
    } else {
      // 5. Comenzar la siguiente ronda con preguntas de su nuevo nivel de dificultad
      const { nextQ } = getNextQuestionForRound(nextRoundNumber);
      setCurrentQuestion(nextQ);
      resetQuestionStates();
      setPhase("PLAYING");
    }
  };

  const pauseGame = () => {
    if (phase === "PLAYING" || phase === "BONUS_ROUND") {
      setPhase("PAUSED");
    }
  };

  const resumeGame = () => {
    if (phase === "PAUSED") {
      setPhase(previousPhase || "PLAYING");
    }
  };

  const quitGameToMenu = () => {
    resetQuestionStates();
    setPhase("MENU");
  };

  return (
    <GameContext.Provider
      value={{
        config,
        updateConfig,
        phase,
        setPhase,
        previousPhase,
        playerName,
        setPlayerName,
        isNameValid,
        lives,
        score,
        questionsAnsweredCount,
        currentRound,
        currentRoundDifficulty,
        correctAnswersForRouletteCount,
        currentQuestion,
        hiddenOptionIndices,
        highlightedCorrectOption,
        shieldActive,
        selectedAnswerIndex,
        isAnswerSubmitted,
        isAnswerCorrect,
        lifelines,
        unlockedMysteryIndices,
        useMysteryBooster,
        roulettePrizeMessage,
        bonusQuestionsRemaining,
        startNewGameSession,
        submitPlayerNameAndBegin,
        handleAnswerSelection,
        advanceToNextQuestion,
        pauseGame,
        resumeGame,
        quitGameToMenu,
        useFiftyFifty,
        useSkip,
        useShield,
        useCorrectAnswerHighlight,
        useExtraLife,
        spinRoulette,
        claimRoulettePrizeAndContinue,
        isLoadingQuestions,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame debe ser utilizado dentro de un GameProvider");
  }
  return context;
}
