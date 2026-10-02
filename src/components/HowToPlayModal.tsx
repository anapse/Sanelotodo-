import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { HelpCircle, ChevronLeft, ChevronRight, X } from "lucide-react";
import { OFFICIAL_SPRITES } from "../config/assetManager";
import { SpriteIcon } from "./SpriteIcon";
import { RuletaSpriteWheel } from "./RuletaSpriteWheel";

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

  // 9 Puntos obligatorios de la especificación
  const slides = [
    {
      title: "1. Escribe tu Nombre",
      subtitle: "Inicio Obligatorio",
      type: "logo",
      content: (
        <div className="space-y-2 text-center px-2">
          <p className="text-xs text-slate-200 leading-relaxed">
            Al pulsar <span className="text-amber-300 font-bold">JUGAR</span>, es obligatorio escribir tu nombre de jugador para habilitar el botón <span className="text-amber-300 font-bold">COMENZAR</span>.
          </p>
          <p className="text-xs text-slate-300">
            Tu nombre identificará tus puntos y progreso en el ranking oficial del juego.
          </p>
        </div>
      ),
    },
    {
      title: "2. Responde y Cuida tus Vidas",
      subtitle: "Mecánica Principal",
      type: "vidas",
      content: (
        <div className="space-y-2 text-center px-2">
          <p className="text-xs text-slate-200 leading-relaxed">
            Tienes <span className="text-amber-300 font-bold">20 segundos</span> para responder cada pregunta de opción múltiple.
          </p>
          <div className="bg-blue-900/60 p-2.5 rounded-xl border border-blue-700/60 text-xs text-left space-y-1">
            <p><span className="text-red-400 font-bold">❤️ Inicio:</span> Empiezas con 3 corazones de vida.</p>
            <p><span className="text-emerald-400 font-bold">❤️ Máximo:</span> Puedes llegar hasta 5 vidas como límite.</p>
            <p><span className="text-rose-400 font-bold">💔 Error:</span> Cada fallo descuenta 1 corazón. Al llegar a 0 vidas es <span className="font-black text-red-400">GAME OVER</span>.</p>
          </div>
        </div>
      ),
    },
    {
      title: "3. Los 5 Comodines Oficiales",
      subtitle: "Panel de Ayuda",
      type: "comodines",
      content: (
        <div className="text-xs space-y-1.5 text-left bg-blue-900/60 p-2.5 rounded-xl border border-blue-700/60 overflow-y-auto max-h-[140px]">
          <p><span className="text-amber-300 font-bold">50 / 50:</span> Elimina 2 respuestas incorrectas. Quedan 2 opciones.</p>
          <p><span className="text-amber-300 font-bold">SALTAR:</span> Salta la pregunta actual sin perder vida y continúa con otra.</p>
          <p><span className="text-amber-300 font-bold">ESCUDO:</span> Si fallas, no pierdes la vida y puedes volver a responder la misma pregunta.</p>
          <p><span className="text-amber-300 font-bold">PISTA:</span> Marca en oro la opción correcta para que la pulses.</p>
          <p><span className="text-amber-300 font-bold">+1 VIDA:</span> Añade +1 corazón (hasta un máximo de 5).</p>
        </div>
      ),
    },
    {
      title: "4. Ruleta y Ronda Bonus",
      subtitle: "Premios por Aciertos",
      type: "ruleta",
      content: (
        <div className="space-y-2 text-center px-2">
          <p className="text-xs text-slate-200 leading-relaxed">
            La ruleta aparece únicamente cada <span className="text-amber-300 font-bold">3 respuestas correctas</span> (las incorrectas y saltar no cuentan).
          </p>
          <div className="bg-blue-900/60 p-2 rounded-xl border border-blue-700/60 text-xs text-left space-y-1">
            <p><span className="text-amber-300 font-bold">🎁 Premios:</span> Comodines, vidas extra, puntos o la Ronda Bonus.</p>
            <p><span className="text-yellow-300 font-bold">✨ Ronda Bonus:</span> Son 3 preguntas fáciles de regalo para sumar puntos seguros antes de volver al juego normal.</p>
          </div>
        </div>
      ),
    },
  ];

  const currentSlide = slides[step];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 select-none">
      <div className="w-[410px] max-w-full bg-blue-950 border-2 border-amber-500 rounded-3xl p-5 shadow-[0_0_40px_rgba(245,186,19,0.3)] text-white text-center relative overflow-hidden flex flex-col justify-between h-[540px]">
        {/* Botón cerrar X */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 cursor-pointer"
          aria-label="Cerrar Guía"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-extrabold text-[10px] uppercase tracking-widest mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Especificación Oficial</span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wide">
            CÓMO JUGAR
          </h2>
          <span className="text-[11px] font-bold text-amber-400/90 uppercase tracking-wider block mt-0.5">
            {currentSlide.subtitle}
          </span>
        </div>

        {/* Ilustración de Assets Oficiales */}
        <div className="my-2 h-40 bg-slate-900/80 rounded-2xl border border-slate-700/80 p-2 flex items-center justify-center overflow-hidden">
          {currentSlide.type === "logo" && (
            <img
              src={OFFICIAL_SPRITES.logo.spritePath}
              alt="Logo Oficial ¿SABELOTODO?"
              className="max-h-full max-w-full object-contain filter drop-shadow-md"
            />
          )}

          {currentSlide.type === "vidas" && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <SpriteIcon name="extraLife" size={44} />
                <span className="text-2xl font-black text-red-400 font-mono">3 / 5</span>
              </div>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Vidas Iniciales: 3 • Límite Máximo: 5
              </span>
            </div>
          )}

          {currentSlide.type === "comodines" && (
            <div className="grid grid-cols-5 gap-2 items-center justify-center w-full px-1">
              <div className="flex flex-col items-center">
                <SpriteIcon name="fiftyFifty" size={32} />
                <span className="text-[9px] font-black text-amber-300 mt-0.5">50/50</span>
              </div>
              <div className="flex flex-col items-center">
                <SpriteIcon name="skip" size={32} />
                <span className="text-[9px] font-black text-amber-300 mt-0.5">SALTAR</span>
              </div>
              <div className="flex flex-col items-center">
                <SpriteIcon name="shield" size={32} />
                <span className="text-[9px] font-black text-amber-300 mt-0.5">ESCUDO</span>
              </div>
              <div className="flex flex-col items-center">
                <SpriteIcon name="correctAnswer" size={32} />
                <span className="text-[9px] font-black text-amber-300 mt-0.5">PISTA</span>
              </div>
              <div className="flex flex-col items-center">
                <SpriteIcon name="extraLife" size={32} />
                <span className="text-[9px] font-black text-amber-300 mt-0.5">+1 VIDA</span>
              </div>
            </div>
          )}

          {currentSlide.type === "ruleta" && (
            <div className="scale-75 origin-center">
              <RuletaSpriteWheel rotationDegrees={0} isSpinning={false} />
            </div>
          )}
        </div>

        {/* Contenido explicativo */}
        <div>
          <h3 className="text-sm font-black text-amber-300 uppercase mb-1">
            {currentSlide.title}
          </h3>
          {currentSlide.content}
        </div>

        {/* Navegación */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            disabled={step === 0}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <span className="text-[11px] font-black text-amber-400 px-1 font-mono">
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
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1 shadow-lg cursor-pointer"
          >
            <span>{step === slides.length - 1 ? "Entendido" : "Siguiente"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
