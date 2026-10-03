import React from "react";
import { useGame } from "../context/GameContext";
import { useStageDimensions } from "../context/StageContext";
import { SpriteIcon } from "./SpriteIcon";
import { Pause } from "lucide-react";

export const HeaderHUD: React.FC = () => {
  const { lives, score, questionsAnsweredCount, currentRound, correctAnswersForRouletteCount, pauseGame } = useGame();
  const { hudHeight, stageWidth, fontScale, iconScale } = useStageDimensions();

  const heartIconSize = Math.max(Math.round(24 * iconScale), 18);
  const coinsIconSize = Math.max(Math.round(20 * iconScale), 16);
  const pauseIconSize = Math.max(Math.round(20 * iconScale), 16);

  return (
    <div
      style={{ height: `${hudHeight}px`, width: "100%" }}
      className="shrink-0 relative bg-gradient-to-b from-[#0e1d4a] via-[#0a1639] to-[#070f28] border-b-2 border-amber-500/80 text-white z-20 select-none shadow-lg px-2 sm:px-3 flex items-center justify-between"
    >
      {/* ============================================================= */}
      {/* 1. IZQUIERDA: ❤️ VIDAS (Calculado desde Stage)                */}
      {/* ============================================================= */}
      <div
        style={{
          width: `${Math.round(stageWidth * 0.22)}px`,
          height: `${Math.round(hudHeight * 0.58)}px`,
        }}
        className="px-2 flex items-center justify-between rounded-2xl bg-[#132352] border-2 border-red-500 shadow-md shrink-0"
      >
        <SpriteIcon name="extraLife" size={heartIconSize} />
        <span
          style={{ fontSize: `${Math.max(14 * fontScale, 12)}px` }}
          className="font-black text-red-400 tabular-nums font-mono text-right tracking-wide"
        >
          x{lives}
        </span>
      </div>

      {/* ============================================================= */}
      {/* 2. CENTRO: RONDA Y PROGRESO HACIA LA RULETA                   */}
      {/* ============================================================= */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-1">
        <span
          style={{ fontSize: `${Math.max(9.5 * fontScale, 8)}px` }}
          className="font-black uppercase text-amber-300 tracking-widest leading-none drop-shadow"
        >
          RONDA {currentRound}
        </span>
        <span
          style={{ fontSize: `${Math.max(18 * fontScale, 14)}px` }}
          className="font-black text-white tracking-wider tabular-nums font-mono leading-none mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        >
          Preg. #{questionsAnsweredCount + 1}
        </span>
        {/* Indicador de progreso hacia la Ruleta (3 aciertos = Fin de Ronda) */}
        <div className="flex items-center gap-1 mt-0.5" title="3 respuestas correctas = Ruleta y Fin de Ronda">
          <span
            style={{ fontSize: `${Math.max(8 * fontScale, 7)}px` }}
            className="font-bold text-slate-300 uppercase mr-0.5"
          >
            Ruleta:
          </span>
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              style={{
                width: `${Math.max(Math.round(10 * iconScale), 7)}px`,
                height: `${Math.max(Math.round(10 * iconScale), 7)}px`,
              }}
              className={`rounded-full border transition-all ${
                idx < correctAnswersForRouletteCount
                  ? "bg-amber-400 border-amber-200 shadow-[0_0_6px_rgba(245,186,19,0.8)]"
                  : "bg-slate-800 border-slate-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ============================================================= */}
      {/* 3. DERECHA: ⭐ PUNTOS + ⏸ PAUSA                               */}
      {/* ============================================================= */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div
          style={{
            height: `${Math.round(hudHeight * 0.58)}px`,
            maxWidth: `${Math.round(stageWidth * 0.28)}px`,
          }}
          className="px-2 flex items-center justify-between gap-1 rounded-2xl bg-[#132352] border-2 border-amber-400 shadow-md"
        >
          <SpriteIcon name="coins" size={coinsIconSize} />
          <span
            style={{ fontSize: `${Math.max(11 * fontScale, 10)}px` }}
            className="font-black text-amber-300 tabular-nums font-mono text-right truncate"
          >
            {score} PTS
          </span>
        </div>

        <button
          onClick={pauseGame}
          style={{
            width: `${Math.round(hudHeight * 0.58)}px`,
            height: `${Math.round(hudHeight * 0.58)}px`,
          }}
          className="rounded-2xl bg-[#142659] border-2 border-amber-400 text-amber-300 hover:bg-[#1a3375] hover:border-yellow-300 active:scale-95 transition-all flex items-center justify-center shadow-lg cursor-pointer shrink-0"
          title="Pausar Juego"
          aria-label="Pausar Juego"
        >
          <Pause size={pauseIconSize} className="text-amber-300 fill-amber-300" />
        </button>
      </div>
    </div>
  );
};
