import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { GameConfig, defaultConfig } from "../config/gameConfig";
import { Question } from "../types/question";
import {
  loadQuestionsBank,
  loadStarterQuestionsBank,
  loadEasyQuestionsBank,
  loadIntermediateQuestionsBank,
  shuffleQuestionOptions,
} from "../services/questionsService";
import { saveGameScore } from "../services/rankingService";
import { soundService } from "../services/soundService";
import { LifelineId, LifelineDef, OFFICIAL_10_LIFELINES } from "../types/lifeline";
import { WheelPrizeDef, OFFICIAL_WHEEL_PRIZES } from "../types/wheelReward";

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

export type RoundDifficulty = "starter" | "easy" | "intermediate" | "medium" | "hard" | "expert";

/**
 * Define la dificultad de cada ronda según la progresión oficial:
 * Rondas 1 a 5: STARTER (starterQuestions.json - ultra accesible)
 * Rondas 6 a 10: EASY (easyQuestions.json - accesible para adultos, cultura pop y general)
 * Rondas 11 a 15: INTERMEDIATE (intermediateQuestions.json - puente equilibrado antes del banco principal)
 * Rondas 16 a 20: MEDIUM (questions.json - banco principal)
 * Rondas 21 a 25: HARD (questions.json - banco principal)
 * Rondas 26+: EXPERT (questions.json - banco principal)
 */
export function getDifficultyForRound(roundNumber: number): RoundDifficulty {
  if (roundNumber <= 5) return "starter";
  if (roundNumber <= 10) return "easy";
  if (roundNumber <= 15) return "intermediate";
  if (roundNumber <= 20) return "medium";
  if (roundNumber <= 25) return "hard";
  return "expert";
}

export type LifelinesState = Record<LifelineId, number>;

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
  currentRound: number;
  currentRoundDifficulty: RoundDifficulty;
  correctAnswersForRouletteCount: number;

  // Pregunta actual y transiciones
  currentQuestion: Question | null;
  hiddenOptionIndices: number[];
  highlightedCorrectOption: number | null;
  selectedAnswerIndex: number | null;
  isAnswerSubmitted: boolean;
  isAnswerCorrect: boolean | null;
  isQuestionTransitioning: boolean;

  // Modales y Pausa de Tiempo
  activeModalLifeline: LifelineDef | null;
  openLifelineModal: (lifelineId: LifelineId) => void;
  closeLifelineModal: () => void;
  confirmActivateLifeline: () => boolean;
  isTimerPaused: boolean;
  setTimerPaused: (paused: boolean) => void;

  // Estados mecánicos de comodines activos en la pregunta
  shieldActive: boolean;
  megaShieldCharges: number;
  secondChanceActive: boolean;
  doubleScoreActive: boolean;
  timeFreezeSecondsRemaining: number;
  setTimeFreezeSecondsRemaining: React.Dispatch<React.SetStateAction<number>>;
  extraTimeSecondsAdded: number;

  // Los 10 Comodines de Acción
  lifelines: LifelinesState;
  getLifelineCount: (id: LifelineId) => number;
  activateLifelineDirectly: (id: LifelineId) => boolean;

  // Flujo de Ruleta y Premios
  currentWheelPrize: WheelPrizeDef | null;
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

  // Ruleta
  spinRoulette: () => WheelPrizeDef;
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
  const [correctAnswersForRouletteCount, setCorrectAnswersForRouletteCount] = useState<number>(0);

  // Bancos de preguntas en memoria
  const [starterQuestions, setStarterQuestions] = useState<Question[]>([]);
  const [easyQuestions, setEasyQuestions] = useState<Question[]>([]);
  const [intermediateQuestions, setIntermediateQuestions] = useState<Question[]>([]);
  const [normalQuestions, setNormalQuestions] = useState<Question[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<Question[]>([]);

  // Pools de preguntas disponibles por dificultad para la partida
  const [unusedStarterPool, setUnusedStarterPool] = useState<Question[]>([]);
  const [unusedEasyPool, setUnusedEasyPool] = useState<Question[]>([]);
  const [unusedIntermediatePool, setUnusedIntermediatePool] = useState<Question[]>([]);
  const [unusedMediumPool, setUnusedMediumPool] = useState<Question[]>([]);
  const [unusedHardPool, setUnusedHardPool] = useState<Question[]>([]);
  const [unusedExpertPool, setUnusedExpertPool] = useState<Question[]>([]);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);
  const [isQuestionTransitioning, setIsQuestionTransitioning] = useState<boolean>(false);

  // Estados de opciones y respuestas
  const [hiddenOptionIndices, setHiddenOptionIndices] = useState<number[]>([]);
  const [highlightedCorrectOption, setHighlightedCorrectOption] = useState<number | null>(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Estados mecánicos de comodines en la pregunta activa
  const [shieldActive, setShieldActive] = useState<boolean>(false);
  const [megaShieldCharges, setMegaShieldCharges] = useState<number>(0);
  const [secondChanceActive, setSecondChanceActive] = useState<boolean>(false);
  const [doubleScoreActive, setDoubleScoreActive] = useState<boolean>(false);
  const [timeFreezeSecondsRemaining, setTimeFreezeSecondsRemaining] = useState<number>(0);
  const [extraTimeSecondsAdded, setExtraTimeSecondsAdded] = useState<number>(0);

  // Modal de activación de comodines y control de pausa del temporizador
  const [activeModalLifeline, setActiveModalLifeline] = useState<LifelineDef | null>(null);
  const [isTimerPaused, setTimerPaused] = useState<boolean>(false);

  // Guard de transición contra congelamiento
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // LOS 10 COMODINES DE ACCIÓN (INVENTARIO EN BARRA)
  const [lifelines, setLifelines] = useState<LifelinesState>({
    fiftyFifty: 1,
    skip: 1,
    shield: 1,
    correctAnswer: 0,
    freezeTime: 0,
    megaShield: 0,
    secondChance: 0,
    extraTime: 0,
    doubleScore: 0,
    revealOption: 0,
  });

  // Estado de Ruleta y Bonus
  const [currentWheelPrize, setCurrentWheelPrize] = useState<WheelPrizeDef | null>(null);
  const [roulettePrizeMessage, setRoulettePrizeMessage] = useState<string | null>(null);
  const [currentPrizeEffect, setCurrentPrizeEffect] = useState<(() => void) | null>(null);
  const [bonusQuestionsRemaining, setBonusQuestionsRemaining] = useState<number>(0);

  // Carga inicial de los 4 bancos de preguntas en el orden exacto de progresión
  useEffect(() => {
    async function init() {
      setIsLoadingQuestions(true);
      const [starterBank, easyBank, intermediateBank, mainBank] = await Promise.all([
        loadStarterQuestionsBank(),
        loadEasyQuestionsBank(),
        loadIntermediateQuestionsBank(),
        loadQuestionsBank(),
      ]);
      setStarterQuestions(starterBank);
      setEasyQuestions(easyBank);
      setIntermediateQuestions(intermediateBank);
      setNormalQuestions(mainBank.normalQuestions);
      setBonusQuestions(mainBank.bonusQuestions);
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

  const getLifelineCount = (id: LifelineId): number => {
    return lifelines[id] || 0;
  };

  // =========================================================================
  // SISTEMA DE EXTRACCIÓN DINÁMICA DE PREGUNTAS POR DIFICULTAD DE RONDA
  // =========================================================================
  const getNextQuestionForRound = (
    roundNumber: number,
    currentPoolsOverride?: {
      starter?: Question[];
      easy?: Question[];
      intermediate?: Question[];
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
      sourceBank = easyQuestions;
    } else if (diff === "intermediate") {
      activePool = currentPoolsOverride?.intermediate ?? unusedIntermediatePool;
      setter = (updater) => setUnusedIntermediatePool(updater);
      sourceBank = intermediateQuestions;
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

    // Reiniciar comodines iniciales (3 desbloqueados con 1 uso, los demás en 0)
    setLifelines({
      fiftyFifty: 1,
      skip: 1,
      shield: 1,
      correctAnswer: 0,
      freezeTime: 0,
      megaShield: 0,
      secondChance: 0,
      extraTime: 0,
      doubleScore: 0,
      revealOption: 0,
    });

    // Limpiar modificadores
    setShieldActive(false);
    setMegaShieldCharges(0);
    setSecondChanceActive(false);
    setDoubleScoreActive(false);
    setTimeFreezeSecondsRemaining(0);
    setExtraTimeSecondsAdded(0);
    setActiveModalLifeline(null);
    setTimerPaused(false);
    setIsQuestionTransitioning(false);

    // Inicializar los pools barajados para cada dificultad
    const shuffledStarter = [...starterQuestions].sort(() => Math.random() - 0.5);
    const shuffledEasy = [...easyQuestions].sort(() => Math.random() - 0.5);
    const shuffledInt = [...intermediateQuestions].sort(() => Math.random() - 0.5);
    const shuffledMedium = normalQuestions.filter((q) => q.difficulty === "medium").sort(() => Math.random() - 0.5);
    const shuffledHard = normalQuestions.filter((q) => q.difficulty === "hard").sort(() => Math.random() - 0.5);
    const shuffledExpert = normalQuestions.filter((q) => q.difficulty === "expert").sort(() => Math.random() - 0.5);

    setUnusedStarterPool(shuffledStarter.slice(1));
    setUnusedEasyPool(shuffledEasy);
    setUnusedIntermediatePool(shuffledInt);
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
    setDoubleScoreActive(false);
    setTimeFreezeSecondsRemaining(0);
    setExtraTimeSecondsAdded(0);
    setActiveModalLifeline(null);
    setTimerPaused(false);
  };

  // =========================================================================
  // AVANCE DE PREGUNTA DENTRO DE LA MISMA RONDA CON TRANSICIÓN VISUAL
  // =========================================================================
  const advanceToNextQuestion = () => {
    setIsQuestionTransitioning(true);
    setTimerPaused(true);

    setTimeout(() => {
      resetQuestionStates();

      // 1. Si estamos en modo BONUS (Ronda de 3 preguntas fáciles)
      if (bonusQuestionsRemaining > 0) {
        const remainingBonus = bonusQuestionsRemaining - 1;
        setBonusQuestionsRemaining(remainingBonus);

        if (remainingBonus > 0 && bonusQuestions.length > 0) {
          const randomBonus = bonusQuestions[Math.floor(Math.random() * bonusQuestions.length)];
          setCurrentQuestion(shuffleQuestionOptions(randomBonus));
          setPhase("BONUS_ROUND");
          setIsQuestionTransitioning(false);
          setTimerPaused(false);
          return;
        } else {
          // Fin del bonus: continuar en la ronda actual
          const { nextQ } = getNextQuestionForRound(currentRound);
          setCurrentQuestion(nextQ);
          setPhase("PLAYING");
          setIsQuestionTransitioning(false);
          setTimerPaused(false);
          return;
        }
      }

      // 2. Incrementar contador global de preguntas respondidas
      setQuestionsAnsweredCount((prev) => prev + 1);

      // 3. Cargar la siguiente pregunta del MISMO nivel de la ronda actual
      const { nextQ } = getNextQuestionForRound(currentRound);
      setCurrentQuestion(nextQ);
      setPhase("PLAYING");
      setIsQuestionTransitioning(false);
      setTimerPaused(false);
    }, 300);
  };

  // =========================================================================
  // GESTIÓN DE RESPUESTAS Y CONDICIÓN DE FIN DE RONDA (3 ACIERTOS -> RULETA)
  // =========================================================================
  const handleAnswerSelection = (optionIndex: number) => {
    if (isAnswerSubmitted || !currentQuestion || isQuestionTransitioning) return;

    setSelectedAnswerIndex(optionIndex);
    setIsAnswerSubmitted(true);

    const isCorrect = optionIndex === currentQuestion.correctIndex;
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      soundService.playCorrectSound();
      const basePoints =
        bonusQuestionsRemaining > 0 ? config.pointsBonusQuestionCorrect : config.pointsNormalQuestionCorrect;
      const pointsToAdd = doubleScoreActive ? basePoints * 2 : basePoints;
      setScore((prev) => prev + pointsToAdd);

      // Si no estamos en ronda bonus, verificar la condición de 3 aciertos para la Ruleta
      if (bonusQuestionsRemaining <= 0) {
        const nextCorrectCount = correctAnswersForRouletteCount + 1;

        if (nextCorrectCount >= 3) {
          // 3 ACIERTOS ALCANZADOS → RULETA → FIN DE LA RONDA ACTUAL
          setCorrectAnswersForRouletteCount(0);

          transitionTimeoutRef.current = setTimeout(() => {
            resetQuestionStates();
            setPhase("ROULETTE");
          }, 1100);
          return;
        } else {
          setCorrectAnswersForRouletteCount(nextCorrectCount);
        }
      }

      transitionTimeoutRef.current = setTimeout(() => {
        advanceToNextQuestion();
      }, 1100);
    } else {
      soundService.playIncorrectSound();

      // MECÁNICA 1: MEGA ESCUDO ACTIVO (absorbe hasta 2 fallos consecutivos)
      if (megaShieldCharges > 0) {
        transitionTimeoutRef.current = setTimeout(() => {
          setMegaShieldCharges((c) => c - 1);
          setIsAnswerSubmitted(false);
          setSelectedAnswerIndex(null);
          setIsAnswerCorrect(null);
          if (optionIndex >= 0) {
            setHiddenOptionIndices((prev) => [...prev, optionIndex]);
          }
        }, 800);
        return;
      }

      // MECÁNICA 2: ESCUDO ACTIVO (absorbe 1 fallo y reintenta)
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

      // MECÁNICA 3: SEGUNDA OPORTUNIDAD ACTIVA
      if (secondChanceActive) {
        transitionTimeoutRef.current = setTimeout(() => {
          setSecondChanceActive(false);
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
      }, 1100);
    }
  };

  // =========================================================================
  // APERTURA Y CONTROL DEL MODAL DE COMODINES (PAUSA TOTAL DEL TEMPORIZADOR)
  // =========================================================================
  const openLifelineModal = (lifelineId: LifelineId) => {
    if (isAnswerSubmitted || !currentQuestion || isQuestionTransitioning) return;
    if ((lifelines[lifelineId] || 0) <= 0) return;

    const def = OFFICIAL_10_LIFELINES.find((l) => l.id === lifelineId);
    if (!def) return;

    soundService.playClickSound();
    setTimerPaused(true);
    setActiveModalLifeline(def);
  };

  const closeLifelineModal = () => {
    setActiveModalLifeline(null);
    setTimerPaused(false);
  };

  const confirmActivateLifeline = (): boolean => {
    if (!activeModalLifeline) return false;
    const id = activeModalLifeline.id;
    const success = activateLifelineDirectly(id);
    setActiveModalLifeline(null);
    setTimerPaused(false);
    return success;
  };

  // =========================================================================
  // EJECUCIÓN DIRECTA DE LOS 10 COMODINES DE ACCIÓN
  // =========================================================================
  const activateLifelineDirectly = (id: LifelineId): boolean => {
    if (isAnswerSubmitted || !currentQuestion) return false;
    if ((lifelines[id] || 0) <= 0) return false;

    soundService.playLifelineSound();

    switch (id) {
      case "fiftyFifty": {
        const correctIdx = currentQuestion.correctIndex;
        const incorrectIndices = [0, 1, 2, 3].filter(
          (idx) => idx !== correctIdx && !hiddenOptionIndices.includes(idx)
        );
        const shuffledIncorrect = incorrectIndices.sort(() => Math.random() - 0.5);
        const toHide = shuffledIncorrect.slice(0, 2);
        setHiddenOptionIndices((prev) => [...prev, ...toHide]);
        break;
      }

      case "skip": {
        setLifelines((prev) => ({ ...prev, skip: Math.max(prev.skip - 1, 0) }));
        advanceToNextQuestion();
        return true;
      }

      case "shield": {
        setShieldActive(true);
        break;
      }

      case "correctAnswer": {
        setHighlightedCorrectOption(currentQuestion.correctIndex);
        break;
      }

      case "freezeTime": {
        setTimeFreezeSecondsRemaining(15);
        break;
      }

      case "megaShield": {
        setMegaShieldCharges((c) => Math.max(c, 2));
        break;
      }

      case "secondChance": {
        setSecondChanceActive(true);
        break;
      }

      case "extraTime": {
        setExtraTimeSecondsAdded((prev) => prev + 15);
        break;
      }

      case "doubleScore": {
        setDoubleScoreActive(true);
        break;
      }

      case "revealOption": {
        const correctIdx = currentQuestion.correctIndex;
        const incorrectIndices = [0, 1, 2, 3].filter(
          (idx) => idx !== correctIdx && !hiddenOptionIndices.includes(idx)
        );
        if (incorrectIndices.length > 0) {
          const randomIndex = incorrectIndices[Math.floor(Math.random() * incorrectIndices.length)];
          setHiddenOptionIndices((prev) => [...prev, randomIndex]);
        }
        break;
      }

      default:
        break;
    }

    setLifelines((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0),
    }));

    return true;
  };

  // =========================================================================
  // RULETA Y SELECCIÓN PONDERADA DE PREMIOS (100% CONSOLIDADO)
  // =========================================================================
  const spinRoulette = (): WheelPrizeDef => {
    const totalWeight = OFFICIAL_WHEEL_PRIZES.reduce((sum, p) => sum + p.weight, 0); // 100
    let randomNum = Math.random() * totalWeight;

    let selected: WheelPrizeDef = OFFICIAL_WHEEL_PRIZES[0];
    for (const prize of OFFICIAL_WHEEL_PRIZES) {
      if (randomNum < prize.weight) {
        selected = prize;
        break;
      }
      randomNum -= prize.weight;
    }

    setCurrentWheelPrize(selected);
    setRoulettePrizeMessage(selected.name);

    setCurrentPrizeEffect(() => () => {
      if (selected.category === "points" && selected.pointsValue) {
        setScore((s) => s + selected.pointsValue!);
      } else if (selected.category === "life" && selected.livesValue) {
        setLives((l) => Math.min(l + selected.livesValue!, 5));
      } else if (selected.category === "lifeline" && selected.lifelineId) {
        const lid = selected.lifelineId as LifelineId;
        setLifelines((prev) => ({
          ...prev,
          [lid]: (prev[lid] || 0) + (selected.lifelineAmount || 1),
        }));
      } else if (selected.category === "special") {
        setBonusQuestionsRemaining(3);
      }
    });

    return selected;
  };

  // =========================================================================
  // RECLAMAR PREMIO DE RULETA Y COMENZAR LA SIGUIENTE RONDA
  // =========================================================================
  const claimRoulettePrizeAndContinue = () => {
    if (currentPrizeEffect) {
      currentPrizeEffect();
      setCurrentPrizeEffect(null);
    }

    setCorrectAnswersForRouletteCount(0);

    const nextRoundNumber = currentRound + 1;
    setCurrentRound(nextRoundNumber);

    if (currentWheelPrize?.category === "special" || (bonusQuestionsRemaining > 0 && bonusQuestions.length > 0)) {
      const randomBonus = bonusQuestions[Math.floor(Math.random() * bonusQuestions.length)];
      setCurrentQuestion(shuffleQuestionOptions(randomBonus));
      setPhase("BONUS_ROUND");
    } else {
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
        selectedAnswerIndex,
        isAnswerSubmitted,
        isAnswerCorrect,
        isQuestionTransitioning,
        activeModalLifeline,
        openLifelineModal,
        closeLifelineModal,
        confirmActivateLifeline,
        isTimerPaused,
        setTimerPaused,
        shieldActive,
        megaShieldCharges,
        secondChanceActive,
        doubleScoreActive,
        timeFreezeSecondsRemaining,
        setTimeFreezeSecondsRemaining,
        extraTimeSecondsAdded,
        lifelines,
        getLifelineCount,
        activateLifelineDirectly,
        currentWheelPrize,
        roulettePrizeMessage,
        bonusQuestionsRemaining,
        startNewGameSession,
        submitPlayerNameAndBegin,
        handleAnswerSelection,
        advanceToNextQuestion,
        pauseGame,
        resumeGame,
        quitGameToMenu,
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
