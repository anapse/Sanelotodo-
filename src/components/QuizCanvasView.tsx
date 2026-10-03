import React, { useState, useEffect } from "react";
import { useGame, MYSTERY_SLOTS_DEFINITIONS, MysterySlotDef } from "../context/GameContext";
import { useStageDimensions } from "../context/StageContext";
import { HeaderHUD } from "./HeaderHUD";
import { SpriteIcon, IconName } from "./SpriteIcon";
import { soundService } from "../services/soundService";
import { Clock, Sparkles, Gift, Shield, Info, X, Lock, HelpCircle } from "lucide-react";

interface ComodinInfo {
  key: string;
  name: string;
  shortName: string;
  icon: IconName;
  whatItDoes: string;
  whenToUse: string;
}

const OFFICIAL_COMODINES_INFO: ComodinInfo[] = [
  {
    key: "fiftyFifty",
    name: "50 / 50",
    shortName: "50/50",
    icon: "fiftyFifty",
    whatItDoes: "Elimina dos opciones incorrectas de la pantalla. Quedan únicamente dos respuestas posibles para elegir.",
    whenToUse: "En cualquier pregunta antes de responder, si dudas entre varias opciones.",
  },
  {
    key: "skip",
    name: "SALTAR PREGUNTA",
    shortName: "SALTAR",
    icon: "skip",
    whatItDoes: "Salta la pregunta actual sin perder vida y continúa con otra pregunta nueva. (No cuenta como acierto para la ruleta).",
    whenToUse: "Cuando desconozcas por completo el tema y prefieras no arriesgar un corazón.",
  },
  {
    key: "shield",
    name: "ESCUDO PROTECTOR",
    shortName: "ESCUDO",
    icon: "shield",
    whatItDoes: "Si respondes incorrectamente: la respuesta sigue siendo incorrecta pero NO pierdes vida y puedes volver a responder la MISMA pregunta.",
    whenToUse: "Actívalo antes de contestar cuando quieras una red de seguridad contra fallos.",
  },
  {
    key: "correctAnswer",
    name: "RESPUESTA CORRECTA (PISTA)",
    shortName: "PISTA",
    icon: "correctAnswer",
    whatItDoes: "Marca visualmente con resplandor dorado cuál de las 4 opciones es la correcta. El jugador debe pulsarla.",
    whenToUse: "En preguntas de alta dificultad o cuando te quede solo 1 vida. Se desbloquea en la Ruleta.",
  },
  {
    key: "extraLife",
    name: "VIDA EXTRA (+1 CORAZÓN)",
    shortName: "+1 VIDA",
    icon: "extraLife",
    whatItDoes: "Añade +1 corazón a tu contador de vidas. Nunca puede superar el límite máximo de 5 corazones.",
    whenToUse: "En cualquier momento que tengas menos de 5 corazones. Se desbloquea en la Ruleta.",
  },
];

export const QuizCanvasView: React.FC = () => {
  const {
    phase,
    currentQuestion,
    handleAnswerSelection,
    advanceToNextQuestion,
    selectedAnswerIndex,
    isAnswerSubmitted,
    isAnswerCorrect,
    lifelines,
    unlockedMysteryIndices,
    useFiftyFifty,
    useSkip,
    useShield,
    useCorrectAnswerHighlight,
    useExtraLife,
    useMysteryBooster,
    hiddenOptionIndices,
    highlightedCorrectOption,
    shieldActive,
  } = useGame();

  const {
    stageWidth,
    stageHeight,
    timerHeight,
    contentHeight,
    contentQuestionHeight,
    contentAnswersHeight,
    contentGapQuestionAnswers,
    contentGapAnswersJokers,
    answersSideInset,
    answersGapX,
    answersGapY,
    jokerAreaHeight,
    jokerCardHeight,
    jokerGap,
    jokerPaddingX,
    fontScale,
    iconScale,
  } = useStageDimensions();

  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [showParticles, setShowParticles] = useState<boolean>(false);
  const [activeInfoModal, setActiveInfoModal] = useState<ComodinInfo | MysterySlotDef | null>(null);

  // Reiniciar temporizador al cambiar la pregunta
  useEffect(() => {
    setTimeLeft(20);
    setShowParticles(false);
  }, [currentQuestion?.id]);

  useEffect(() => {
    if (isAnswerSubmitted && isAnswerCorrect) {
      setShowParticles(true);
    } else {
      setShowParticles(false);
    }
  }, [isAnswerSubmitted, isAnswerCorrect]);

  // Watchdog de seguridad (garantiza que nunca se quede congelado)
  useEffect(() => {
    if (!isAnswerSubmitted) return;

    const watchdog = setTimeout(() => {
      if (isAnswerSubmitted && !shieldActive) {
        advanceToNextQuestion();
      }
    }, 2500);

    return () => clearTimeout(watchdog);
  }, [isAnswerSubmitted, shieldActive, advanceToNextQuestion]);

  const isPlayingPhase = phase === "PLAYING" || phase === "BONUS_ROUND";

  // Temporizador rígido
  useEffect(() => {
    if (!isPlayingPhase || isAnswerSubmitted || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        const nextTime = prev - 1;
        if (nextTime <= 5 && nextTime > 0) {
          soundService.playTickBeep();
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion?.id, isPlayingPhase, isAnswerSubmitted]);

  // Agotamiento del tiempo (pierde 1 vida si no hay escudo)
  useEffect(() => {
    if (timeLeft === 0 && !isAnswerSubmitted && isPlayingPhase) {
      soundService.playIncorrectSound();
      handleAnswerSelection(-1);
    }
  }, [timeLeft, isAnswerSubmitted, isPlayingPhase, handleAnswerSelection]);

  const isInteractionDisabled = isAnswerSubmitted || !isPlayingPhase;

  const handleSelectOption = (index: number) => {
    if (isInteractionDisabled || hiddenOptionIndices.includes(index)) return;
    soundService.playClickSound();
    handleAnswerSelection(index);
  };

  if (!currentQuestion) return null;

  const isTimeCritical = timeLeft <= 5 && timeLeft > 0 && isPlayingPhase && !isAnswerSubmitted;

  let timerBadgeColor = "bg-[#0d2a57] border-2 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.45)]";
  let timerBarGradient = "bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-400";

  if (timeLeft <= 10 && timeLeft > 5) {
    timerBadgeColor = "bg-[#45280b] border-2 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]";
    timerBarGradient = "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400";
  } else if (timeLeft <= 5) {
    timerBadgeColor = "bg-[#4a0d0d] border-2 border-red-500 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.9)]";
    timerBarGradient = "bg-gradient-to-r from-red-600 via-rose-500 to-red-500 animate-pulse";
  }

  // Tipografía adaptativa precisa para la tarjeta de pregunta
  const getQuestionFontSize = (text: string) => {
    const len = text.trim().length;
    if (len <= 45) return Math.max(Math.round(20 * fontScale), 15);
    if (len <= 80) return Math.max(Math.round(17 * fontScale), 13);
    if (len <= 120) return Math.max(Math.round(15 * fontScale), 12);
    return Math.max(Math.round(13.5 * fontScale), 11.5);
  };

  // Tipografía adaptativa precisa para las opciones de respuesta
  const getOptionFontSize = (text: string) => {
    const len = text.trim().length;
    if (len <= 8) return Math.max(Math.round(20 * fontScale), 15);
    if (len <= 16) return Math.max(Math.round(16 * fontScale), 13);
    if (len <= 26) return Math.max(Math.round(14 * fontScale), 12);
    if (len <= 40) return Math.max(Math.round(12.5 * fontScale), 11);
    return Math.max(Math.round(11.5 * fontScale), 10);
  };

  const qFontSize = getQuestionFontSize(currentQuestion.question);
  const jokerIconSize = Math.max(Math.round(24 * iconScale), 16);

  // -----------------------------------------------------------------
  // FILA 1: 5 COMODINES (3 desbloqueados iniciales, 2 bloqueados visibles)
  // -----------------------------------------------------------------
  const row1Slots = [
    {
      info: OFFICIAL_COMODINES_INFO[0], // 50/50
      count: lifelines.fiftyFiftyCount,
      action: useFiftyFifty,
      isUnlocked: true,
      isAvailable: lifelines.fiftyFiftyCount > 0 && !isInteractionDisabled,
    },
    {
      info: OFFICIAL_COMODINES_INFO[1], // SALTAR
      count: lifelines.skipCount,
      action: useSkip,
      isUnlocked: true,
      isAvailable: lifelines.skipCount > 0 && !isInteractionDisabled,
    },
    {
      info: OFFICIAL_COMODINES_INFO[2], // ESCUDO
      count: lifelines.shieldCount,
      action: useShield,
      isUnlocked: true,
      isAvailable: lifelines.shieldCount > 0 && !isInteractionDisabled && !shieldActive,
    },
    {
      info: OFFICIAL_COMODINES_INFO[3], // PISTA (Bloqueado visible)
      count: lifelines.correctAnswerCount,
      action: useCorrectAnswerHighlight,
      isUnlocked: lifelines.correctAnswerCount > 0,
      isAvailable: lifelines.correctAnswerCount > 0 && !isInteractionDisabled && highlightedCorrectOption === null,
    },
    {
      info: OFFICIAL_COMODINES_INFO[4], // +1 VIDA (Bloqueado visible)
      count: lifelines.extraLifeCount,
      action: useExtraLife,
      isUnlocked: lifelines.extraLifeCount > 0,
      isAvailable: lifelines.extraLifeCount > 0 && !isInteractionDisabled,
    },
  ];

  // -----------------------------------------------------------------
  // FILA 2: 5 COMODINES MISTERIOSOS (Bloqueados inicialmente, identidad oculta '?')
  // -----------------------------------------------------------------
  const row2Slots = MYSTERY_SLOTS_DEFINITIONS.map((def, idx) => {
    const isUnlocked = unlockedMysteryIndices.includes(idx);
    return {
      def,
      idx,
      isUnlocked,
      action: () => useMysteryBooster(idx),
      isAvailable: isUnlocked && !isInteractionDisabled,
    };
  });

  return (
    <div
      style={{ width: `${stageWidth}px`, height: `${stageHeight}px` }}
      className="relative overflow-hidden text-white font-sans select-none flex flex-col justify-between"
    >
      {/* ------------------------------------------------------------- */}
      {/* OVERLAYS VISUALES                                             */}
      {/* ------------------------------------------------------------- */}
      {isTimeCritical && (
        <div className="absolute inset-0 pointer-events-none z-30 bg-red-600/15 animate-pulse border-4 border-red-500 rounded-3xl" />
      )}

      {showParticles && (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden flex items-center justify-center bg-emerald-500/15">
          <div className="relative z-50 flex items-center justify-center gap-2 animate-bounce">
            <Sparkles size={Math.round(32 * iconScale)} className="text-yellow-300 animate-spin" />
            <span
              style={{ fontSize: `${Math.round(28 * fontScale)}px` }}
              className="font-black text-amber-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] tracking-widest uppercase"
            >
              ¡CORRECTO!
            </span>
            <Sparkles size={Math.round(32 * iconScale)} className="text-yellow-300 animate-spin" />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CARTEL INFORMATIVO DEL COMODÍN                                */}
      {/* ------------------------------------------------------------- */}
      {activeInfoModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
          <div
            style={{ width: `${Math.min(Math.round(stageWidth * 0.88), 380)}px` }}
            className="bg-blue-950 border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-2xl relative text-center"
          >
            <button
              onClick={() => setActiveInfoModal(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 cursor-pointer"
              aria-label="Cerrar Cartel"
            >
              <X size={18} />
            </button>

            <div
              style={{ width: `${Math.round(52 * iconScale)}px`, height: `${Math.round(52 * iconScale)}px` }}
              className="bg-[#132352] border-2 border-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-md"
            >
              <SpriteIcon name={activeInfoModal.icon} size={Math.round(34 * iconScale)} />
            </div>

            <h3
              style={{ fontSize: `${Math.max(Math.round(18 * fontScale), 14)}px` }}
              className="font-black text-amber-300 uppercase tracking-wide mb-2.5"
            >
              {activeInfoModal.name}
            </h3>

            <div className="space-y-2 text-left bg-blue-900/60 p-3 rounded-2xl border border-blue-700/60 text-xs">
              <div>
                <span className="block font-black text-amber-400 uppercase tracking-wider text-[11px] mb-0.5">
                  📌 ¿Qué hace?
                </span>
                <p className="text-slate-200 leading-relaxed text-[11px] sm:text-xs">{activeInfoModal.whatItDoes}</p>
              </div>

              <div>
                <span className="block font-black text-amber-400 uppercase tracking-wider text-[11px] mb-0.5">
                  ⚡ ¿Cuándo se puede utilizar?
                </span>
                <p className="text-slate-200 leading-relaxed text-[11px] sm:text-xs">{activeInfoModal.whenToUse}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveInfoModal(null)}
              style={{ fontSize: `${Math.max(Math.round(12 * fontScale), 11)}px` }}
              className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. HUD SUPERIOR (Aprox 13% de stageHeight)                   */}
      {/* ------------------------------------------------------------- */}
      <HeaderHUD />

      {/* ------------------------------------------------------------- */}
      {/* FRANJA DE RONDA BONUS (Solo si activa)                       */}
      {/* ------------------------------------------------------------- */}
      {phase === "BONUS_ROUND" && (
        <div
          style={{ height: `${Math.round(stageHeight * 0.035)}px`, fontSize: `${Math.max(10 * fontScale, 8)}px` }}
          className="w-full shrink-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md border-b border-amber-600 animate-pulse z-10"
        >
          <Gift size={12} />
          <span>¡RONDA BONUS DE PREGUNTAS FÁCILES!</span>
          <Sparkles size={12} />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. BARRA DE TIEMPO (Aprox 7% de stageHeight)                 */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{ height: `${timerHeight}px` }}
        className="w-full px-3 sm:px-4 shrink-0 flex items-center gap-2.5 z-10"
      >
        {/* Contador numérico */}
        <div
          style={{
            width: `${Math.round(52 * fontScale)}px`,
            height: `${Math.round(timerHeight * 0.72)}px`,
            fontSize: `${Math.max(15 * fontScale, 12)}px`,
          }}
          className={`shrink-0 rounded-xl flex items-center justify-center font-mono font-black tabular-nums text-center transition-colors duration-300 ${timerBadgeColor}`}
        >
          <span>{timeLeft}s</span>
        </div>

        {/* Barra de progreso */}
        <div className="flex-1 flex flex-col justify-center">
          <div
            style={{ fontSize: `${Math.max(10 * fontScale, 8)}px` }}
            className="flex items-center justify-between font-extrabold uppercase text-amber-200 mb-0.5 drop-shadow"
          >
            <span className="flex items-center gap-1">
              <Clock size={Math.round(12 * iconScale)} className={timeLeft <= 5 ? "text-red-400" : "text-amber-400"} />
              Tiempo {!isPlayingPhase && "(EN PAUSA)"}
            </span>
            <div className="flex items-center gap-1.5">
              {shieldActive && (
                <span className="text-[9px] text-blue-300 font-bold flex items-center gap-0.5 bg-blue-900/90 px-1.5 py-0.2 rounded-full border border-blue-400 animate-pulse">
                  <Shield size={10} /> Escudo Activo
                </span>
              )}
              <span className="text-slate-300 font-bold tabular-nums font-mono">20s máx</span>
            </div>
          </div>
          <div
            style={{ height: `${Math.max(Math.round(timerHeight * 0.16), 6)}px` }}
            className="w-full bg-slate-950/90 rounded-full overflow-hidden border border-amber-500/60 shadow-inner"
          >
            <div
              style={{ width: `${(timeLeft / 20) * 100}%` }}
              className={`h-full transition-all duration-1000 ${timerBarGradient}`}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. ÁREA CENTRAL: PREGUNTA + GAP + RESPUESTAS (contentHeight)  */}
      {/* Con separación vertical clara y insets laterales en respuestas*/}
      {/* ------------------------------------------------------------- */}
      <div
        style={{ height: `${contentHeight}px` }}
        className="w-full flex flex-col justify-between shrink-0 z-10"
      >
        {/* TARJETA DE PREGUNTA (COMPACTA Y SIN ESPACIOS VACÍOS INNECESARIOS) */}
        <div
          style={{
            height: `${contentQuestionHeight}px`,
            marginLeft: `${Math.max(Math.floor(stageWidth * 0.035), 10)}px`,
            marginRight: `${Math.max(Math.floor(stageWidth * 0.035), 10)}px`,
          }}
          className="bg-gradient-to-b from-[#142a63] to-[#0d1c44] border-2 border-amber-400 rounded-2xl px-2.5 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.7)] text-center flex flex-col justify-center items-center overflow-hidden shrink-0"
        >
          <span
            style={{ fontSize: `${Math.max(9.5 * fontScale, 8)}px` }}
            className="font-black uppercase tracking-widest text-amber-300 mb-0.5 shrink-0 drop-shadow"
          >
            Categoría: {currentQuestion.category || "Cultura General"}
          </span>
          <div className="w-full overflow-hidden flex items-center justify-center flex-1 px-1">
            <h2
              style={{ fontSize: `${qFontSize}px`, lineHeight: 1.25 }}
              className="font-extrabold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] text-center break-words max-h-full overflow-hidden"
            >
              {currentQuestion.question}
            </h2>
          </div>
        </div>

        {/* GAP VISUAL CLARO ENTRE PREGUNTA Y RESPUESTAS */}
        <div style={{ height: `${contentGapQuestionAnswers}px` }} className="shrink-0" />

        {/* CUADRÍCULA DE RESPUESTAS 2x2 (CON INSET LATERAL, GAPS Y PADDING OPTIMIZADO) */}
        <div
          style={{
            height: `${contentAnswersHeight}px`,
            marginLeft: `${answersSideInset}px`,
            marginRight: `${answersSideInset}px`,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gridTemplateRows: "repeat(2, minmax(0, 1fr))",
            columnGap: `${answersGapX}px`,
            rowGap: `${answersGapY}px`,
          }}
          className="shrink-0"
        >
          {currentQuestion.options.map((option, idx) => {
            const isDisabled = hiddenOptionIndices.includes(idx) || isInteractionDisabled;
            const isSelected = selectedAnswerIndex === idx;
            const isCorrect = isAnswerSubmitted && idx === currentQuestion.correctIndex;
            const isWrong = isAnswerSubmitted && isSelected && idx !== currentQuestion.correctIndex;
            const isHighlightedByLifeline = highlightedCorrectOption === idx;

            let btnStyle = "bg-gradient-to-b from-[#173072] via-[#1c3a88] to-[#142962] border-2 border-amber-400 text-white shadow-[0_6px_16px_rgba(0,0,0,0.6)] hover:border-yellow-300 hover:brightness-110 active:scale-95";

            if (isHighlightedByLifeline && !isAnswerSubmitted) {
              btnStyle = "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 border-2 border-yellow-200 text-slate-950 font-black shadow-[0_0_25px_rgba(245,186,19,0.95)] animate-pulse scale-[1.02]";
            }
            if (isCorrect) {
              btnStyle = "bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 border-2 border-emerald-300 text-white font-black shadow-[0_0_25px_rgba(16,185,129,0.85)] scale-[1.02]";
            }
            if (isWrong) {
              btnStyle = "bg-gradient-to-r from-red-600 via-rose-600 to-red-500 border-2 border-red-300 text-white font-black shadow-[0_0_25px_rgba(239,68,68,0.85)]";
            }
            if (isDisabled && !isCorrect && !isWrong) {
              btnStyle = "opacity-20 pointer-events-none bg-[#091433] border border-slate-700/60 text-slate-500";
            }

            const optFontSize = getOptionFontSize(option);

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isDisabled}
                className={`w-full h-full px-2 py-1 rounded-2xl flex items-center justify-center text-center transition-all relative overflow-hidden cursor-pointer ${btnStyle}`}
              >
                <span
                  style={{ fontSize: `${optFontSize}px`, lineHeight: 1.2 }}
                  className="relative z-10 drop-shadow font-extrabold text-center break-words px-1 max-h-full overflow-hidden"
                >
                  {option}
                </span>

                {isHighlightedByLifeline && !isAnswerSubmitted && (
                  <span className="absolute top-1 left-1 bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded-full text-[8px] font-black shadow z-20">
                    ★ PISTA
                  </span>
                )}

                {isCorrect && (
                  <span className="absolute top-1 right-1 bg-yellow-400 text-slate-950 p-0.5 rounded-full text-[10px] font-black shadow z-20">
                    ✓
                  </span>
                )}
                {isWrong && (
                  <span className="absolute top-1 right-1 bg-red-950 text-red-400 p-0.5 rounded-full text-[10px] font-black shadow z-20">
                    ✕
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* GAP VISUAL CLARO ENTRE RESPUESTAS Y COMODINES */}
        <div style={{ height: `${contentGapAnswersJokers}px` }} className="shrink-0" />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. ZONA DE COMODINES: 10 ESPACIOS EN 5 COLUMNAS × 2 FILAS      */}
      {/* ANCLADA AL FONDO (Aprox 25% de stageHeight)                  */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          height: `${jokerAreaHeight}px`,
          paddingLeft: `${jokerPaddingX}px`,
          paddingRight: `${jokerPaddingX}px`,
          paddingBottom: `${jokerPaddingX}px`,
        }}
        className="w-full shrink-0 bg-gradient-to-t from-[#08122d] via-[#0b183a] to-transparent border-t border-amber-500/30 z-20 flex flex-col justify-between"
      >
        {/* Encabezado */}
        <div
          style={{ height: `${Math.round(stageHeight * 0.026)}px`, fontSize: `${Math.max(10 * fontScale, 8)}px` }}
          className="flex items-center justify-between px-1 font-black uppercase text-amber-300 tracking-wider shrink-0"
        >
          <span>Zona de Comodines (10 Espacios)</span>
          <span style={{ fontSize: `${Math.max(9 * fontScale, 7)}px` }} className="text-amber-400/80 font-normal">
            Toca ℹ️ para detalles
          </span>
        </div>

        {/* FILA 1: 5 ESPACIOS (3 DESBLOQUEADOS / 2 BLOQUEADOS VISIBLES) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: `${jokerGap}px`,
            height: `${jokerCardHeight}px`,
          }}
          className="w-full shrink-0"
        >
          {row1Slots.map((c) => {
            const isUnlocked = c.isUnlocked;
            const isAvailable = c.isAvailable;
            const isLocked = !isUnlocked || c.count <= 0;

            let cardStyle = "bg-gradient-to-b from-[#1c377d] to-[#132759] border-2 border-amber-400 text-amber-300 shadow-md hover:border-yellow-300 hover:brightness-110 active:scale-95 cursor-pointer";
            if (isLocked) {
              cardStyle = "bg-[#091533]/90 border border-slate-700/80 text-slate-400 opacity-60 shadow-inner";
            }

            return (
              <div
                key={c.info.key}
                style={{ height: `${jokerCardHeight}px` }}
                className={`w-full rounded-xl flex flex-col items-center justify-between p-1 relative overflow-hidden transition-all ${cardStyle}`}
              >
                {/* Botón Cartel Informativo ℹ️ */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfoModal(c.info);
                  }}
                  className="absolute top-0.5 left-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-950/90 border border-amber-400/60 text-amber-300 flex items-center justify-center hover:bg-amber-400 hover:text-slate-950 transition-all z-20 cursor-pointer"
                  title={`Información de ${c.info.name}`}
                  aria-label={`Información de ${c.info.name}`}
                >
                  <Info size={9} />
                </button>

                {/* Badge de estado */}
                <div className="absolute top-0.5 right-0.5 z-20">
                  {isUnlocked && c.count > 0 ? (
                    <span
                      style={{ fontSize: `${Math.max(8 * fontScale, 7)}px` }}
                      className="font-mono font-black px-1 py-0.2 rounded-full bg-amber-400 text-slate-950 border border-amber-200 shadow"
                    >
                      x{c.count}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-800/90 text-amber-300/80 border border-slate-600 shadow" title="Bloqueado (Consíguelo en la Ruleta)">
                      <Lock size={9} />
                    </span>
                  )}
                </div>

                {/* Área clickeable */}
                <button
                  onClick={c.action}
                  disabled={!isAvailable}
                  className="w-full flex-1 flex flex-col items-center justify-center mt-1 cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none"
                  title={c.info.name}
                >
                  <SpriteIcon
                    name={c.info.icon}
                    size={jokerIconSize}
                    className={`relative z-10 ${isLocked ? "grayscale opacity-50" : ""}`}
                  />
                  <span
                    style={{ fontSize: `${Math.max(8 * fontScale, 7)}px` }}
                    className={`font-black uppercase mt-0.5 tracking-tight text-center leading-none relative z-10 drop-shadow truncate w-full ${isLocked ? "text-slate-400" : "text-amber-200"}`}
                  >
                    {c.info.shortName}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* FILA 2: 5 ESPACIOS MISTERIOSOS (IDENTIDAD OCULTA '?') */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: `${jokerGap}px`,
            height: `${jokerCardHeight}px`,
          }}
          className="w-full shrink-0"
        >
          {row2Slots.map((m) => {
            const isUnlocked = m.isUnlocked;

            let cardStyle = "bg-[#060e22]/90 border border-dashed border-amber-500/40 text-amber-300/60 shadow-inner";
            if (isUnlocked) {
              cardStyle = "bg-gradient-to-b from-[#1b3d73] to-[#122852] border-2 border-yellow-300 text-yellow-300 shadow-md hover:brightness-110 active:scale-95 cursor-pointer animate-pulse";
            }

            return (
              <div
                key={m.def.id}
                style={{ height: `${jokerCardHeight}px` }}
                className={`w-full rounded-xl flex flex-col items-center justify-between p-1 relative overflow-hidden transition-all ${cardStyle}`}
              >
                {/* Botón Info si desbloqueado */}
                {isUnlocked ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveInfoModal(m.def);
                    }}
                    className="absolute top-0.5 left-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-950/90 border border-yellow-400/80 text-yellow-300 flex items-center justify-center hover:bg-yellow-400 hover:text-slate-950 transition-all z-20 cursor-pointer"
                    title={`Información de ${m.def.name}`}
                  >
                    <Info size={9} />
                  </button>
                ) : (
                  <span
                    style={{ fontSize: `${Math.max(8 * fontScale, 7)}px` }}
                    className="absolute top-0.5 left-0.5 text-amber-400/40 font-mono font-bold"
                  >
                    #{m.idx + 6}
                  </span>
                )}

                {/* Badge de estado */}
                <div className="absolute top-0.5 right-0.5 z-20">
                  {isUnlocked ? (
                    <span
                      style={{ fontSize: `${Math.max(8 * fontScale, 7)}px` }}
                      className="font-mono font-black px-1 py-0.2 rounded-full bg-yellow-400 text-slate-950 border border-yellow-200 shadow"
                    >
                      x1
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900/90 text-slate-500 border border-slate-700 shadow" title="Comodín Misterioso Bloqueado">
                      <Lock size={9} />
                    </span>
                  )}
                </div>

                {/* Contenido / Botón */}
                <button
                  onClick={m.action}
                  disabled={!m.isAvailable}
                  className="w-full flex-1 flex flex-col items-center justify-center mt-1 cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none"
                  title={isUnlocked ? m.def.name : "Comodín Misterioso"}
                >
                  {isUnlocked ? (
                    <>
                      <SpriteIcon name={m.def.icon} size={jokerIconSize} className="relative z-10" />
                      <span
                        style={{ fontSize: `${Math.max(8 * fontScale, 7)}px` }}
                        className="font-black uppercase mt-0.5 tracking-tight text-center leading-none relative z-10 drop-shadow truncate w-full text-yellow-200"
                      >
                        {m.def.shortName}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center rounded-lg text-amber-400/70">
                        <HelpCircle size={jokerIconSize} className="text-amber-400/70 animate-pulse" />
                      </div>
                      <span
                        style={{ fontSize: `${Math.max(7 * fontScale, 6)}px` }}
                        className="font-black uppercase mt-0.5 tracking-tight text-center leading-none text-slate-400"
                      >
                        MISTERIO
                      </span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
