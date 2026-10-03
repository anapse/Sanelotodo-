import React, { useEffect, useRef } from "react";
import { OFFICIAL_SPRITES } from "../config/assetManager";

interface RuletaSpriteWheelProps {
  rotationDegrees: number;
  isSpinning: boolean;
  size?: number;
}

export const RuletaSpriteWheel: React.FC<RuletaSpriteWheelProps> = ({
  rotationDegrees,
  isSpinning,
  size = 280,
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
      // Medidas lógicas del canvas
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
      const targetDiscRadius = 192;
      const discScale = targetDiscRadius / discOriginalRadius;
      const finalDiscRadiusOnCanvas = targetDiscRadius * scale;

      // Medidas del indicador en Frame 1
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

        // CAPA 1: DISCO DE COLORES GIRATORIO
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

        // CAPA 2: BASE / MUEBLE FIJO
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

        // CAPA 3: INDICADOR SUPERIOR FIJO
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
  }, [rotationDegrees, isSpinning, size]);

  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className="relative mx-auto my-1 flex items-center justify-center filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)] shrink-0"
    >
      <canvas
        ref={canvasRef}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="object-contain select-none"
      />
    </div>
  );
};
