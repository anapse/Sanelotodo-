import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { HelpCircle, ChevronLeft, ChevronRight, X } from "lucide-react";
import { OFFICIAL_SPRITES } from "../config/assetManager";

interface HowToPlayModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen = true, onClose }) => {
  const { quitGameToMenu } = useGame();
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      quitGameToMenu();
    }
  };

  const slides = [
    {
      title: "Responde Preguntas",
      asset: OFFICIAL_SPRITES.logo.spritePath,
      explanation: "Elige la respuesta correcta en cada pregunta de trivia dentro del tiempo límite para sumar puntos y avanzar.",
    },
    {
      title: "Gira la Ruleta de Premios",
      asset: OFFICIAL_SPRITES.ruleta.spritePath,
      explanation: "Cada 3 preguntas correctas se activa la Ruleta de Premios para ganar comodines, puntos extra o la Ronda Bonus.",
    },
    {
      title: "Usa tus Comodines",
      asset: OFFICIAL_SPRITES.iconos1.spritePath,
      explanation: "Aprovecha el 50/50, Saltar Pregunta, Escudo y Vida Extra para superar las preguntas más difíciles y lograr el récord.",
    },
  ];

  const currentSlide = slides[step];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-[380px] bg-blue-950 border-2 border-amber-500 rounded-3xl p-5 shadow-[0_0_40px_rgba(245,186,19,0.3)] text-white text-center relative overflow-hidden flex flex-col justify-between h-[520px]">
        {/* Botón cerrar X en la esquina */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título Arriba */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-extrabold text-[10px] uppercase tracking-widest mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Guía Oficial del Juego</span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wide">
            CÓMO JUGAR
          </h2>
        </div>

        {/* Asset / Ilustración Central */}
        <div className="my-2 h-44 bg-slate-900/80 rounded-2xl border border-slate-700/80 p-2 flex items-center justify-center overflow-hidden">
          <img
            src={currentSlide.asset}
            alt={currentSlide.title}
            className="max-h-full max-w-full object-contain filter drop-shadow-md"
          />
        </div>

        {/* Explicación Debajo */}
        <div className="px-2">
          <h3 className="text-sm font-black text-amber-300 uppercase mb-1">
            {currentSlide.title}
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed min-h-[48px]">
            {currentSlide.explanation}
          </p>
        </div>

        {/* Navegación Abajo: ANTERIOR y SIGUIENTE en la MISMA FILA */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            disabled={step === 0}
            className="flex-1 py-3 rounded-2xl bg-slate-800 border border-slate-600 text-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <span className="text-[11px] font-black text-amber-400 px-1">
            {step + 1}/{slides.length}
          </span>

          <button
            onClick={() => {
              if (step < slides.length - 1) {
                setStep((prev) => prev + 1);
              } else {
                handleClose();
              }
            }}
            className="flex-1 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1 shadow-lg shadow-amber-500/20"
          >
            <span>{step === slides.length - 1 ? "Entendido" : "Siguiente"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
