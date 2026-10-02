import React, { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import { HeaderHUD } from "./HeaderHUD";
import { SpriteIcon } from "./SpriteIcon";
import { PauseModal } from "./PauseModal";
import { soundService } from "../services/soundService";
import { Clock, Sparkles, Lock } from "lucide-react";

export const QuizCanvasView: React.FC = () => {
  const {
    phase,
    currentQuestion,
    handleAnswerSelection,
    lifelines,
    useFiftyFifty,
    useSkip,
    useShield,
    useCorrectAnswerHighlight,
    useExtraLife,
    hiddenOptionIndices,
    highlightedCorrectOption,
  } = useGame();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [showParticles, setShowParticles] = useState<boolean>(false);

  // Reiniciar estado al cambiar de pregunta
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(20);
    setShowParticles(false);
  }, [currentQuestion]);

  // TEMPORIZADOR INTELIGENTE QUE SE PAUSA SIEMPRE QUE EL JUEGO ESTÉ EN PAUSA (phase === "PAUSED")
  useEffect(() => {
    if (phase === "PAUSED" || isAnswered || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        const nextTime = prev - 1;

        // Pitido de advertencia en los últimos 5 segundos solo si está activo el juego
        if (nextTime <= 5 && nextTime > 0) {
          soundService.playTickBeep();
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, phase, isAnswered]);

  // Manejar agotamiento del tiempo
  useEffect(() => {
    if (timeLeft === 0 && !isAnswered && phase === "PLAYING") {
      setIsAnswered(true);
      soundService.playIncorrectSound();
      handleAnswerSelection(-1);
    }
  }, [timeLeft, isAnswered, phase]);

  const isInteractionDisabled = isAnswered || phase === "PAUSED";

  const handleSelectOption = (index: number) => {
    if (isInteractionDisabled || hiddenOptionIndices.includes(index)) return;
    soundService.playClickSound();

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = currentQuestion && index === currentQuestion.correctIndex;
    if (isCorrect) {
      setShowParticles(true);
    }

    setTimeout(() => {
      handleAnswerSelection(index);
    }, 800);
  };

  const handleFiftyFifty = () => {
    if (!currentQuestion || isInteractionDisabled) return;
    useFiftyFifty();
  };

  const handleSkip = () => {
    if (isInteractionDisabled) return;
    useSkip();
  };

  const handleShield = () => {
    if (isInteractionDisabled) return;
    useShield();
  };

  const handleCorrectAnswer = () => {
    if (!currentQuestion || isInteractionDisabled) return;
    useCorrectAnswerHighlight();
  };

  const handleExtraLife = () => {
    if (isInteractionDisabled) return;
    useExtraLife();
  };

  if (!currentQuestion) return null;

  // Lógica del temporizador
  const isTimeCritical = timeLeft <= 5 && timeLeft > 0 && phase === "PLAYING";

  let timerBadgeColor = "bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]";
  let timerBarGradient = "bg-gradient-to-r from-emerald-500 to-green-400";

  if (timeLeft <= 10 && timeLeft > 5) {
    timerBadgeColor = "bg-amber-950/90 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]";
    timerBarGradient = "bg-gradient-to-r from-amber-500 to-yellow-400";
  } else if (timeLeft <= 5) {
    timerBadgeColor = "bg-red-950/95 border-red-500 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.9)]";
    timerBarGradient = "bg-gradient-to-r from-red-600 to-rose-500 animate-pulse";
  }

  // Ajuste dinámico del tamaño de fuente de la pregunta
  const questionLength = currentQuestion.question.length;
  let questionFontSize = "text-base";
  if (questionLength > 120) {
    questionFontSize = "text-xs";
  } else if (questionLength > 80) {
    questionFontSize = "text-sm";
  }

  return (
    <div className="relative w-[480px] h-[800px] flex flex-col justify-between overflow-hidden text-white font-sans select-none">

      {/* MODAL DE PAUSA SUPERPUESTO */}
      <PauseModal />

      {/* OVERLAY DE ALARMA ROJA PARPADEANTE */}
      {isTimeCritical && (
        <div className="absolute inset-0 pointer-events-none z-30 bg-red-600/20 backdrop-blur-[1px] animate-pulse border-4 border-red-500 rounded-3xl" />
      )}

      {/* OVERLAY DE CELEBRACION VISUAL AL ACERTAR */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/15 backdrop-blur-[1px] animate-pulse" />
          <div className="relative z-50 flex flex-col items-center justify-center animate-bounce">
            <div className="flex gap-2 items-center">
              <Sparkles className="w-10 h-10 text-yellow-300 animate-spin" />
              <span className="text-3xl font-black text-amber-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] tracking-widest uppercase">
                ¡CORRECTO!
              </span>
              <Sparkles className="w-10 h-10 text-yellow-300 animate-spin" />
            </div>
          </div>
        </div>
      )}

      {/* HUD Superior (Vidas, Puntos, Pregunta #, Pausa) */}
      <HeaderHUD />

      {/* ----------------------------------------------------------------- */}
      {/* TEMPORIZADOR - CONGELADO AUTOMÁTICAMENTE DURANTE LA PAUSA */}
      {/* ----------------------------------------------------------------- */}
      <div className="px-5 h-14 flex items-center gap-3 relative z-10 shrink-0">
        <div className={`w-[56px] h-11 shrink-0 rounded-2xl border-2 flex items-center justify-center font-mono font-black text-lg tabular-nums text-center transition-colors duration-300 ${timerBadgeColor}`}>
          {timeLeft}s
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-amber-200 mb-1 drop-shadow">
            <span className="flex items-center gap-1">
              <Clock className={`w-3.5 h-3.5 ${timeLeft <= 5 ? "text-red-400" : "text-amber-400"}`} />
              Tempo de Respuesta {phase === "PAUSED" && "(EN PAUSA)"}
            </span>
            <span className="text-[10px] text-slate-300 font-bold tabular-nums font-mono">20s máx</span>
          </div>
          <div className="w-full h-3 bg-slate-950/90 rounded-full overflow-hidden border border-amber-500/60 shadow-inner">
            <div
              style={{ width: `${(timeLeft / 20) * 100}%` }}
              className={`h-full transition-all duration-1000 ${timerBarGradient}`}
            />
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* TARJETA DE PREGUNTA */}
      {/* ----------------------------------------------------------------- */}
      <div className="px-5 h-[130px] relative z-10 shrink-0 flex items-center">
        <div className="w-[440px] h-full mx-auto bg-slate-950/90 backdrop-blur-md border-2 border-amber-400 rounded-3xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.85)] text-center flex flex-col justify-center relative overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1 shrink-0">
            Categoría: {currentQuestion.category || "General"}
          </span>
          <h2 className={`${questionFontSize} font-extrabold text-white leading-snug drop-shadow-md overflow-hidden`}>
            {currentQuestion.question}
          </h2>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* RESPUESTAS - BLOQUEADAS SI ESTÁ EN PAUSA O YA SE RESPONDIÓ */}
      {/* ----------------------------------------------------------------- */}
      <div className="px-5 h-[150px] relative z-10 shrink-0 flex items-center">
        <div className="grid grid-cols-2 gap-2.5 w-[440px] h-full mx-auto">
          {currentQuestion.options.map((option, idx) => {
            const isDisabled = hiddenOptionIndices.includes(idx) || isInteractionDisabled;
            const isSelected = selectedOption === idx;
            const isCorrect = isAnswered && idx === currentQuestion.correctIndex;
            const isWrong = isAnswered && isSelected && idx !== currentQuestion.correctIndex;
            const isHighlightedByLifeline = highlightedCorrectOption === idx;

            let btnStyle = "bg-slate-950/90 border-2 border-amber-500/80 text-slate-100 hover:border-amber-300 backdrop-blur-md shadow-xl";
            if (isHighlightedByLifeline && !isAnswered) {
              btnStyle = "bg-amber-500/30 border-2 border-amber-300 text-amber-200 font-extrabold shadow-lg shadow-amber-500/40";
            }
            if (isCorrect) {
              btnStyle = "bg-gradient-to-r from-emerald-600 to-emerald-500 border-2 border-emerald-300 text-white font-black shadow-[0_0_25px_rgba(16,185,129,0.8)]";
            }
            if (isWrong) {
              btnStyle = "bg-gradient-to-r from-red-600 to-rose-700 border-2 border-red-300 text-white font-bold shadow-[0_0_25px_rgba(239,68,68,0.8)]";
            }
            if (isDisabled) {
              btnStyle = "opacity-30 pointer-events-none bg-slate-950 border border-slate-800 text-slate-600";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isDisabled}
                className={`h-[68px] px-3 rounded-2xl text-xs font-bold leading-tight flex items-center justify-center text-center active:scale-95 transition-colors relative overflow-hidden ${btnStyle}`}
              >
                <span className="relative z-10 line-clamp-2">{option}</span>
                {isCorrect && (
                  <span className="absolute top-1.5 right-1.5 bg-yellow-400 text-slate-950 p-1 rounded-full text-[10px] font-black shadow z-20">
                    ✓
                  </span>
                )}
                {isWrong && (
                  <span className="absolute top-1.5 right-1.5 bg-red-950 text-red-400 p-1 rounded-full text-[10px] font-black shadow z-20">
                    ✕
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* COMODINES - BLOQUEADOS SI ESTÁ EN PAUSA */}
      {/* ----------------------------------------------------------------- */}
      <div className="px-5 mb-3 relative z-10 shrink-0">
        <div className="w-[440px] mx-auto p-2.5 bg-slate-950/95 backdrop-blur-md border-2 border-amber-500/90 rounded-3xl flex flex-col gap-2 shadow-2xl">

          {/* PRIMERA FILA: COMODINES DISPONIBLES */}
          <div className="grid grid-cols-3 gap-2">
            {/* 1. 50/50 */}
            <button
              onClick={handleFiftyFifty}
              disabled={lifelines.fiftyFiftyCount <= 0 || isInteractionDisabled}
              className={`h-16 rounded-2xl border-2 transition-colors relative overflow-hidden flex flex-col items-center justify-center ${
                lifelines.fiftyFiftyCount > 0 && !isInteractionDisabled
                  ? "bg-slate-900/90 border-amber-500/80 hover:border-amber-300 text-amber-300 active:scale-95 shadow-lg"
                  : "bg-slate-950/80 border-slate-800 text-slate-600 opacity-30 grayscale pointer-events-none"
              }`}
            >
              <SpriteIcon name="fiftyFifty" size={32} className="relative z-10" />
              <span className="text-[10px] font-black uppercase text-amber-300 mt-0.5 tracking-wider relative z-10">
                50 / 50
              </span>
              <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 font-mono font-black text-[10px] px-1.5 py-0.5 rounded-full shadow border border-amber-300 z-20">
                x{lifelines.fiftyFiftyCount}
              </span>
            </button>

            {/* 2. SALTAR */}
            <button
              onClick={handleSkip}
              disabled={lifelines.skipCount <= 0 || isInteractionDisabled}
              className={`h-16 rounded-2xl border-2 transition-colors relative overflow-hidden flex flex-col items-center justify-center ${
                lifelines.skipCount > 0 && !isInteractionDisabled
                  ? "bg-slate-900/90 border-amber-500/80 hover:border-amber-300 text-amber-300 active:scale-95 shadow-lg"
                  : "bg-slate-950/80 border-slate-800 text-slate-600 opacity-30 grayscale pointer-events-none"
              }`}
            >
              <SpriteIcon name="skip" size={32} className="relative z-10" />
              <span className="text-[10px] font-black uppercase text-amber-300 mt-0.5 tracking-wider relative z-10">
                SALTAR
              </span>
              <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 font-mono font-black text-[10px] px-1.5 py-0.5 rounded-full shadow border border-amber-300 z-20">
                x{lifelines.skipCount}
              </span>
            </button>

            {/* 3. ESCUDO */}
            <button
              onClick={handleShield}
              disabled={lifelines.shieldCount <= 0 || isInteractionDisabled}
              className={`h-16 rounded-2xl border-2 transition-colors relative overflow-hidden flex flex-col items-center justify-center ${
                lifelines.shieldCount > 0 && !isInteractionDisabled
                  ? "bg-slate-900/90 border-amber-500/80 hover:border-amber-300 text-amber-300 active:scale-95 shadow-lg"
                  : "bg-slate-950/80 border-slate-800 text-slate-600 opacity-30 grayscale pointer-events-none"
              }`}
            >
              <SpriteIcon name="shield" size={32} className="relative z-10" />
              <span className="text-[10px] font-black uppercase text-amber-300 mt-0.5 tracking-wider relative z-10">
                ESCUDO
              </span>
              <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 font-mono font-black text-[10px] px-1.5 py-0.5 rounded-full shadow border border-amber-300 z-20">
                x{lifelines.shieldCount}
              </span>
            </button>
          </div>

          {/* SEGUNDA FILA: COMODINES ESPECIALES */}
          <div className="grid grid-cols-2 gap-2">

            {/* COMODÍN ESPECIAL 1: PISTA */}
            {lifelines.correctAnswerCount > 0 ? (
              <button
                onClick={handleCorrectAnswer}
                disabled={isInteractionDisabled}
                className={`h-14 rounded-2xl border-2 border-amber-400 bg-amber-500/20 text-amber-300 font-black text-xs uppercase flex items-center justify-center gap-2 relative overflow-hidden active:scale-95 shadow-lg ${
                  isInteractionDisabled ? "opacity-30 pointer-events-none" : ""
                }`}
              >
                <SpriteIcon name="correctAnswer" size={28} className="relative z-10" />
                <span className="tracking-wider relative z-10">RESPUESTA CORRECTA</span>
                <span className="absolute top-1 right-1 bg-amber-400 text-slate-950 font-mono font-black text-[10px] px-1.5 py-0.5 rounded-full shadow z-20">
                  x{lifelines.correctAnswerCount}
                </span>
              </button>
            ) : (
              <div className="h-14 rounded-2xl border border-slate-800 bg-slate-950/80 text-slate-500 flex items-center justify-between px-3 relative overflow-hidden select-none opacity-40">
                <div className="flex items-center gap-2 filter grayscale brightness-50">
                  <SpriteIcon name="correctAnswer" size={26} />
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-400">
                    PISTA DE RESPUESTA
                  </span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </div>
            )}

            {/* COMODÍN ESPECIAL 2: +1 VIDA */}
            {lifelines.extraLifeCount > 0 ? (
              <button
                onClick={handleExtraLife}
                disabled={isInteractionDisabled}
                className={`h-14 rounded-2xl border-2 border-emerald-400 bg-emerald-500/20 text-emerald-300 font-black text-xs uppercase flex items-center justify-center gap-2 relative overflow-hidden active:scale-95 shadow-lg ${
                  isInteractionDisabled ? "opacity-30 pointer-events-none" : ""
                }`}
              >
                <SpriteIcon name="extraLife" size={28} className="relative z-10" />
                <span className="tracking-wider relative z-10">+1 VIDA EXTRA</span>
                <span className="absolute top-1 right-1 bg-emerald-400 text-slate-950 font-mono font-black text-[10px] px-1.5 py-0.5 rounded-full shadow z-20">
                  x{lifelines.extraLifeCount}
                </span>
              </button>
            ) : (
              <div className="h-14 rounded-2xl border border-slate-800 bg-slate-950/80 text-slate-500 flex items-center justify-between px-3 relative overflow-hidden select-none opacity-40">
                <div className="flex items-center gap-2 filter grayscale brightness-50">
                  <SpriteIcon name="extraLife" size={26} />
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-400">
                    +1 VIDA EXTRA
                  </span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
