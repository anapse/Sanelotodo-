import React from "react";
import { useGame } from "../context/GameContext";
import { SpriteIcon } from "./SpriteIcon";
import { Pause } from "lucide-react";

export const HeaderHUD: React.FC = () => {
  const { lives, score, questionsAnsweredCount, correctAnswersForRouletteCount, pauseGame } = useGame();

  return (
    <div
      style={{ width: "480px", height: "80px" }}
      className="absolute top-0 left-0 bg-gradient-to-b from-[#0e1d4a] via-[#0a1639] to-[#070f28] border-b-2 border-amber-500/80 text-white z-20 select-none shadow-lg"
    >
      {/* ============================================================= */}
      {/* 1. IZQUIERDA: ❤️ VIDAS (Completamente independiente)         */}
      {/* ============================================================= */}
      <div
        style={{ left: "16px", top: "18px", width: "100px", height: "44px" }}
        className="absolute px-3 flex items-center justify-between rounded-2xl bg-[#132352] border-2 border-red-500 shadow-md"
      >
        <SpriteIcon name="extraLife" size={26} />
        <span className="text-base font-black text-red-400 tabular-nums font-mono text-right w-12 tracking-wide">
          x{lives}
        </span>
      </div>

      {/* ============================================================= */}
      {/* 2. CENTRO: PREGUNTA / PROGRESO (Eje central exacto)           */}
      {/* ============================================================= */}
      <div
        style={{ left: "135px", top: "10px", width: "170px", height: "60px" }}
        className="absolute flex flex-col items-center justify-center text-center"
      >
        <span className="text-[10px] font-black uppercase text-amber-300 tracking-widest leading-none drop-shadow">
          PREGUNTA
        </span>
        <span className="text-2xl font-black text-white tracking-wider tabular-nums font-mono leading-none mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          #{questionsAnsweredCount + 1}
        </span>
        {/* Indicador de progreso hacia la Ruleta (Cada 3 correctas) */}
        <div className="flex items-center gap-1 mt-1" title="Cada 3 respuestas correctas aparece la Ruleta de Premios">
          <span className="text-[9px] font-bold text-slate-300 uppercase mr-0.5">Ruleta:</span>
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 rounded-full border transition-all ${
                idx < correctAnswersForRouletteCount
                  ? "bg-amber-400 border-amber-200 shadow-[0_0_6px_rgba(245,186,19,0.8)]"
                  : "bg-slate-800 border-slate-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ============================================================= */}
      {/* 3. DERECHA: ⭐ PUNTOS (Completamente independiente)          */}
      {/* ============================================================= */}
      <div
        style={{ right: "68px", top: "18px", width: "116px", height: "44px" }}
        className="absolute px-2.5 flex items-center justify-between rounded-2xl bg-[#132352] border-2 border-amber-400 shadow-md"
      >
        <SpriteIcon name="coins" size={24} />
        <span className="text-xs font-black text-amber-300 tabular-nums font-mono text-right w-16 truncate">
          {score} PTS
        </span>
      </div>

      {/* ============================================================= */}
      {/* 4. ESQUINA SUPERIOR DERECHA: ⏸ PAUSA                          */}
      {/* ============================================================= */}
      <div style={{ right: "16px", top: "18px" }} className="absolute">
        <button
          onClick={pauseGame}
          className="w-11 h-11 rounded-2xl bg-[#142659] border-2 border-amber-400 text-amber-300 hover:bg-[#1a3375] hover:border-yellow-300 active:scale-95 transition-all flex items-center justify-center shadow-lg cursor-pointer"
          title="Pausar Juego"
          aria-label="Pausar Juego"
        >
          <Pause className="w-5 h-5 text-amber-300 fill-amber-300" />
        </button>
      </div>
    </div>
  );
};
