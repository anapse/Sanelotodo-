import React from "react";
import { useGame } from "../context/GameContext";
import { Pause, Play, Home } from "lucide-react";

export const PauseModal: React.FC = () => {
  const { phase, resumeGame, quitGameToMenu } = useGame();

  if (phase !== "PAUSED") return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-[380px] bg-blue-950 border-2 border-amber-500 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,186,19,0.3)] text-center text-white relative overflow-hidden">
        {/* Título Pausa */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-extrabold text-xs uppercase tracking-widest mb-2">
            <Pause className="w-4 h-4 text-amber-400" />
            <span>Juego en Pausa</span>
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">
            PAUSA
          </h2>
        </div>

        {/* Botones Alineados Verticalmente */}
        <div className="space-y-4">
          <button
            onClick={resumeGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-lg uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>CONTINUAR</span>
          </button>

          <button
            onClick={quitGameToMenu}
            className="w-full py-3.5 rounded-2xl bg-slate-800 border-2 border-slate-600 text-slate-200 font-bold text-base uppercase tracking-wider hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>MENÚ PRINCIPAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
