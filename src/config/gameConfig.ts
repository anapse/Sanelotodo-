/**
 * CONFIGURACIÓN CENTRALIZADA DE ¿SABELOTODO?
 */
import { resolvePublicAssetPath } from "./assetManager";

export interface GameConfig {
  initialLives: number;
  maxLives: number;

  rouletteFrequencyQuestions: number;

  pointsNormalQuestionCorrect: number;
  pointsBonusQuestionCorrect: number;
  pointsRouletteSmallPrize: number;
  pointsRouletteMediumPrize: number;
  pointsRouletteBigPrize: number;

  officialBackgroundUrl: string | null;
  officialLogoUrl: string;

  adminSecretKey: string | null;
}

export const defaultConfig: GameConfig = {
  initialLives: 3,
  maxLives: 5,
  rouletteFrequencyQuestions: 3,

  pointsNormalQuestionCorrect: 100,
  pointsBonusQuestionCorrect: 50,
  pointsRouletteSmallPrize: 150,
  pointsRouletteMediumPrize: 300,
  pointsRouletteBigPrize: 500,

  officialBackgroundUrl: null,
  officialLogoUrl: resolvePublicAssetPath("/assets/sprites/logo.png"),

  adminSecretKey: null,
};
