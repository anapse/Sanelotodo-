/**
 * CONFIGURACIÓN CENTRALIZADA DE ¿SABELOTODO?
 */

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

  officialBackgroundUrl: null, // PENDIENTE: /assets/sprites/bg_official.png
  officialLogoUrl: "/assets/sprites/logo.png",

  adminSecretKey: null,
};
