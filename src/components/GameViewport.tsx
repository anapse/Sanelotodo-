import React, { useState, useEffect } from "react";
import { OFFICIAL_SPRITES } from "../config/assetManager";

interface GameViewportProps {
  children: React.ReactNode;
}

export const GameViewport: React.FC<GameViewportProps> = ({ children }) => {
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const handleResize = () => {
      // Dimensiones lógicas fijas del GameStage oficial
      const targetWidth = 480;
      const targetHeight = 800;

      // Descontar márgenes de seguridad para bordes y sombras
      const availableWidth = Math.max(window.innerWidth - 16, 280);
      const availableHeight = Math.max(window.innerHeight - 16, 280);

      // Calcular escala uniforme conservando estrictamente la proporción 3:5
      const scaleX = availableWidth / targetWidth;
      const scaleY = availableHeight / targetHeight;
      const newScale = Math.min(scaleX, scaleY, 1.25);

      setScale(Math.max(newScale, 0.35));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#060b1c] flex items-center justify-center overflow-hidden select-none p-2">
      {/* Fondo ambiental sutil alrededor del juego sin filtros pesados */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: `url(${OFFICIAL_SPRITES.background.spritePath})` }}
      />

      {/* STAGE LÓGICO ÚNICO 480×800 - Toda la interfaz escala como una sola unidad */}
      <div
        id="game-stage"
        style={{
          width: "480px",
          height: "800px",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          backgroundImage: `url(${OFFICIAL_SPRITES.background.spritePath})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="relative border-4 border-amber-500/90 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden shrink-0"
      >
        {children}
      </div>
    </div>
  );
};
