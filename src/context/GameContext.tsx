import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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

  // Jugador (Nombre obligatorio para comenzar y para el ranking)
  playerName: string;
  setPlayerName: (name: string) => void;
  isNameValid: boolean;

  // Estado de la partida
  lives: number;
  score: number;
  questionsAnsweredCount: number;
  correctAnswersForRouletteCount: number; // Cuenta exactamente: 1 -> 2 -> 3 -> Ruleta

  // Pregunta actual (Única fuente de verdad)
  currentQuestion: Question | null;
  hiddenOptionIndices: number[];
  highlightedCorrectOption: number | null;
  shieldActive: boolean;
  selectedAnswerIndex: number | null;
  isAnswerSubmitted: boolean;
  isAnswerCorrect: boolean | null;

  // ÚNICOS 5 COMODINES OFICIALES
  lifelines: LifelinesState;

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

  // Ruleta: Cuenta exactamente 3 preguntas correctas
  const [correctAnswersForRouletteCount, setCorrectAnswersForRouletteCount] = useState<number>(0);

  // Banco de preguntas
  const [normalQuestions, setNormalQuestions] = useState<Question[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<Question[]>([]);
  const [unusedNormalQuestions, setUnusedNormalQuestions] = useState<Question[]>([]);
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
    correctAnswerCount: 1,
    extraLifeCount: 1,
  });

  // Estado de Ruleta y Bonus
  const [roulettePrizeMessage, setRoulettePrizeMessage] = useState<string | null>(null);
  const [currentPrizeEffect, setCurrentPrizeEffect] = useState<(() => void) | null>(null);
  const [bonusQuestionsRemaining, setBonusQuestionsRemaining] = useState<number>(0);

  // Carga inicial del banco de preguntas local
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

  // 2. INICIO OBLIGATORIO: Validar nombre antes de comenzar
  const submitPlayerNameAndBegin = (name: string): boolean => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setIsNameValid(false);
      return false;
    }

    setPlayerNameState(trimmed);
    setIsNameValid(true);

    // Reiniciar estadísticas de partida: 3 vidas iniciales
    setLives(3);
    setScore(0);
    setQuestionsAnsweredCount(0);
    setCorrectAnswersForRouletteCount(0);

    // Comodines iniciales
    setLifelines({
      fiftyFiftyCount: 1,
      skipCount: 1,
      shieldCount: 1,
      correctAnswerCount: 1,
      extraLifeCount: 1,
    });

    // 15 y 19: MÍNIMO 30 PREGUNTAS NORMALES sin repetición por partida
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

  const getNextNormalQuestion = (): { nextQ: Question; remainingPool: Question[] } => {
    let pool = [...unusedNormalQuestions];
    if (pool.length === 0) {
      const freshPool = [...normalQuestions].sort(() => Math.random() - 0.5);
      pool = freshPool.filter((q) => !currentQuestion || q.id !== currentQuestion.id);
      if (pool.length === 0) pool = freshPool;
    }

    const nextRaw = pool[0] || normalQuestions[0];
    const nextQ = shuffleQuestionOptions(nextRaw);
    return { nextQ, remainingPool: pool.slice(1) };
  };

  // Carga la siguiente pregunta
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
        // Fin del bonus: volver al juego normal
        const { nextQ, remainingPool } = getNextNormalQuestion();
        setCurrentQuestion(nextQ);
        setUnusedNormalQuestions(remainingPool);
        setPhase("PLAYING");
        return;
      }
    }

    // 2. Incrementar contador de progreso
    setQuestionsAnsweredCount((prev) => prev + 1);

    // 3. Cargar la siguiente pregunta normal sin repetir
    const { nextQ, remainingPool } = getNextNormalQuestion();
    setCurrentQuestion(nextQ);
    setUnusedNormalQuestions(remainingPool);
    setPhase("PLAYING");
  };

  // MANEJA LA RESPUESTA
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

      // Si no estamos en ronda bonus, verificar la regla de las 3 respuestas correctas para la ruleta
      if (bonusQuestionsRemaining <= 0) {
        const nextCorrectCount = correctAnswersForRouletteCount + 1;

        if (nextCorrectCount >= 3) {
          // ¡3 PREGUNTAS CORRECTAS ALCANZADAS! → RULETA
          setCorrectAnswersForRouletteCount(0);

          // Pre-cargar la siguiente pregunta para cuando finalice la ruleta
          const { nextQ, remainingPool } = getNextNormalQuestion();
          setCurrentQuestion(nextQ);
          setUnusedNormalQuestions(remainingPool);

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

      // Regla 7: Una respuesta incorrecta NO debe incrementar el contador de ruleta
      // (el contador correctAnswersForRouletteCount se mantiene intacto sin sumar)

      // Regla 4: ESCUDO ACTIVO
      // "Si el jugador responde incorrectamente con ESCUDO activo:
      //  - la respuesta sigue siendo incorrecta
      //  - no pierde la vida protegida
      //  - puede volver a responder la MISMA pregunta
      //  - no cambiar la pregunta"
      if (shieldActive) {
        transitionTimeoutRef.current = setTimeout(() => {
          setShieldActive(false); // Se consume el escudo
          setIsAnswerSubmitted(false);
          setSelectedAnswerIndex(null);
          setIsAnswerCorrect(null);
          if (optionIndex >= 0) {
            setHiddenOptionIndices((prev) => [...prev, optionIndex]); // Ocultar opción errónea intentada
          }
        }, 800);
        return;
      }

      // Pérdida de 1 corazón
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        // Regla 3: Cuando las vidas llegan a 0: GAME OVER. No continuar la partida.
        transitionTimeoutRef.current = setTimeout(() => {
          saveGameScore({
            playerName,
            score,
            questionsAnswered: questionsAnsweredCount,
          });
          setPhase("GAME_OVER");
        }, 1400);
      } else {
        transitionTimeoutRef.current = setTimeout(() => {
          advanceToNextQuestion();
        }, 1400);
      }
    }
  };

  // ==========================================
  // ÚNICAMENTE LOS 5 COMODINES OFICIALES
  // ==========================================

  // 1. 50/50: Elimina 2 opciones incorrectas. Quedan 2 respuestas.
  const useFiftyFifty = (): boolean => {
    if (lifelines.fiftyFiftyCount <= 0 || !currentQuestion || isAnswerSubmitted || hiddenOptionIndices.length >= 2) {
      return false;
    }
    soundService.playLifelineSound();
    const wrongIndices = [0, 1, 2, 3].filter(
      (idx) => idx !== currentQuestion.correctIndex && !hiddenOptionIndices.includes(idx)
    );
    const shuffled = [...wrongIndices].sort(() => Math.random() - 0.5);
    setHiddenOptionIndices((prev) => [...prev, ...shuffled.slice(0, 2)]);
    setLifelines((prev) => ({ ...prev, fiftyFiftyCount: prev.fiftyFiftyCount - 1 }));
    return true;
  };

  // 2. SALTAR: Saltar la pregunta actual. No perder vida. Continuar con otra pregunta.
  // Regla 7: SALTAR NO cuenta como respuesta correcta para la ruleta.
  const useSkip = (): boolean => {
    if (lifelines.skipCount <= 0 || !currentQuestion || isAnswerSubmitted) {
      return false;
    }
    soundService.playLifelineSound();
    setLifelines((prev) => ({ ...prev, skipCount: prev.skipCount - 1 }));
    advanceToNextQuestion();
    return true;
  };

  // 3. ESCUDO: Protege contra el próximo fallo permitiendo reintentar la MISMA pregunta sin perder vida.
  const useShield = (): boolean => {
    if (lifelines.shieldCount <= 0 || !currentQuestion || isAnswerSubmitted || shieldActive) {
      return false;
    }
    soundService.playLifelineSound();
    setShieldActive(true);
    setLifelines((prev) => ({ ...prev, shieldCount: prev.shieldCount - 1 }));
    return true;
  };

  // 4. RESPUESTA CORRECTA: Marca visualmente cuál de las 4 opciones es correcta. El jugador debe pulsarla.
  const useCorrectAnswerHighlight = (): boolean => {
    if (lifelines.correctAnswerCount <= 0 || !currentQuestion || isAnswerSubmitted || highlightedCorrectOption !== null) {
      return false;
    }
    soundService.playLifelineSound();
    setHighlightedCorrectOption(currentQuestion.correctIndex);
    setLifelines((prev) => ({ ...prev, correctAnswerCount: prev.correctAnswerCount - 1 }));
    return true;
  };

  // 5. VIDA EXTRA: Añadir +1 corazón. Nunca superar 5.
  const useExtraLife = (): boolean => {
    if (lifelines.extraLifeCount <= 0 || lives >= 5 || isAnswerSubmitted) {
      return false;
    }
    soundService.playLifelineSound();
    setLives((prev) => Math.min(prev + 1, 5));
    setLifelines((prev) => ({ ...prev, extraLifeCount: prev.extraLifeCount - 1 }));
    return true;
  };

  // ==========================================
  // RULETA Y PREMIOS OFICIALES
  // ==========================================
  const spinRoulette = () => {
    // Premios permitidos según especificación:
    // - comodines
    // - vida extra
    // - puntos
    // - RONDA DE PREGUNTAS FÁCILES
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
        effect: () => setLives((l) => Math.min(l + 1, 5)),
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
        type: "CORRECT_ANSWER",
        label: "Comodín Respuesta Correcta",
        effect: () => setLifelines((prev) => ({ ...prev, correctAnswerCount: prev.correctAnswerCount + 1 })),
      },
      {
        type: "SKIP",
        label: "Comodín Saltar Pregunta",
        effect: () => setLifelines((prev) => ({ ...prev, skipCount: prev.skipCount + 1 })),
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
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
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
        correctAnswersForRouletteCount,
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

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame debe utilizarse dentro de un GameProvider");
  }
  return context;
};
