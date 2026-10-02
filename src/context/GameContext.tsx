import React, { createContext, useContext, useState, useEffect } from "react";
import { GameConfig, defaultConfig } from "../config/gameConfig";
import { Question } from "../types/question";
import { loadQuestionsBank, shuffleQuestionOptions } from "../services/questionsService";
import { saveGameScore } from "../services/rankingService";
import { soundService } from "../services/soundService";

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

export interface LifelinesState {
  fiftyFiftyCount: number;
  skipCount: number;
  shieldCount: number;
  correctAnswerCount: number;
  extraLifeCount: number;
}

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

  // Estado de la partida
  lives: number;
  score: number;
  questionsAnsweredCount: number;

  // Pregunta actual
  currentQuestion: Question | null;
  hiddenOptionIndices: number[]; // Para comodín 50/50
  highlightedCorrectOption: number | null; // Para comodín RESPUESTA CORRECTA
  shieldActive: boolean; // Para comodín ESCUDO
  selectedAnswerIndex: number | null;
  isAnswerSubmitted: boolean;
  isAnswerCorrect: boolean | null;

  // Comodines disponibles
  lifelines: LifelinesState;

  // Flujo de Ruleta y Bonus
  roulettePrizeMessage: string | null;
  bonusQuestionsRemaining: number;

  // Acciones principales
  startNewGameSession: () => void;
  submitPlayerNameAndBegin: (name: string) => boolean;
  handleAnswerSelection: (optionIndex: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  quitGameToMenu: () => void;

  // Uso de Comodines (Únicamente los 5 aprobados)
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

  const [lives, setLives] = useState<number>(config.initialLives);
  const [score, setScore] = useState<number>(0);
  const [questionsAnsweredCount, setQuestionsAnsweredCount] = useState<number>(0);

  // Banco de preguntas
  const [normalQuestions, setNormalQuestions] = useState<Question[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<Question[]>([]);
  const [unusedNormalQuestions, setUnusedNormalQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);

  // Estados de comodines y selecciones
  const [hiddenOptionIndices, setHiddenOptionIndices] = useState<number[]>([]);
  const [highlightedCorrectOption, setHighlightedCorrectOption] = useState<number | null>(null);
  const [shieldActive, setShieldActive] = useState<boolean>(false);

  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Cantidad de comodines disponibles
  const [lifelines, setLifelines] = useState<LifelinesState>({
    fiftyFiftyCount: 1,
    skipCount: 1,
    shieldCount: 1,
    correctAnswerCount: 1,
    extraLifeCount: 1,
  });

  // Estado de Ruleta y Bonus
  const [roulettePrizeMessage, setRoulettePrizeMessage] = useState<string | null>(null);
  const [currentPrizeEffect, setCurrentPrizeEffect] = useState<(() => void) | null>(null);
  const [bonusQuestionsRemaining, setBonusQuestionsRemaining] = useState<number>(0);

  // Carga inicial del banco de preguntas
  useEffect(() => {
    async function init() {
      setIsLoadingQuestions(true);
      const bank = await loadQuestionsBank();
      setNormalQuestions(bank.normalQuestions);
      setBonusQuestions(bank.bonusQuestions);
      setIsLoadingQuestions(false);
    }
    init();
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

  // Prepara una partida nueva
  const startNewGameSession = () => {
    setPhase("NAME_INPUT");
  };

  // Valida e inicia el gameplay
  const submitPlayerNameAndBegin = (name: string): boolean => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setIsNameValid(false);
      return false;
    }

    setPlayerNameState(trimmed);
    setIsNameValid(true);

    // Reiniciar estadísticas de partida
    setLives(config.initialLives);
    setScore(0);
    setQuestionsAnsweredCount(0);
    setLifelines({
      fiftyFiftyCount: 1,
      skipCount: 1,
      shieldCount: 1,
      correctAnswerCount: 1,
      extraLifeCount: 1,
    });

    // Preparar cola de preguntas normales sin repetir
    const shuffledPool = [...normalQuestions].sort(() => Math.random() - 0.5);
    setUnusedNormalQuestions(shuffledPool);

    if (shuffledPool.length > 0) {
      const nextQ = shuffleQuestionOptions(shuffledPool[0]);
      setCurrentQuestion(nextQ);
      setUnusedNormalQuestions(shuffledPool.slice(1));
    } else {
      setCurrentQuestion(null);
    }

    resetQuestionStates();
    setPhase("PLAYING");
    return true;
  };

  const resetQuestionStates = () => {
    setHiddenOptionIndices([]);
    setHighlightedCorrectOption(null);
    setShieldActive(false);
    setSelectedAnswerIndex(null);
    setIsAnswerSubmitted(false);
    setIsAnswerCorrect(null);
  };

  // Carga la siguiente pregunta según corresponda
  const advanceToNextQuestion = () => {
    resetQuestionStates();

    // Comprobar si estamos en la ronda bonus
    if (bonusQuestionsRemaining > 0) {
      const remainingBonus = bonusQuestionsRemaining - 1;
      setBonusQuestionsRemaining(remainingBonus);

      if (remainingBonus > 0 && bonusQuestions.length > 0) {
        const randomBonus = bonusQuestions[Math.floor(Math.random() * bonusQuestions.length)];
        setCurrentQuestion(shuffleQuestionOptions(randomBonus));
        setPhase("BONUS_ROUND");
        return;
      } else {
        // Fin del bonus -> Volver al flujo normal
        setPhase("PLAYING");
      }
    }

    // Comprobar la ruleta cada X preguntas
    const nextCount = questionsAnsweredCount + 1;
    setQuestionsAnsweredCount(nextCount);

    if (nextCount > 0 && nextCount % config.rouletteFrequencyQuestions === 0) {
      setPhase("ROULETTE");
      return;
    }

    // Pregunta normal
    if (unusedNormalQuestions.length > 0) {
      const nextQ = shuffleQuestionOptions(unusedNormalQuestions[0]);
      setCurrentQuestion(nextQ);
      setUnusedNormalQuestions((prev) => prev.slice(1));
      setPhase("PLAYING");
    } else {
      // Si se acabaron las preguntas normales, re-mezclar el banco
      const reshuffled = [...normalQuestions].sort(() => Math.random() - 0.5);
      if (reshuffled.length > 0) {
        const nextQ = shuffleQuestionOptions(reshuffled[0]);
        setCurrentQuestion(nextQ);
        setUnusedNormalQuestions(reshuffled.slice(1));
      }
      setPhase("PLAYING");
    }
  };

  // Maneja la respuesta del usuario
  const handleAnswerSelection = (optionIndex: number) => {
    if (isAnswerSubmitted || !currentQuestion) return;

    setSelectedAnswerIndex(optionIndex);
    const isCorrect = optionIndex === currentQuestion.correctIndex;
    setIsAnswerSubmitted(true);
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      soundService.playCorrectSound();
      // Suma puntos centralizados según tipo de ronda
      const addedPoints =
        bonusQuestionsRemaining > 0 ? config.pointsBonusQuestionCorrect : config.pointsNormalQuestionCorrect;

      setScore((prev) => prev + addedPoints);

      setTimeout(() => {
        advanceToNextQuestion();
      }, 1500);
    } else {
      soundService.playIncorrectSound();
      // Respuesta Incorrecta
      if (shieldActive) {
        // ESCUDO ACTIVO: Se pierde el escudo, pero NO se pierde la vida y puede elegir otra opción
        setShieldActive(false);
        setIsAnswerSubmitted(false);
        setSelectedAnswerIndex(null);
        setIsAnswerCorrect(null);
        // Ocultar la opción incorrecta intentada
        setHiddenOptionIndices((prev) => [...prev, optionIndex]);
        return;
      }

      // Restar vida
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        // GAME OVER
        setTimeout(() => {
          saveGameScore({
            playerName,
            score,
            questionsAnswered: questionsAnsweredCount,
          });
          setPhase("GAME_OVER");
        }, 1800);
      } else {
        setTimeout(() => {
          advanceToNextQuestion();
        }, 1800);
      }
    }
  };

  // COMODÍN 1: 50/50 (Elimina 2 incorrectas)
  const useFiftyFifty = (): boolean => {
    if (lifelines.fiftyFiftyCount <= 0 || !currentQuestion || isAnswerSubmitted) return false;

    soundService.playLifelineSound();
    const wrongIndices = [0, 1, 2, 3].filter((idx) => idx !== currentQuestion.correctIndex);

    // Seleccionar 2 aleatorios
    const shuffledWrong = [...wrongIndices].sort(() => Math.random() - 0.5);
    const toHide = shuffledWrong.slice(0, 2);

    setHiddenOptionIndices(toHide);
    setLifelines((prev) => ({ ...prev, fiftyFiftyCount: prev.fiftyFiftyCount - 1 }));
    return true;
  };

  // COMODÍN 2: SALTAR
  const useSkip = (): boolean => {
    if (lifelines.skipCount <= 0 || !currentQuestion || isAnswerSubmitted) return false;

    soundService.playLifelineSound();
    setLifelines((prev) => ({ ...prev, skipCount: prev.skipCount - 1 }));
    advanceToNextQuestion();
    return true;
  };

  // COMODÍN 3: ESCUDO
  const useShield = (): boolean => {
    if (lifelines.shieldCount <= 0 || !currentQuestion || isAnswerSubmitted || shieldActive) return false;

    soundService.playLifelineSound();
    setShieldActive(true);
    setLifelines((prev) => ({ ...prev, shieldCount: prev.shieldCount - 1 }));
    return true;
  };

  // COMODÍN 4: RESPUESTA CORRECTA
  const useCorrectAnswerHighlight = (): boolean => {
    if (lifelines.correctAnswerCount <= 0 || !currentQuestion || isAnswerSubmitted) return false;

    soundService.playLifelineSound();
    setHighlightedCorrectOption(currentQuestion.correctIndex);
    setLifelines((prev) => ({ ...prev, correctAnswerCount: prev.correctAnswerCount - 1 }));
    return true;
  };

  // COMODÍN 5: VIDA EXTRA
  const useExtraLife = (): boolean => {
    if (lifelines.extraLifeCount <= 0 || lives >= config.maxLives) return false;

    soundService.playLifelineSound();
    setLives((prev) => Math.min(prev + 1, config.maxLives));
    setLifelines((prev) => ({ ...prev, extraLifeCount: prev.extraLifeCount - 1 }));
    return true;
  };

  // RULETA DE PREMIOS
  const spinRoulette = () => {
    // Posibles premios definidos estrictamente en el prompt maestro
    const possiblePrizes = [
      {
        type: "POINTS_SMALL",
        label: `+${config.pointsRouletteSmallPrize} Puntos`,
        effect: () => setScore((s) => s + config.pointsRouletteSmallPrize),
      },
      {
        type: "POINTS_MEDIUM",
        label: `+${config.pointsRouletteMediumPrize} Puntos`,
        effect: () => setScore((s) => s + config.pointsRouletteMediumPrize),
      },
      {
        type: "EXTRA_LIFE",
        label: "+1 Vida Extra",
        effect: () => setLives((l) => Math.min(l + 1, config.maxLives)),
      },
      {
        type: "FIFTY_FIFTY",
        label: "Comodín 50/50",
        effect: () => setLifelines((prev) => ({ ...prev, fiftyFiftyCount: prev.fiftyFiftyCount + 1 })),
      },
      {
        type: "SHIELD",
        label: "Comodín Escudo",
        effect: () => setLifelines((prev) => ({ ...prev, shieldCount: prev.shieldCount + 1 })),
      },
      {
        type: "BONUS_ROUND",
        label: "Ronda de Preguntas Fáciles (3 Preguntas)",
        effect: () => {
          setBonusQuestionsRemaining(3);
        },
      },
    ];

    const selected = possiblePrizes[Math.floor(Math.random() * possiblePrizes.length)];
    setRoulettePrizeMessage(selected.label);
    setCurrentPrizeEffect(() => selected.effect);

    return { prizeType: selected.type, label: selected.label };
  };

  const claimRoulettePrizeAndContinue = () => {
    if (currentPrizeEffect) {
      currentPrizeEffect();
      setCurrentPrizeEffect(null);
    }

    if (bonusQuestionsRemaining > 0 && bonusQuestions.length > 0) {
      const randomBonus = bonusQuestions[Math.floor(Math.random() * bonusQuestions.length)];
      setCurrentQuestion(shuffleQuestionOptions(randomBonus));
      setPhase("BONUS_ROUND");
    } else {
      advanceToNextQuestion();
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
        currentQuestion,
        hiddenOptionIndices,
        highlightedCorrectOption,
        shieldActive,
        selectedAnswerIndex,
        isAnswerSubmitted,
        isAnswerCorrect,
        lifelines,
        roulettePrizeMessage,
        bonusQuestionsRemaining,
        startNewGameSession,
        submitPlayerNameAndBegin,
        handleAnswerSelection,
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

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame debe utilizarse dentro de un GameProvider");
  }
  return context;
};
