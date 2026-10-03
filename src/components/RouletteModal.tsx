import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { useStageDimensions } from "../context/StageContext";
import { RuletaSpriteWheel } from "./RuletaSpriteWheel";
import { SpriteIcon } from "./SpriteIcon";
import { RARITY_CONFIG } from "../types/lifeline";
import { Sparkles, Heart, Zap, Gift } from "lucide-react";

export const RouletteModal: React.FC = () => {
  const { spinRoulette, claimRoulettePrizeAndContinue, currentWheelPrize, currentRound } = useGame();
  const { stageWidth, fontScale, iconScale } = useStageDimensions();
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [hasSpun, setHasSpun] = useState<boolean>(false);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);

  const wheelSize = Math.min(Math.round(stageWidth * 0.58), 270);
  const modalWidth = Math.min(Math.round(stageWidth * 0.9), 420);

  const handleSpin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    const totalTargetRotation = rotationDegrees + 1440 + Math.floor(Math.random() * 360);

    const startTime = performance.now();
    const duration = 3200; // 3.2 segundos de animación física
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

  const prizeRarity = currentWheelPrize ? RARITY_CONFIG[currentWheelPrize.rarity] : null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/95 select-none animate-in fade-in duration-200">
      <div
        style={{ width: `${modalWidth}px` }}
        className="max-h-[95%] bg-gradient-to-b from-[#10234f] via-[#0b1b3e] to-[#07122a] border-2 border-amber-400 rounded-3xl p-3 sm:p-4 shadow-[0_0_50px_rgba(245,186,19,0.35)] text-center relative overflow-y-auto flex flex-col justify-between my-auto"
      >
        {/* Encabezado */}
        <div>
          <div
            style={{ fontSize: `${Math.max(10 * fontScale, 8.5)}px` }}
            className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 font-black uppercase tracking-widest mb-1 shadow-sm"
          >
            <Sparkles size={Math.round(12 * iconScale)} className="text-amber-400" />
            <span>¡RONDA {currentRound} COMPLETADA!</span>
          </div>
          <h2
            style={{ fontSize: `${Math.max(18 * fontScale, 15)}px` }}
            className="font-black text-white uppercase tracking-wide drop-shadow"
          >
            RULETA DE PREMIOS
          </h2>
          <p
            style={{ fontSize: `${Math.max(10.5 * fontScale, 9)}px` }}
            className="text-slate-300 mt-0.5 leading-snug"
          >
            ¡Gira el disco oficial y suma puntos, vidas, comodines o la Ronda Especial!
          </p>
        </div>

        {/* Componente Canvas del Sprite Sheet de la Ruleta */}
        <RuletaSpriteWheel
          rotationDegrees={rotationDegrees}
          isSpinning={isSpinning}
          size={wheelSize}
        />

        {/* Presentación Estructurada del Premio ("Boleta") */}
        {hasSpun && currentWheelPrize && prizeRarity && (
          <div
            style={{
              borderColor: prizeRarity.badgeBorder,
              boxShadow: `0 0 25px ${prizeRarity.glowColor}`,
            }}
            className="p-3 bg-slate-950/80 border-2 rounded-2xl my-1 animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center gap-1"
          >
            {/* Badge de Categoría y Rareza */}
            <div className="flex items-center gap-2">
              <span
                style={{
                  backgroundColor: prizeRarity.badgeBg,
                  borderColor: prizeRarity.badgeBorder,
                  color: prizeRarity.badgeText,
                }}
                className="text-[9.5px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider shadow"
              >
                {prizeRarity.label}
              </span>

              <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-blue-900/60 border border-blue-400 text-blue-200 uppercase tracking-wider">
                {currentWheelPrize.category === "points" && "Puntos Directos"}
                {currentWheelPrize.category === "life" && "Vidas Directas"}
                {currentWheelPrize.category === "lifeline" && "Comodín para Barra"}
                {currentWheelPrize.category === "special" && "Evento Especial"}
              </span>
            </div>

            {/* Icono y Nombre Destacado */}
            <div className="flex items-center gap-2 my-0.5">
              {currentWheelPrize.icon && (
                <SpriteIcon name={currentWheelPrize.icon} size={Math.round(28 * iconScale)} />
              )}
              {currentWheelPrize.category === "life" && (
                <Heart className="text-red-400 fill-red-400" size={Math.round(24 * iconScale)} />
              )}
              {currentWheelPrize.category === "special" && (
                <Gift className="text-amber-400" size={Math.round(24 * iconScale)} />
              )}
              <span
                style={{ fontSize: `${Math.max(16 * fontScale, 13.5)}px` }}
                className="font-black text-white tracking-wide drop-shadow"
              >
                {currentWheelPrize.name}
              </span>
            </div>

            {/* Destino del premio */}
            <div className="text-[10px] sm:text-[11px] font-bold text-amber-200/90 leading-tight">
              {currentWheelPrize.category === "points" && "✓ Se sumará directamente a tu marcador"}
              {currentWheelPrize.category === "life" && "✓ Se añadirá directamente a tus corazones"}
              {currentWheelPrize.category === "lifeline" && "✓ Se guardará en tu barra de comodines para usarlo cuando quieras"}
              {currentWheelPrize.category === "special" && "✓ Iniciará inmediatamente la ronda de preguntas fáciles"}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="pt-1">
          {!hasSpun ? (
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              style={{ fontSize: `${Math.max(13 * fontScale, 11)}px` }}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black tracking-wider uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSpinning ? "GIRANDO DISCO..." : "¡GIRAR RULETA!"}
            </button>
          ) : (
            <button
              onClick={claimRoulettePrizeAndContinue}
              style={{ fontSize: `${Math.max(13 * fontScale, 11)}px` }}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 font-black tracking-wider uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              <span>RECLAMAR PREMIO Y CONTINUAR</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
