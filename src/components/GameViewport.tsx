import React, { useState, useEffect } from "react";
import { OFFICIAL_SPRITES } from "../config/assetManager";

interface GameViewportProps {
  children: React.ReactNode;
}

export const GameViewport: React.FC<GameViewportProps> = ({ children }) => {
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const handleResize = () => {
      // Dimensiones lógicas fijas
      const targetWidth = 480;
      const targetHeight = 800;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Calcular escala conservando la proporción 3:5
      const scaleX = windowWidth / targetWidth;
      const scaleY = windowHeight / targetHeight;
      const newScale = Math.min(scaleX, scaleY, 1.25);

      setScale(Math.max(newScale, 0.35));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center overflow-hidden select-none">
      {/* Fondo ambiental desenfocado alrededor del juego */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none bg-cover bg-center filter blur-xl scale-110"
        style={{ backgroundImage: `url(${OFFICIAL_SPRITES.background.spritePath})` }}
      />

      {/* Viewport Lógico Estricto 480x800 con el Fondo Oficial fondo.png */}
      <div
        style={{
          width: "480px",
          height: "800px",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          backgroundImage: `url(${OFFICIAL_SPRITES.background.spritePath})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="relative border-4 border-amber-500/80 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden shrink-0 flex flex-col"
      >
        {children}
      </div>
    </div>
  );
};
