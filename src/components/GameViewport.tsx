import React from "react";
import { OFFICIAL_SPRITES } from "../config/assetManager";
import { useStageDimensions } from "../context/StageContext";

interface GameViewportProps {
  children: React.ReactNode;
}

export const GameViewport: React.FC<GameViewportProps> = ({ children }) => {
  const {
    stageWidth,
    stageHeight,
    hudHeight,
    timerHeight,
    jokerAreaHeight,
    contentHeight,
    jokerCardWidth,
    jokerCardHeight,
    jokerGap,
  } = useStageDimensions();

  return (
    <div className="fixed inset-0 bg-[#060b1c] flex items-center justify-center overflow-hidden select-none p-0">
      {/* Fondo ambiental sutil alrededor del juego para pantallas anchas */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: `url(${OFFICIAL_SPRITES.background.spritePath})` }}
      />

      {/* STAGE CENTRAL ÚNICO CON PROPORCIÓN ESTRICTA 9:16 DERIVADA DEL VIEWPORT */}
      <div
        id="game-stage"
        style={
          {
            width: `${stageWidth}px`,
            height: `${stageHeight}px`,
            backgroundImage: `url(${OFFICIAL_SPRITES.background.spritePath})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            "--stage-width": `${stageWidth}px`,
            "--stage-height": `${stageHeight}px`,
            "--hud-height": `${hudHeight}px`,
            "--timer-height": `${timerHeight}px`,
            "--joker-area-height": `${jokerAreaHeight}px`,
            "--content-height": `${contentHeight}px`,
            "--joker-card-width": `${jokerCardWidth}px`,
            "--joker-card-height": `${jokerCardHeight}px`,
            "--joker-gap": `${jokerGap}px`,
          } as React.CSSProperties
        }
        className="relative border-0 sm:border-4 sm:border-amber-500/90 sm:rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col justify-between shrink-0"
      >
        {children}
      </div>
    </div>
  );
};

