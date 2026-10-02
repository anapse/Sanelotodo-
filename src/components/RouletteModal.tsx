import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { RuletaSpriteWheel } from "./RuletaSpriteWheel";
import { Sparkles } from "lucide-react";

export const RouletteModal: React.FC = () => {
  const { spinRoulette, claimRoulettePrizeAndContinue, roulettePrizeMessage } = useGame();
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [hasSpun, setHasSpun] = useState<boolean>(false);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);

  const handleSpin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    const totalTargetRotation = rotationDegrees + 1440 + Math.floor(Math.random() * 360);

    const startTime = performance.now();
    const duration = 3200; // 3.2 segundos de animación física suavizada
    const startDegrees = rotationDegrees;

    const animateSpin = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing cúbico desacelerado
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startDegrees + (totalTargetRotation - startDegrees) * easeOut;

      setRotationDegrees(currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        spinRoulette();
        setIsSpinning(false);
        setHasSpun(true);
      }
    };

    requestAnimationFrame(animateSpin);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/95 select-none">
      <div className="w-[410px] max-w-full max-h-[760px] bg-blue-950 border-2 border-amber-500 rounded-3xl p-4 shadow-[0_0_50px_rgba(245,186,19,0.3)] text-center relative overflow-y-auto flex flex-col justify-between my-auto">
        {/* Encabezado */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-extrabold text-[10px] uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mecánica Especial de Ruleta</span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wide">
            RULETA DE PREMIOS
          </h2>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
            ¡Gira el disco oficial de la ruleta y suma comodines, vidas, puntos o la Ronda Bonus!
          </p>
        </div>

        {/* Componente Canvas del Sprite Sheet de la Ruleta en Eje Unificado */}
        <RuletaSpriteWheel
          rotationDegrees={rotationDegrees}
          isSpinning={isSpinning}
        />

        {/* Resultado del Premio */}
        {hasSpun && roulettePrizeMessage && (
          <div className="p-2 bg-amber-500/20 border-2 border-amber-400 rounded-2xl my-1 animate-bounce">
            <span className="block text-[10px] font-black text-amber-300 uppercase tracking-widest">
              ¡Premio Obtenido!
            </span>
            <span className="text-sm font-black text-white">{roulettePrizeMessage}</span>
          </div>
        )}

        {/* Acciones */}
        <div className="pt-1.5">
          {!hasSpun ? (
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSpinning ? "GIRANDO DISCO..." : "¡GIRAR RULETA!"}
            </button>
          ) : (
            <button
              onClick={claimRoulettePrizeAndContinue}
              className="w-full py-3 px-5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all"
            >
              RECLAMAR PREMIO Y CONTINUAR
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
