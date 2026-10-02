import React, { useEffect, useRef } from "react";
import { OFFICIAL_SPRITES } from "../config/assetManager";

export type IconName =
  | "fiftyFifty"
  | "skip"
  | "shield"
  | "correctAnswer"
  | "extraLife"
  | "roulette"
  | "star"
  | "book"
  | "hourglass"
  | "speechBubbles"
  | "retry"
  | "target"
  | "crown"
  | "infinity"
  | "bomb"
  | "trophy"
  | "close"
  | "coins";

interface IconDef {
  file: string;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/**
 * Coordenadas matemáticas exactas píxel a píxel recortadas de las hojas oficiales
 * (iconos1.png e iconos2.png), eliminando márgenes vacíos y evitando sangrado de frames vecinos.
 */
const ICON_DEFINITIONS: Record<IconName, IconDef> = {
  // Hoja Oficial 1 (iconos1.png - 2175x723 px)
  fiftyFifty: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 121, sy: 17, sw: 235, sh: 224 },
  skip: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 529, sy: 15, sw: 288, sh: 226 },
  shield: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 988, sy: 11, sw: 211, sh: 230 },
  correctAnswer: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 1378, sy: 0, sw: 254, sh: 241 },
  extraLife: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 1766, sy: 17, sw: 254, sh: 224 },

  roulette: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 113, sy: 241, sw: 234, sh: 241 },
  star: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 498, sy: 241, sw: 273, sh: 241 },
  book: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 904, sy: 241, sw: 373, sh: 236 },
  hourglass: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 1417, sy: 241, sw: 323, sh: 241 },
  speechBubbles: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 1740, sy: 241, sw: 320, sh: 241 },

  retry: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 120, sy: 482, sw: 226, sh: 234 },
  target: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 508, sy: 482, sw: 250, sh: 241 },
  crown: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 951, sy: 489, sw: 276, sh: 219 },
  infinity: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 1323, sy: 482, sw: 377, sh: 232 },
  bomb: { file: OFFICIAL_SPRITES.iconos1.spritePath, sx: 1805, sy: 482, sw: 240, sh: 228 },

  // Hoja Oficial 2 (iconos2.png - 1774x887 px)
  trophy: { file: OFFICIAL_SPRITES.iconos2.spritePath, sx: 31, sy: 665, sw: 258, sh: 192 },
  close: { file: OFFICIAL_SPRITES.iconos2.spritePath, sx: 1245, sy: 665, sw: 201, sh: 190 },
  coins: { file: OFFICIAL_SPRITES.iconos2.spritePath, sx: 1503, sy: 665, sw: 245, sh: 192 },
};

interface SpriteIconProps {
  name: IconName;
  size?: number; // Tamaño en px de visualización
  className?: string;
  alt?: string;
}

export const SpriteIcon: React.FC<SpriteIconProps> = ({
  name,
  size = 40,
  className = "",
  alt,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const def = ICON_DEFINITIONS[name] || ICON_DEFINITIONS.fiftyFifty;

    const img = new Image();
    img.src = def.file;

    img.onload = () => {
      // Resolución retina 2x
      const dpr = 2;
      canvas.width = size * dpr;
      canvas.height = size * dpr;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ajuste proporcional con preservación de aspecto (contain)
      const aspect = def.sw / def.sh;
      let drawW = canvas.width;
      let drawH = canvas.height;
      let drawX = 0;
      let drawY = 0;

      if (aspect > 1) {
        drawH = canvas.width / aspect;
        drawY = (canvas.height - drawH) / 2;
      } else {
        drawW = canvas.height * aspect;
        drawX = (canvas.width - drawW) / 2;
      }

      ctx.drawImage(
        img,
        def.sx,
        def.sy,
        def.sw,
        def.sh,
        drawX,
        drawY,
        drawW,
        drawH
      );
    };
  }, [name, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`inline-block object-contain filter drop-shadow-sm select-none shrink-0 ${className}`}
      aria-label={alt || name}
    />
  );
};
