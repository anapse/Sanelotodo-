import React from "react";
import { useGame } from "../context/GameContext";
import { Trophy, RotateCcw, Home, Skull } from "lucide-react";

export const GameOverModal: React.FC = () => {
  const { playerName, score, questionsAnsweredCount, setPhase, startNewGameSession } = useGame();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 select-none">
      <div className="w-[380px] max-w-full bg-blue-950 border-2 border-red-500 rounded-3xl p-5 shadow-[0_0_50px_rgba(239,68,68,0.4)] text-center relative overflow-hidden">
        {/* Icono GameOver */}
        <div className="w-14 h-14 bg-red-500/10 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-2 text-red-500 animate-pulse shadow-inner">
          <Skull className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest mb-0.5">
          GAME OVER
        </h2>
        <p className="text-xs text-slate-300 mb-4">
          ¡Te has quedado sin vidas, <strong className="text-amber-400 font-bold">{playerName}</strong>!
        </p>

        {/* Resumen de puntuación */}
        <div className="p-3 bg-blue-900/60 border border-blue-800 rounded-2xl mb-4 space-y-2">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Puntuación Final
            </span>
            <span className="text-3xl font-black text-amber-400 block tabular-nums font-mono">{score} PTS</span>
          </div>

          <div className="border-t border-blue-800 pt-1.5 flex justify-around text-xs text-slate-300">
            <div>
              <span className="text-slate-400 text-[10px] block">Preguntas Respondidas</span>
              <span className="font-extrabold text-white text-sm tabular-nums font-mono">{questionsAnsweredCount}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-2">
          <button
            onClick={startNewGameSession}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base tracking-wider uppercase shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>VOLVER A JUGAR</span>
          </button>

          <button
            onClick={() => setPhase("TOP50")}
            className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 border border-amber-500/50 text-amber-300 font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>VER TOP 50 GLOBAL</span>
          </button>

          <button
            onClick={() => setPhase("MENU")}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-950 hover:bg-blue-900 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>MENÚ PRINCIPAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
