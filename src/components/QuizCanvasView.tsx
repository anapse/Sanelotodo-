import React, { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import { HeaderHUD } from "./HeaderHUD";
import { SpriteIcon, IconName } from "./SpriteIcon";
import { soundService } from "../services/soundService";
import { Clock, Sparkles, Gift, Shield, Info, X } from "lucide-react";

interface ComodinInfo {
  key: string;
  name: string;
  shortName: string;
  icon: IconName;
  whatItDoes: string;
  whenToUse: string;
}

const COMODINES_INFO_LIST: ComodinInfo[] = [
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
    name: "RESPUESTA CORRECTA",
    shortName: "PISTA",
    icon: "correctAnswer",
    whatItDoes: "Marca visualmente con resplandor dorado cuál de las 4 opciones es la correcta. El jugador debe pulsarla.",
    whenToUse: "En preguntas de alta dificultad o cuando te quede solo 1 vida.",
  },
  {
    key: "extraLife",
    name: "VIDA EXTRA",
    shortName: "+1 VIDA",
    icon: "extraLife",
    whatItDoes: "Añade +1 corazón a tu contador de vidas. Nunca puede superar el límite máximo de 5 corazones.",
    whenToUse: "En cualquier momento que tengas menos de 5 corazones para prolongar tu partida.",
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
    useFiftyFifty,
    useSkip,
    useShield,
    useCorrectAnswerHighlight,
    useExtraLife,
    hiddenOptionIndices,
    highlightedCorrectOption,
    shieldActive,
  } = useGame();

  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [showParticles, setShowParticles] = useState<boolean>(false);
  const [activeInfoModal, setActiveInfoModal] = useState<ComodinInfo | null>(null);

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

  // Ajuste tipográfico dinámico de la pregunta
  const qLen = currentQuestion.question.length;
  let qFontSize = "text-lg";
  if (qLen > 110) {
    qFontSize = "text-xs";
  } else if (qLen > 65) {
    qFontSize = "text-sm";
  } else if (qLen > 40) {
    qFontSize = "text-base";
  }

  // Tipografía grande y dinámica para las opciones de respuesta
  const getOptionTypography = (text: string) => {
    const len = text.trim().length;
    if (len <= 8) return "text-2xl font-black tracking-wide";
    if (len <= 16) return "text-lg font-black tracking-normal";
    if (len <= 28) return "text-base font-extrabold leading-tight";
    return "text-sm font-bold leading-snug line-clamp-2";
  };

  // Mapeo de los 5 comodines oficiales
  const comodinesData = [
    {
      info: COMODINES_INFO_LIST[0],
      count: lifelines.fiftyFiftyCount,
      action: useFiftyFifty,
      isAvailable: lifelines.fiftyFiftyCount > 0 && !isInteractionDisabled,
    },
    {
      info: COMODINES_INFO_LIST[1],
      count: lifelines.skipCount,
      action: useSkip,
      isAvailable: lifelines.skipCount > 0 && !isInteractionDisabled,
    },
    {
      info: COMODINES_INFO_LIST[2],
      count: lifelines.shieldCount,
      action: useShield,
      isAvailable: lifelines.shieldCount > 0 && !isInteractionDisabled && !shieldActive,
    },
    {
      info: COMODINES_INFO_LIST[3],
      count: lifelines.correctAnswerCount,
      action: useCorrectAnswerHighlight,
      isAvailable: lifelines.correctAnswerCount > 0 && !isInteractionDisabled && highlightedCorrectOption === null,
    },
    {
      info: COMODINES_INFO_LIST[4],
      count: lifelines.extraLifeCount,
      action: useExtraLife,
      isAvailable: lifelines.extraLifeCount > 0 && !isInteractionDisabled,
    },
  ];

  return (
    <div
      style={{ width: "480px", height: "800px" }}
      className="absolute inset-0 overflow-hidden text-white font-sans select-none"
    >
      {/* ------------------------------------------------------------- */}
      {/* OVERLAYS VISUALES LIGEROS                                     */}
      {/* ------------------------------------------------------------- */}
      {isTimeCritical && (
        <div className="absolute inset-0 pointer-events-none z-30 bg-red-600/15 animate-pulse border-4 border-red-500 rounded-3xl" />
      )}

      {showParticles && (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden flex items-center justify-center bg-emerald-500/15">
          <div className="relative z-50 flex items-center justify-center gap-2 animate-bounce">
            <Sparkles className="w-9 h-9 text-yellow-300 animate-spin" />
            <span className="text-3xl font-black text-amber-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] tracking-widest uppercase">
              ¡CORRECTO!
            </span>
            <Sparkles className="w-9 h-9 text-yellow-300 animate-spin" />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CARTEL INFORMATIVO DEL COMODÍN (Regla 6)                      */}
      {/* ------------------------------------------------------------- */}
      {activeInfoModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
          <div className="w-[380px] bg-blue-950 border-2 border-amber-400 rounded-3xl p-5 shadow-2xl relative text-center">
            <button
              onClick={() => setActiveInfoModal(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 cursor-pointer"
              aria-label="Cerrar Cartel"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-[#132352] border-2 border-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <SpriteIcon name={activeInfoModal.icon} size={42} />
            </div>

            <h3 className="text-xl font-black text-amber-300 uppercase tracking-wide mb-3">
              {activeInfoModal.name}
            </h3>

            <div className="space-y-3 text-left bg-blue-900/60 p-3.5 rounded-2xl border border-blue-700/60 text-xs">
              <div>
                <span className="block font-black text-amber-400 uppercase tracking-wider text-[11px] mb-0.5">
                  📌 ¿Qué hace?
                </span>
                <p className="text-slate-200 leading-relaxed">{activeInfoModal.whatItDoes}</p>
              </div>

              <div>
                <span className="block font-black text-amber-400 uppercase tracking-wider text-[11px] mb-0.5">
                  ⚡ ¿Cuándo se puede utilizar?
                </span>
                <p className="text-slate-200 leading-relaxed">{activeInfoModal.whenToUse}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveInfoModal(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. HUD SUPERIOR (Regla 10: Vidas Izq / Puntos Der)           */}
      {/* ------------------------------------------------------------- */}
      <HeaderHUD />

      {/* ------------------------------------------------------------- */}
      {/* FRANJA DE RONDA BONUS (Solo en BONUS_ROUND, Y: 80px - 104px)  */}
      {/* ------------------------------------------------------------- */}
      {phase === "BONUS_ROUND" && (
        <div
          style={{ top: "80px", left: "0px", width: "480px", height: "24px" }}
          className="absolute z-20 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 shadow-md border-b border-amber-600 animate-pulse"
        >
          <Gift className="w-3.5 h-3.5" />
          <span>¡RONDA BONUS DE PREGUNTAS FÁCILES DE REGALO!</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. TEMPORIZADOR RÍGIDO (Regla 11: Ancho fijo y tabular)        */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{ left: "20px", top: "106px", width: "440px", height: "42px" }}
        className="absolute z-10 flex items-center gap-3"
      >
        {/* Contenedor rígido de 58px con números tabulares */}
        <div
          style={{ width: "58px", height: "38px" }}
          className={`shrink-0 rounded-xl flex items-center justify-center font-mono font-black text-base tabular-nums text-center transition-colors duration-300 ${timerBadgeColor}`}
        >
          <span>{timeLeft}s</span>
        </div>

        {/* Barra de progreso */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-amber-200 mb-0.5 drop-shadow">
            <span className="flex items-center gap-1">
              <Clock className={`w-3.5 h-3.5 ${timeLeft <= 5 ? "text-red-400" : "text-amber-400"}`} />
              Tiempo de Respuesta {!isPlayingPhase && "(EN PAUSA)"}
            </span>
            <div className="flex items-center gap-2">
              {shieldActive && (
                <span className="text-[10px] text-blue-300 font-bold flex items-center gap-0.5 bg-blue-900/90 px-1.5 py-0.5 rounded-full border border-blue-400 animate-pulse">
                  <Shield className="w-2.5 h-2.5" /> Escudo Activo
                </span>
              )}
              <span className="text-[10px] text-slate-300 font-bold tabular-nums font-mono">20s máx</span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-slate-950/90 rounded-full overflow-hidden border border-amber-500/60 shadow-inner">
            <div
              style={{ width: `${(timeLeft / 20) * 100}%` }}
              className={`h-full transition-all duration-1000 ${timerBarGradient}`}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. TARJETA DE PREGUNTA (Y: 156px - 318px, Alto: 162px)        */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{ left: "20px", top: "156px", width: "440px", height: "162px" }}
        className="absolute z-10 bg-gradient-to-b from-[#142a63] to-[#0d1c44] border-2 border-amber-400 rounded-3xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.7)] text-center flex flex-col justify-center items-center overflow-hidden"
      >
        <span className="text-xs font-black uppercase tracking-widest text-amber-300 mb-1.5 shrink-0 drop-shadow">
          Categoría: {currentQuestion.category || "Cultura General"}
        </span>
        <div className="w-full max-h-[115px] overflow-hidden flex items-center justify-center">
          <h2 className={`${qFontSize} font-extrabold text-white leading-snug drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] line-clamp-4 text-center`}>
            {currentQuestion.question}
          </h2>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. RESPUESTAS: 2 COLUMNAS × 2 FILAS (Y: 330px - 504px, Alto: 174px) */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{ left: "20px", top: "330px", width: "440px", height: "174px" }}
        className="absolute z-10 grid grid-cols-2 grid-rows-2 gap-3"
      >
        {currentQuestion.options.map((option, idx) => {
          const isDisabled = hiddenOptionIndices.includes(idx) || isInteractionDisabled;
          const isSelected = selectedAnswerIndex === idx;
          const isCorrect = isAnswerSubmitted && idx === currentQuestion.correctIndex;
          const isWrong = isAnswerSubmitted && isSelected && idx !== currentQuestion.correctIndex;
          const isHighlightedByLifeline = highlightedCorrectOption === idx;

          let btnStyle = "bg-gradient-to-b from-[#173072] via-[#1c3a88] to-[#142962] border-2 border-amber-400 text-white shadow-[0_6px_16px_rgba(0,0,0,0.6)] hover:border-yellow-300 hover:brightness-110 active:scale-95";
          
          // Regla 4 (RESPUESTA CORRECTA): Marcar visualmente cuál de las 4 opciones es correcta
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

          const typographyClass = getOptionTypography(option);

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isDisabled}
              className={`w-full h-full px-3 py-1.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all relative overflow-hidden cursor-pointer ${btnStyle}`}
            >
              <span className={`relative z-10 drop-shadow ${typographyClass}`}>
                {option}
              </span>

              {/* Indicador visual de comodín de Respuesta Correcta */}
              {isHighlightedByLifeline && !isAnswerSubmitted && (
                <span className="absolute top-1.5 left-1.5 bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded-full text-[9px] font-black shadow z-20">
                  ★ PISTA
                </span>
              )}

              {isCorrect && (
                <span className="absolute top-1.5 right-1.5 bg-yellow-400 text-slate-950 p-1 rounded-full text-xs font-black shadow z-20">
                  ✓
                </span>
              )}
              {isWrong && (
                <span className="absolute top-1.5 right-1.5 bg-red-950 text-red-400 p-1 rounded-full text-xs font-black shadow z-20">
                  ✕
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. PANEL DE LOS 5 COMODINES OFICIALES (Reglas 4, 5 y 6)       */}
      {/* 50/50, SALTAR, ESCUDO, RESPUESTA CORRECTA, VIDA EXTRA         */}
      {/* Estado permanente: color completo / apagado reconocible      */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{ left: "20px", top: "540px", width: "440px", height: "230px" }}
        className="absolute z-10 p-3 bg-gradient-to-b from-[#112456] to-[#0c193c] border-2 border-amber-400/90 rounded-3xl flex flex-col justify-between shadow-2xl"
      >
        {/* Encabezado del panel */}
        <div className="flex items-center justify-between px-1 text-[11px] font-black uppercase text-amber-300 tracking-wider">
          <span>Comodines Oficiales (5 Disponibles)</span>
          <span className="text-[10px] text-amber-400/80 font-normal">
            Toca <span className="font-bold">ℹ️</span> para ver cartel
          </span>
        </div>

        {/* Cuadrícula de los 5 comodines oficiales en 1 fila de 5 botones equilibrados */}
        <div className="grid grid-cols-5 gap-2 h-[180px] items-stretch">
          {comodinesData.map((c) => {
            const isAvailable = c.isAvailable;
            const isExhausted = c.count <= 0;

            let btnStyle = "bg-gradient-to-b from-[#1c377d] to-[#132759] border-2 border-amber-400 text-amber-300 hover:border-yellow-300 hover:brightness-110 active:scale-95 shadow-md cursor-pointer";
            if (isExhausted) {
              // Regla 5: Comodines no disponibles: mismo icono oficial, apagado, sombra, baja saturación, reconocible
              btnStyle = "bg-[#0f1e44] border-2 border-slate-600 text-slate-300 opacity-60 cursor-not-allowed";
            }

            return (
              <div
                key={c.info.key}
                className={`w-full h-full rounded-2xl flex flex-col items-center justify-between p-2 relative overflow-hidden transition-all border-2 ${btnStyle}`}
              >
                {/* Botón Cartel Informativo ℹ️ en esquina superior izquierda */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfoModal(c.info);
                  }}
                  className="absolute top-1 left-1 w-5 h-5 rounded-full bg-blue-950/80 border border-amber-400/60 text-amber-300 flex items-center justify-center hover:bg-amber-400 hover:text-slate-950 transition-all z-20 cursor-pointer"
                  title={`Ver cartel informativo de ${c.info.name}`}
                  aria-label={`Información de ${c.info.name}`}
                >
                  <Info className="w-3 h-3" />
                </button>

                {/* Badge de cantidad x1 / x0 en esquina superior derecha */}
                <span
                  className={`absolute top-1 right-1 font-mono font-black text-[10px] px-1.5 py-0.2 rounded-full shadow border z-20 ${
                    c.count > 0
                      ? "bg-amber-400 text-slate-950 border-amber-200"
                      : "bg-slate-700 text-slate-300 border-slate-600"
                  }`}
                >
                  x{c.count}
                </span>

                {/* Área clickeable para activar el comodín */}
                <button
                  onClick={c.action}
                  disabled={!isAvailable}
                  className="w-full flex-1 flex flex-col items-center justify-center mt-3 cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none"
                  title={c.info.name}
                >
                  <SpriteIcon
                    name={c.info.icon}
                    size={40}
                    className={`relative z-10 ${isExhausted ? "grayscale opacity-50" : ""}`}
                  />
                  <span className="text-[10px] font-black uppercase mt-1 tracking-tight text-center leading-none relative z-10 drop-shadow truncate w-full">
                    {c.info.shortName}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
