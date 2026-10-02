import React from "react";
import { QuizCanvasView } from "./QuizCanvasView";
import { Sparkles, Gift } from "lucide-react";

export const BonusRoundModal: React.FC = () => {
  return (
    <div className="w-full">
      {/* Banner de Ronda Bonus de Regalo */}
      <div className="w-full max-w-xl mx-auto px-4 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-center text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md">
        <Gift className="w-4 h-4 animate-bounce" />
        <span>¡RONDA BONUS DE PREGUNTAS FÁCILES DE REGALO!</span>
        <Sparkles className="w-4 h-4" />
      </div>

      <QuizCanvasView />
    </div>
  );
};
