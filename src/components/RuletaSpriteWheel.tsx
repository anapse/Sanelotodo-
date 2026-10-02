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
      // El sprite sheet oficial es de 2172x724 px (3 fotogramas de 724x724 px):
      // - Frame 0 (x: 0..724): Disco de Colores Giratorio con Premios.
      // - Frame 1 (x: 724..1448): Indicador / Flecha Pin Rojo y Dorado.
      // - Frame 2 (x: 1448..2172): Mueble / Base con Hueco Circular y Pedestal.

      // Medidas lógicas del canvas
      const size = 300;
      const dpr = 2;
      canvas.width = size * dpr;
      canvas.height = size * dpr;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Coordenadas calculadas matemáticamente de la apertura circular en Frame 2 (Base)
      const baseHoleX = 351.41;
      const baseHoleY = 297.89;

      // Eje central unificado en el canvas (punto de giro del disco y eje vertical del indicador)
      const scale = (size * dpr) / 724;
      const pivotX = baseHoleX * scale;
      const pivotY = baseHoleY * scale;

      // Coordenadas de centro y radio geométrico del disco en Frame 0
      const discCenterX = 366.24;
      const discCenterY = 363.23;
      const discOriginalRadius = 335.02;

      // Escala del disco para encajar holgadamente dentro de la apertura (192px vs 198.9px)
      // dejando una separación visual uniforme y sin rozar la base
      const targetDiscRadius = 192;
      const discScale = targetDiscRadius / discOriginalRadius;
      const finalDiscRadiusOnCanvas = targetDiscRadius * scale;

      // Medidas del indicador en Frame 1:
      // minX=155, maxX=566 (ancho: 411), minY=94, maxY=634 (alto: 540)
      // Eje de simetría en x=358 (local: 203), punta inferior en y=634 (local: 540)
      const pinSrcX = 155;
      const pinSrcY = 94;
      const pinSrcW = 411;
      const pinSrcH = 540;
      const pinLocalTipX = 203; // respecto a pinSrcX

      const pinDrawnW = 54 * (size / 300) * dpr;
      const pinDrawnH = pinDrawnW * (pinSrcH / pinSrcW);

      // Posición de la punta de la flecha: apuntando al borde superior del disco
      const discTopY = pivotY - finalDiscRadiusOnCanvas;
      const pinTipY = discTopY + 2 * dpr;
      const pinDrawX = pivotX - pinDrawnW * (pinLocalTipX / pinSrcW);
      const pinDrawY = pinTipY - pinDrawnH;

      let animationFrameId: number;

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // -------------------------------------------------------------
        // CAPA 1: DISCO DE COLORES GIRATORIO (Frame 0: x=0)
        // Gira ÚNICAMENTE el disco sobre su centro geométrico exacto
        // -------------------------------------------------------------
        ctx.save();
        ctx.translate(pivotX, pivotY);
        ctx.rotate((rotationDegrees * Math.PI) / 180);

        const discDrawW = 724 * discScale * scale;
        const discDrawH = 724 * discScale * scale;
        const discOffsetX = -discCenterX * discScale * scale;
        const discOffsetY = -discCenterY * discScale * scale;

        ctx.drawImage(
          img,
          0,
          0,
          724,
          724,
          discOffsetX,
          discOffsetY,
          discDrawW,
          discDrawH
        );
        ctx.restore();

        // -------------------------------------------------------------
        // CAPA 2: BASE / MUEBLE FIJO (Frame 2: x=1448)
        // Permanece 100% INMÓVIL
        // -------------------------------------------------------------
        ctx.save();
        ctx.drawImage(
          img,
          1448,
          0,
          724,
          724,
          0,
          0,
          canvas.width,
          canvas.height
        );
        ctx.restore();

        // -------------------------------------------------------------
        // CAPA 3: INDICADOR SUPERIOR FIJO (Frame 1: x=724)
        // Permanece 100% INMÓVIL en el eje vertical pivotX
        // -------------------------------------------------------------
        ctx.save();
        ctx.drawImage(
          img,
          724 + pinSrcX,
          pinSrcY,
          pinSrcW,
          pinSrcH,
          pinDrawX,
          pinDrawY,
          pinDrawnW,
          pinDrawnH
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
    <div className="relative w-[300px] h-[300px] mx-auto my-1 flex items-center justify-center filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)] shrink-0">
      <canvas
        ref={canvasRef}
        style={{ width: "300px", height: "300px" }}
        className="w-[300px] h-[300px] object-contain select-none"
      />
    </div>
  );
};
