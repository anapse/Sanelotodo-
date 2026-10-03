import React, { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import { useStageDimensions } from "../context/StageContext";
import { HeaderHUD } from "./HeaderHUD";
import { SpriteIcon } from "./SpriteIcon";
import { LifelineActivationModal } from "./LifelineActivationModal";
import { OFFICIAL_10_LIFELINES, LifelineDef } from "../types/lifeline";
import { soundService } from "../services/soundService";
import { Clock, Gift, Shield, Info, Lock, Zap, RefreshCw, Snowflake } from "lucide-react";

export const QuizCanvasView: React.FC = () => {
  const {
    phase,
    currentQuestion,
    handleAnswerSelection,
    advanceToNextQuestion,
    selectedAnswerIndex,
    isAnswerSubmitted,
    isAnswerCorrect,
    isQuestionTransitioning,
    lifelines,
    getLifelineCount,
    activeModalLifeline,
    openLifelineModal,
    closeLifelineModal,
    confirmActivateLifeline,
    isTimerPaused,
    hiddenOptionIndices,
    highlightedCorrectOption,
    shieldActive,
    megaShieldCharges,
    secondChanceActive,
    doubleScoreActive,
    timeFreezeSecondsRemaining,
    setTimeFreezeSecondsRemaining,
    extraTimeSecondsAdded,
  } = useGame();

  const {
    stageWidth,
    stageHeight,
    timerHeight,
    contentHeight,
    contentQuestionHeight,
    contentAnswersHeight,
    contentGapQuestionAnswers,
    answersSideInset,
    answersGapX,
    answersGapY,
    jokerCardHeight,
    jokerGap,
    jokerPaddingX,
    fontScale,
    iconScale,
  } = useStageDimensions();

  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [showParticles, setShowParticles] = useState<boolean>(false);
  const [activeInfoModal, setActiveInfoModal] = useState<LifelineDef | null>(null);

  // Reiniciar temporizador al cambiar la pregunta
  useEffect(() => {
    setTimeLeft(20);
    setShowParticles(false);
  }, [currentQuestion?.id]);

  // Aplicar tiempo extra inmediatamente si se añade
  useEffect(() => {
    if (extraTimeSecondsAdded > 0) {
      setTimeLeft((prev) => Math.min(prev + extraTimeSecondsAdded, 30));
    }
  }, [extraTimeSecondsAdded]);

  useEffect(() => {
    if (isAnswerSubmitted && isAnswerCorrect) {
      setShowParticles(true);
    } else {
      setShowParticles(false);
    }
  }, [isAnswerSubmitted, isAnswerCorrect]);

  // Watchdog de seguridad
  useEffect(() => {
    if (!isAnswerSubmitted) return;

    const watchdog = setTimeout(() => {
      if (isAnswerSubmitted && !shieldActive && megaShieldCharges === 0 && !secondChanceActive) {
        advanceToNextQuestion();
      }
    }, 2500);

    return () => clearTimeout(watchdog);
  }, [isAnswerSubmitted, shieldActive, megaShieldCharges, secondChanceActive, advanceToNextQuestion]);

  const isPlayingPhase = phase === "PLAYING" || phase === "BONUS_ROUND";

  // Temporizador principal con soporte de Congelar Tiempo y Pausa Total en Modales
  useEffect(() => {
    if (!isPlayingPhase || isAnswerSubmitted || !currentQuestion || isTimerPaused || isQuestionTransitioning) {
      return;
    }

    const timer = setInterval(() => {
      // Si el tiempo está congelado por el comodín "Congelar Tiempo"
      if (timeFreezeSecondsRemaining > 0) {
        setTimeFreezeSecondsRemaining((prev) => Math.max(prev - 1, 0));
        return;
      }

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
  }, [
    currentQuestion?.id,
    isPlayingPhase,
    isAnswerSubmitted,
    isTimerPaused,
    isQuestionTransitioning,
    timeFreezeSecondsRemaining,
    setTimeFreezeSecondsRemaining,
  ]);

  // Agotamiento del tiempo
  useEffect(() => {
    if (timeLeft === 0 && !isAnswerSubmitted && isPlayingPhase && !isTimerPaused && !isQuestionTransitioning) {
      soundService.playIncorrectSound();
      handleAnswerSelection(-1);
    }
  }, [timeLeft, isAnswerSubmitted, isPlayingPhase, isTimerPaused, isQuestionTransitioning, handleAnswerSelection]);

  const isInteractionDisabled = isAnswerSubmitted || !isPlayingPhase || isTimerPaused || isQuestionTransitioning;

  const handleSelectOption = (index: number) => {
    if (isInteractionDisabled || hiddenOptionIndices.includes(index)) return;
    soundService.playClickSound();
    handleAnswerSelection(index);
  };

  if (!currentQuestion) return null;

  const isTimeCritical = timeLeft <= 5 && timeLeft > 0 && isPlayingPhase && !isAnswerSubmitted && timeFreezeSecondsRemaining === 0;

  let timerBadgeColor = "bg-[#0d2a57] border-2 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.45)]";
  let timerBarGradient = "bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-400";

  if (timeFreezeSecondsRemaining > 0) {
    timerBadgeColor = "bg-[#0a2f4d] border-2 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.7)] animate-pulse";
    timerBarGradient = "bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400";
  } else if (timeLeft <= 10 && timeLeft > 5) {
    timerBadgeColor = "bg-[#45280b] border-2 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]";
    timerBarGradient = "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400";
  } else if (timeLeft <= 5) {
    timerBadgeColor = "bg-[#4a0d0d] border-2 border-red-500 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.9)]";
    timerBarGradient = "bg-gradient-to-r from-red-600 via-rose-500 to-red-500 animate-pulse";
  }

  // Tipografía adaptativa precisa
  const getQuestionFontSize = (text: string) => {
    const len = text.trim().length;
    if (len <= 45) return Math.max(Math.round(20 * fontScale), 15);
    if (len <= 80) return Math.max(Math.round(17 * fontScale), 13);
    if (len <= 120) return Math.max(Math.round(15 * fontScale), 12);
    return Math.max(Math.round(13.5 * fontScale), 11.5);
  };

  const getOptionFontSize = (text: string) => {
    const len = text.trim().length;
    if (len <= 8) return Math.max(Math.round(20 * fontScale), 15);
    if (len <= 16) return Math.max(Math.round(16 * fontScale), 13);
    if (len <= 26) return Math.max(Math.round(14 * fontScale), 12);
    if (len <= 40) return Math.max(Math.round(12.5 * fontScale), 11);
    return Math.max(Math.round(11.5 * fontScale), 10);
  };

  const qFontSize = getQuestionFontSize(currentQuestion.question);
  const jokerIconSize = Math.max(Math.round(22 * iconScale), 15);

  // División de los 10 comodines de acción en Fila 1 (0 a 4) y Fila 2 (5 a 9)
  const row1Lifelines = OFFICIAL_10_LIFELINES.slice(0, 5);
  const row2Lifelines = OFFICIAL_10_LIFELINES.slice(5, 10);

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
          <div className="w-48 h-48 rounded-full bg-yellow-400/20 filter blur-2xl animate-ping" />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL DE ACTIVACIÓN DEL COMODÍN CON PAUSA DE TIEMPO           */}
      {/* ------------------------------------------------------------- */}
      {activeModalLifeline && (
        <LifelineActivationModal
          lifeline={activeModalLifeline}
          onConfirm={confirmActivateLifeline}
          onCancel={closeLifelineModal}
        />
      )}

      {/* MODAL INFORMATIVO (ℹ️) */}
      {activeInfoModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm select-none">
          <div className="w-[340px] max-w-full bg-blue-950 border-2 border-amber-400 rounded-3xl p-5 text-center shadow-2xl relative">
            <div className="p-2.5 bg-blue-900/90 border border-amber-400/50 rounded-2xl inline-block mx-auto mb-2">
              <SpriteIcon name={activeInfoModal.icon} size={40} />
            </div>
            <h3 className="font-black text-amber-300 text-base uppercase mb-2">
              {activeInfoModal.name}
            </h3>
            <p className="text-slate-200 text-xs leading-relaxed mb-3">
              {activeInfoModal.description}
            </p>
            <div className="text-[11px] text-amber-200/90 font-bold mb-4 bg-blue-900/40 p-2 rounded-xl">
              💡 Cuándo usar: {activeInfoModal.whenToUse}
            </div>
            <button
              onClick={() => setActiveInfoModal(null)}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black uppercase text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. HUD SUPERIOR (Vidas, Ronda, Progreso Ruleta, Puntos)       */}
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
          <span>¡RONDA ESPECIAL DE PREGUNTAS FÁCILES!</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. BARRA DE TIEMPO Y MODIFICADORES ACTIVOS                    */}
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

        {/* Barra de progreso y badges de comodines activos */}
        <div className="flex-1 flex flex-col justify-center">
          <div
            style={{ fontSize: `${Math.max(9.5 * fontScale, 8)}px` }}
            className="flex items-center justify-between font-extrabold uppercase text-amber-200 mb-0.5 drop-shadow"
          >
            <span className="flex items-center gap-1">
              <Clock size={Math.round(11 * iconScale)} className={timeLeft <= 5 ? "text-red-400" : "text-amber-400"} />
              Tiempo {!isPlayingPhase && "(EN PAUSA)"}
            </span>

            {/* Badges de Modificadores Mecánicos Activos */}
            <div className="flex items-center gap-1 flex-wrap">
              {timeFreezeSecondsRemaining > 0 && (
                <span className="text-[8.5px] text-cyan-200 font-black flex items-center gap-0.5 bg-cyan-950/90 px-1.5 py-0.2 rounded-full border border-cyan-400 animate-pulse">
                  <Snowflake size={9} /> Congelado {timeFreezeSecondsRemaining}s
                </span>
              )}
              {megaShieldCharges > 0 && (
                <span className="text-[8.5px] text-amber-300 font-black flex items-center gap-0.5 bg-purple-950/90 px-1.5 py-0.2 rounded-full border border-purple-400 animate-pulse">
                  <Shield size={9} /> Mega Escudo (x{megaShieldCharges})
                </span>
              )}
              {shieldActive && megaShieldCharges === 0 && (
                <span className="text-[8.5px] text-blue-300 font-black flex items-center gap-0.5 bg-blue-950/90 px-1.5 py-0.2 rounded-full border border-blue-400 animate-pulse">
                  <Shield size={9} /> Escudo Activo
                </span>
              )}
              {secondChanceActive && (
                <span className="text-[8.5px] text-emerald-300 font-black flex items-center gap-0.5 bg-emerald-950/90 px-1.5 py-0.2 rounded-full border border-emerald-400 animate-pulse">
                  <RefreshCw size={9} /> 2da Oportunidad
                </span>
              )}
              {doubleScoreActive && (
                <span className="text-[8.5px] text-yellow-300 font-black flex items-center gap-0.5 bg-yellow-950/90 px-1.5 py-0.2 rounded-full border border-yellow-400 animate-pulse">
                  <Zap size={9} /> 2X Puntos
                </span>
              )}
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
      {/* 3. ÁREA CENTRAL: PREGUNTA + RESPUESTAS                        */}
      {/* Con transición visual suave entre preguntas                    */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{ height: `${contentHeight}px` }}
        className={`w-full flex flex-col justify-between shrink-0 z-10 transition-opacity duration-200 ${
          isQuestionTransitioning ? "opacity-30 scale-[0.99]" : "opacity-100 scale-100"
        }`}
      >
        {/* TARJETA DE PREGUNTA */}
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

        {/* GAP VISUAL */}
        <div style={{ height: `${contentGapQuestionAnswers}px` }} className="shrink-0" />

        {/* CUADRÍCULA DE RESPUESTAS 2x2 */}
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
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. BARRA DE LOS 10 COMODINES DE ACCIÓN (2 FILAS x 5 SLOTS)     */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          paddingLeft: `${jokerPaddingX}px`,
          paddingRight: `${jokerPaddingX}px`,
          paddingBottom: "4px",
        }}
        className="w-full flex flex-col justify-end shrink-0 z-20 select-none gap-1"
      >
        {/* FILA 1: COMODINES DE ACCIÓN #1 AL #5 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: `${jokerGap}px`,
            height: `${jokerCardHeight}px`,
          }}
          className="w-full shrink-0"
        >
          {row1Lifelines.map((l) => {
            const count = getLifelineCount(l.id);
            const isUnlocked = count > 0;
            const isAvailable = isUnlocked && !isInteractionDisabled;

            let cardStyle = "bg-[#0b1736]/90 border border-slate-700/80 text-slate-400 opacity-60";
            if (isUnlocked) {
              cardStyle = "bg-gradient-to-b from-[#18356d] via-[#152e60] to-[#0f2146] border-2 border-amber-400 text-amber-300 shadow-md hover:border-yellow-300 hover:brightness-110 active:scale-95";
            }

            return (
              <div
                key={l.id}
                style={{ height: `${jokerCardHeight}px` }}
                className={`w-full rounded-xl flex flex-col items-center justify-between p-1 relative overflow-hidden transition-all ${cardStyle}`}
              >
                {/* Botón Info */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfoModal(l);
                  }}
                  className="absolute top-0.5 left-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-950/90 border border-amber-400/80 text-amber-300 flex items-center justify-center hover:bg-amber-400 hover:text-slate-950 transition-all z-20 cursor-pointer"
                  title={`Información de ${l.name}`}
                >
                  <Info size={9} />
                </button>

                {/* Badge de contador / candado */}
                <div className="absolute top-0.5 right-0.5 z-20">
                  {isUnlocked ? (
                    <span
                      style={{ fontSize: `${Math.max(8 * fontScale, 7)}px` }}
                      className="font-mono font-black px-1 py-0.2 rounded-full bg-amber-400 text-slate-950 border border-amber-200 shadow"
                    >
                      x{count}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900/90 text-slate-500 border border-slate-700 shadow" title="Sin usos disponibles">
                      <Lock size={9} />
                    </span>
                  )}
                </div>

                {/* Botón de activación */}
                <button
                  onClick={() => openLifelineModal(l.id)}
                  disabled={!isAvailable}
                  className="w-full flex-1 flex flex-col items-center justify-center mt-1 cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none"
                  title={l.name}
                >
                  <SpriteIcon
                    name={l.icon}
                    size={jokerIconSize}
                    className={`relative z-10 ${!isUnlocked ? "grayscale opacity-50" : ""}`}
                  />
                  <span
                    style={{ fontSize: `${Math.max(8 * fontScale, 7)}px` }}
                    className={`font-black uppercase mt-0.5 tracking-tight text-center leading-none relative z-10 drop-shadow truncate w-full ${!isUnlocked ? "text-slate-400" : "text-amber-200"}`}
                  >
                    {l.shortName}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* FILA 2: COMODINES DE ACCIÓN #6 AL #10 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: `${jokerGap}px`,
            height: `${jokerCardHeight}px`,
          }}
          className="w-full shrink-0"
        >
          {row2Lifelines.map((l) => {
            const count = getLifelineCount(l.id);
            const isUnlocked = count > 0;
            const isAvailable = isUnlocked && !isInteractionDisabled;

            let cardStyle = "bg-[#0b1736]/90 border border-slate-700/80 text-slate-400 opacity-60";
            if (isUnlocked) {
              cardStyle = "bg-gradient-to-b from-[#18356d] via-[#152e60] to-[#0f2146] border-2 border-amber-400 text-amber-300 shadow-md hover:border-yellow-300 hover:brightness-110 active:scale-95";
            }

            return (
              <div
                key={l.id}
                style={{ height: `${jokerCardHeight}px` }}
                className={`w-full rounded-xl flex flex-col items-center justify-between p-1 relative overflow-hidden transition-all ${cardStyle}`}
              >
                {/* Botón Info */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfoModal(l);
                  }}
                  className="absolute top-0.5 left-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-950/90 border border-amber-400/80 text-amber-300 flex items-center justify-center hover:bg-amber-400 hover:text-slate-950 transition-all z-20 cursor-pointer"
                  title={`Información de ${l.name}`}
                >
                  <Info size={9} />
                </button>

                {/* Badge de contador / candado */}
                <div className="absolute top-0.5 right-0.5 z-20">
                  {isUnlocked ? (
                    <span
                      style={{ fontSize: `${Math.max(8 * fontScale, 7)}px` }}
                      className="font-mono font-black px-1 py-0.2 rounded-full bg-amber-400 text-slate-950 border border-amber-200 shadow"
                    >
                      x{count}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900/90 text-slate-500 border border-slate-700 shadow" title="Sin usos disponibles">
                      <Lock size={9} />
                    </span>
                  )}
                </div>

                {/* Botón de activación */}
                <button
                  onClick={() => openLifelineModal(l.id)}
                  disabled={!isAvailable}
                  className="w-full flex-1 flex flex-col items-center justify-center mt-1 cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none"
                  title={l.name}
                >
                  <SpriteIcon
                    name={l.icon}
                    size={jokerIconSize}
                    className={`relative z-10 ${!isUnlocked ? "grayscale opacity-50" : ""}`}
                  />
                  <span
                    style={{ fontSize: `${Math.max(8 * fontScale, 7)}px` }}
                    className={`font-black uppercase mt-0.5 tracking-tight text-center leading-none relative z-10 drop-shadow truncate w-full ${!isUnlocked ? "text-slate-400" : "text-amber-200"}`}
                  >
                    {l.shortName}
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
