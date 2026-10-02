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
  col: number;
  row: number;
  cols: number;
  rows: number;
}

const ICON_DEFINITIONS: Record<IconName, IconDef> = {
  // Iconos de la Hoja 1 (iconos1.png - 5 columnas x 3 filas)
  fiftyFifty: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 0, row: 0, cols: 5, rows: 3 },
  skip: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 1, row: 0, cols: 5, rows: 3 },
  shield: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 2, row: 0, cols: 5, rows: 3 },
  correctAnswer: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 3, row: 0, cols: 5, rows: 3 },
  extraLife: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 4, row: 0, cols: 5, rows: 3 },

  roulette: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 0, row: 1, cols: 5, rows: 3 },
  star: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 1, row: 1, cols: 5, rows: 3 },
  book: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 2, row: 1, cols: 5, rows: 3 },
  hourglass: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 3, row: 1, cols: 5, rows: 3 },
  speechBubbles: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 4, row: 1, cols: 5, rows: 3 },

  retry: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 0, row: 2, cols: 5, rows: 3 },
  target: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 1, row: 2, cols: 5, rows: 3 },
  crown: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 2, row: 2, cols: 5, rows: 3 },
  infinity: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 3, row: 2, cols: 5, rows: 3 },
  bomb: { file: OFFICIAL_SPRITES.iconos1.spritePath, col: 4, row: 2, cols: 5, rows: 3 },

  // Iconos de la Hoja 2 (iconos2.png - 6 columnas x 4 filas)
  trophy: { file: OFFICIAL_SPRITES.iconos2.spritePath, col: 0, row: 3, cols: 6, rows: 4 },
  close: { file: OFFICIAL_SPRITES.iconos2.spritePath, col: 4, row: 3, cols: 6, rows: 4 },
  coins: { file: OFFICIAL_SPRITES.iconos2.spritePath, col: 5, row: 3, cols: 6, rows: 4 },
};

interface SpriteIconProps {
  name: IconName;
  size?: number; // Tamaño en px
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
      const cellW = img.width / def.cols;
      const cellH = img.height / def.rows;

      canvas.width = size * 2; // HiDPI/Retina rendering
      canvas.height = size * 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const sx = def.col * cellW;
      const sy = def.row * cellH;

      ctx.drawImage(
        img,
        sx,
        sy,
        cellW,
        cellH,
        0,
        0,
        canvas.width,
        canvas.height
      );
    };
  }, [name, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`inline-block object-contain filter drop-shadow-sm select-none ${className}`}
      aria-label={alt || name}
    />
  );
};
