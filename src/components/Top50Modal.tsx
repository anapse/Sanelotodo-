import React, { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import { fetchTop50Ranking, RankingEntry } from "../services/rankingService";
import { Trophy, Medal, X } from "lucide-react";

interface Top50ModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Top50Modal: React.FC<Top50ModalProps> = ({ isOpen = true, onClose }) => {
  const { quitGameToMenu } = useGame();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchTop50Ranking();
      setRanking(data);
    }
    if (isOpen) {
      load();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      quitGameToMenu();
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-[420px] h-[620px] bg-blue-950 border-2 border-amber-500 rounded-3xl p-5 shadow-[0_0_50px_rgba(245,186,19,0.3)] text-white text-center relative overflow-hidden flex flex-col justify-between">
        {/* Botón cerrar X */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-extrabold text-[10px] uppercase tracking-widest mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Tabla de Clasificación</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">
            TOP 50 JUGADORES
          </h2>
        </div>

        {/* Lista Vertical con Scroll Interno Únicamente */}
        <div className="my-3 flex-1 overflow-y-auto pr-1 space-y-2 border border-slate-800 rounded-2xl p-2 bg-slate-900/60 scrollbar-thin scrollbar-thumb-amber-500">
          {ranking.length === 0 ? (
            <div className="text-slate-400 text-xs py-10 font-medium">
              Aún no hay puntuaciones registradas. ¡Sé el primero en jugar y figurar en el Ranking!
            </div>
          ) : (
            ranking.map((player: RankingEntry, idx: number) => {
              const isTop3 = idx < 3;
              let rankBadge = `${idx + 1}º`;
              if (idx === 0) rankBadge = "🥇 1º";
              if (idx === 1) rankBadge = "🥈 2º";
              if (idx === 2) rankBadge = "🥉 3º";

              return (
                <div
                  key={player.id || idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                    isTop3
                      ? "bg-amber-500/20 border-amber-400/60 font-black text-amber-200"
                      : "bg-slate-900 border-slate-700/80 text-slate-200 font-bold"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-left font-black text-amber-300">
                      {rankBadge}
                    </span>
                    <span className="truncate max-w-[170px] text-white">
                      {player.playerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-black text-amber-400">
                    <Medal className="w-3.5 h-3.5" />
                    <span>{player.score} PTS</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Botón Inferior de Cierre */}
        <div className="pt-1">
          <button
            onClick={handleClose}
            className="w-full py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
          >
            Volver al Menú
          </button>
        </div>
      </div>
    </div>
  );
};
