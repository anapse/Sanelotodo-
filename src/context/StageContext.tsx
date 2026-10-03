import React, { createContext, useContext, useState, useEffect } from "react";

export interface StageDimensions {
  viewportWidth: number;
  viewportHeight: number;
  stageWidth: number;
  stageHeight: number;
  aspectRatio: number; // 9 / 16 = 0.5625
  scale: number; // Factor de escala normalizado respecto a base 800px

  // Zonas funcionales verticales (Suma exacta = stageHeight)
  hudHeight: number;
  timerHeight: number;
  contentHeight: number;
  jokerAreaHeight: number;

  // Distribución interna del Área Central (Pregunta + Respuestas con Gaps proporcionados)
  contentQuestionHeight: number;
  contentAnswersHeight: number;
  contentGapQuestionAnswers: number;
  contentGapAnswersJokers: number;
  answersSideInset: number;
  answersGapX: number;
  answersGapY: number;

  // Dimensiones matemáticas de los comodines (5 columnas × 2 filas)
  jokerCardWidth: number;
  jokerCardHeight: number;
  jokerGap: number;
  jokerPaddingX: number;

  // Multiplicadores para tipografía e iconos escalables
  fontScale: number;
  iconScale: number;
}

const StageContext = createContext<StageDimensions | undefined>(undefined);

const TARGET_ASPECT = 9 / 16; // 0.5625

function computeStageDimensions(): StageDimensions {
  if (typeof window === "undefined") {
    // Dimensiones de contingencia para SSR / inicialización
    const defW = 450;
    const defH = 800;
    return {
      viewportWidth: 450,
      viewportHeight: 800,
      stageWidth: defW,
      stageHeight: defH,
      aspectRatio: TARGET_ASPECT,
      scale: 1,
      hudHeight: 104,
      timerHeight: 56,
      contentHeight: 440,
      jokerAreaHeight: 200,
      contentQuestionHeight: 154,
      contentAnswersHeight: 234,
      contentGapQuestionAnswers: 26,
      contentGapAnswersJokers: 26,
      answersSideInset: 22,
      answersGapX: 14,
      answersGapY: 12,
      jokerCardWidth: 80,
      jokerCardHeight: 76,
      jokerGap: 6,
      jokerPaddingX: 12,
      fontScale: 1,
      iconScale: 1,
    };
  }

  // 1. Obtener altura y ancho visibles reales del viewport
  const vv = window.visualViewport;
  const vw = vv ? vv.width : window.innerWidth;
  const vh = vv ? vv.height : window.innerHeight;

  // Márgenes de respiración sutiles en pantallas grandes (0 en móviles)
  const isSmallMobile = vw < 500 || vh < 700;
  const marginY = isSmallMobile ? 0 : 16;
  const marginX = isSmallMobile ? 0 : 16;

  const availH = Math.max(vh - marginY, 320);
  const availW = Math.max(vw - marginX, 240);

  // 2. Calcular stageHeight y stageWidth aplicando la relación estricta 9:16
  // La referencia principal es la altura disponible del viewport
  let stageHeight = availH;
  let stageWidth = stageHeight * TARGET_ASPECT;

  // Si el ancho calculado excede el ancho disponible de la pantalla, acotar por ancho
  if (stageWidth > availW) {
    stageWidth = availW;
    stageHeight = stageWidth / TARGET_ASPECT;
  }

  stageWidth = Math.floor(stageWidth);
  stageHeight = Math.floor(stageHeight);

  // Factor de escala normalizado respecto a base estándar de 800px
  const scale = stageHeight / 800;
  const fontScale = Math.max(scale, 0.65);
  const iconScale = Math.max(scale, 0.65);

  // 3. Distribución vertical funcional proporcional (Suma total = stageHeight)
  // HUD: ~13% de stageHeight
  const hudHeight = Math.floor(stageHeight * 0.13);
  // Timer: ~7% de stageHeight
  const timerHeight = Math.floor(stageHeight * 0.07);
  // Zona de comodines: ~25% de stageHeight (anclada al fondo, 10 espacios: 5×2)
  const jokerAreaHeight = Math.floor(stageHeight * 0.25);
  // Contenido central flexible (Pregunta + Gaps + Respuestas): espacio restante exacto (~55%)
  const contentHeight = stageHeight - hudHeight - timerHeight - jokerAreaHeight;

  // 4. Sub-distribución matemática del Área Central:
  // - Gap visual claro entre Pregunta y Respuestas: ~6% de contentHeight
  // - Gap visual claro entre Respuestas y Comodines: ~6% de contentHeight
  const contentGapQuestionAnswers = Math.max(Math.floor(contentHeight * 0.065), 14);
  const contentGapAnswersJokers = Math.max(Math.floor(contentHeight * 0.065), 14);

  // Espacio restante para la tarjeta de pregunta y cuadrícula de respuestas
  const availableForCards = contentHeight - contentGapQuestionAnswers - contentGapAnswersJokers;
  const contentQuestionHeight = Math.floor(availableForCards * 0.38);
  const contentAnswersHeight = availableForCards - contentQuestionHeight;

  // Insets laterales y gaps de la cuadrícula de respuestas (2x2)
  // Inset horizontal: ~5% de stageWidth a cada lado para evitar tocar los bordes
  const answersSideInset = Math.max(Math.floor(stageWidth * 0.05), 12);
  const answersGapX = Math.max(Math.floor(stageWidth * 0.03), 8);
  const answersGapY = Math.max(Math.floor(contentAnswersHeight * 0.05), 8);

  // 5. Cálculo matemático para las 5 columnas × 2 filas de comodines
  const jokerPaddingX = Math.floor(stageWidth * 0.025);
  const jokerGap = Math.max(Math.floor(stageWidth * 0.015), 4);
  const availableJokerWidth = stageWidth - jokerPaddingX * 2;
  const jokerCardWidth = Math.floor((availableJokerWidth - 4 * jokerGap) / 5);

  const jokerHeaderHeight = Math.floor(stageHeight * 0.03);
  const availableJokerHeight = jokerAreaHeight - jokerHeaderHeight - jokerPaddingX * 2;
  const jokerCardHeight = Math.floor((availableJokerHeight - jokerGap) / 2);

  return {
    viewportWidth: vw,
    viewportHeight: vh,
    stageWidth,
    stageHeight,
    aspectRatio: TARGET_ASPECT,
    scale,
    hudHeight,
    timerHeight,
    contentHeight,
    jokerAreaHeight,
    contentQuestionHeight,
    contentAnswersHeight,
    contentGapQuestionAnswers,
    contentGapAnswersJokers,
    answersSideInset,
    answersGapX,
    answersGapY,
    jokerCardWidth,
    jokerCardHeight,
    jokerGap,
    jokerPaddingX,
    fontScale,
    iconScale,
  };
}

export const StageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dims, setDims] = useState<StageDimensions>(computeStageDimensions);

  useEffect(() => {
    let animFrameId: number;

    const handleResize = () => {
      cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(() => {
        setDims(computeStageDimensions());
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize, { passive: true });
    }

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return <StageContext.Provider value={dims}>{children}</StageContext.Provider>;
};

export function useStageDimensions(): StageDimensions {
  const context = useContext(StageContext);
  if (!context) {
    throw new Error("useStageDimensions debe ser utilizado dentro de StageProvider");
  }
  return context;
}
