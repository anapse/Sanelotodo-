import React, { useEffect, useRef } from "react";
import { OFFICIAL_SPRITES } from "../config/assetManager";

interface RuletaSpriteWheelProps {
  rotationDegrees: number;
  isSpinning: boolean;
}

export const RuletaSpriteWheel: React.FC<RuletaSpriteWheelProps> = ({
  rotationDegrees,
  isSpinning,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = OFFICIAL_SPRITES.ruleta.spritePath;

    img.onload = () => {
      // El sprite sheet oficial es de 2172x724 px (3 fotogramas de 724x724 px)
      // Frame 0 (x: 0..724): Disco de Colores Giratorio con Premios.
      // Frame 1 (x: 724..1448): Indicador / Flecha Pin Rojo y Dorado.
      // Frame 2 (x: 1448..2172): Soporte / Base con Hueco Circular y Pedestal.

      const frameWidth = 724;
      const frameHeight = 724;

      // Tamaño base lógico del canvas en píxeles
      const size = 360;
      canvas.width = size;
      canvas.height = size;

      // -------------------------------------------------------------
      // REFERENCIAS UNIFICADAS DE CENTRADO ABSOLUTO
      // -------------------------------------------------------------
      // wheelCenterX: Centro horizontal exacto del eje de la ruleta
      const wheelCenterX = size * 0.4972; // 179px (50% del ancho)
      // wheelCenterY: Centro vertical exacto de la ventana circular de la base
      const wheelCenterY = size * 0.3453; // 124.3px (Eje del hueco de la base)

      // Diámetro del disco giratorio (70% del ancho del mueble para margen adecuado)
      const discDiameter = size * 0.68; // ~245px

      let animationFrameId: number;

      const render = () => {
        ctx.clearRect(0, 0, size, size);

        // -------------------------------------------------------------
        // CAPA 1: DISCO DE COLORES GIRATORIO (Frame 0: x=0)
        // Gira ÚNICAMENTE el disco alrededor del eje (wheelCenterX, wheelCenterY).
        // -------------------------------------------------------------
        ctx.save();
        ctx.translate(wheelCenterX, wheelCenterY);
        ctx.rotate((rotationDegrees * Math.PI) / 180);
        ctx.drawImage(
          img,
          0,
          0,
          frameWidth,
          frameHeight,
          -discDiameter / 2,
          -discDiameter / 2,
          discDiameter,
          discDiameter
        );
        ctx.restore();

        // -------------------------------------------------------------
        // CAPA 2: SOPORTE Y BASE DORA/AZUL FIJA (Frame 2: x=1448)
        // Permanece COMPLETAMENTE FIJA. No rota.
        // -------------------------------------------------------------
        ctx.save();
        ctx.drawImage(
          img,
          1448,
          0,
          frameWidth,
          frameHeight,
          0,
          0,
          size,
          size
        );
        ctx.restore();

        // -------------------------------------------------------------
        // CAPA 3: INDICADOR / FLECHA SUPERIOR FIJA (Frame 1: x=724)
        // Permanece COMPLETAMENTE FIJA en el eje vertical (wheelCenterX).
        // La punta señala exactamente el radio superior del disco.
        // -------------------------------------------------------------
        ctx.save();
        const pinSize = size * 0.18; // ~65px
        const pinX = wheelCenterX - pinSize / 2;
        // Posicionar justo sobre el radio superior del disco
        const pinY = wheelCenterY - discDiameter / 2 - pinSize * 0.18;

        ctx.drawImage(
          img,
          724,
          0,
          frameWidth,
          frameHeight,
          pinX,
          pinY,
          pinSize,
          pinSize
        );
        ctx.restore();

        if (isSpinning) {
          animationFrameId = requestAnimationFrame(render);
        }
      };

      render();

      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    };
  }, [rotationDegrees, isSpinning]);

  return (
    <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto my-1 flex items-center justify-center filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)]">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain max-w-full max-h-full"
      />
    </div>
  );
};
