import React from "react";
import { useGame } from "../context/GameContext";
import { SpriteIcon } from "./SpriteIcon";
import { Pause } from "lucide-react";

export const HeaderHUD: React.FC = () => {
  const { lives, score, questionsAnsweredCount, pauseGame } = useGame();

  return (
    <div className="w-full h-[85px] px-4 py-2 flex items-center justify-between bg-slate-950/90 border-b-2 border-amber-500/60 text-white relative z-20 shrink-0">
      {/* IZQUIERDA: Vidas y Puntos con Ancho Fijo y Números Tabulares */}
      <div className="flex flex-col gap-1.5 shrink-0">
        {/* Corazones / Vidas */}
        <div className="w-[84px] h-[28px] px-2.5 flex items-center justify-between rounded-full bg-slate-900 border border-red-500/70 shadow-sm shrink-0">
          <SpriteIcon name="extraLife" size={18} />
          <span className="text-xs font-black text-red-400 tabular-nums font-mono">
            x{lives}
          </span>
        </div>

        {/* Puntos / Monedas */}
        <div className="w-[115px] h-[28px] px-2.5 flex items-center justify-between rounded-full bg-slate-900 border border-amber-500/70 shadow-sm shrink-0">
          <SpriteIcon name="coins" size={18} />
          <span className="text-xs font-black text-amber-300 tabular-nums font-mono">
            {score} PTS
          </span>
        </div>
      </div>

      {/* CENTRO: Indicador Principal de Pregunta con Ancho Fijo */}
      <div className="w-[120px] text-center flex flex-col items-center justify-center shrink-0">
        <span className="block text-[10px] font-black uppercase text-amber-400 tracking-widest leading-tight">
          PREGUNTA
        </span>
        <span className="text-2xl font-black text-white tracking-wider tabular-nums font-mono leading-none mt-0.5">
          #{questionsAnsweredCount + 1}
        </span>
      </div>

      {/* DERECHA: Botón PAUSA Fijo */}
      <div className="shrink-0 flex items-center justify-end">
        <button
          onClick={pauseGame}
          className="w-11 h-11 rounded-2xl bg-slate-900 border-2 border-amber-500/80 text-amber-300 hover:bg-slate-800 active:scale-95 transition-transform flex items-center justify-center shadow-lg"
          title="Pausar Juego"
        >
          <Pause className="w-5 h-5 text-amber-400" />
        </button>
      </div>
    </div>
  );
};
