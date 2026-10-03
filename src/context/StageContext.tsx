import React, { createContext, useContext, useState, useEffect, useRef } from "react";

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

  // Distribución interna del Área Central
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

function computeStageDimensions(customVw?: number, customVh?: number): StageDimensions {
  if (typeof window === "undefined") {
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

  // 1. Obtener altura y ancho visibles del viewport
  const vv = window.visualViewport;
  const vw = customVw ?? (vv ? vv.width : window.innerWidth);
  const vh = customVh ?? (vv ? vv.height : window.innerHeight);

  // Márgenes de respiración sutiles en pantallas grandes (0 en móviles)
  const isSmallMobile = vw < 500 || vh < 700;
  const marginY = isSmallMobile ? 0 : 16;
  const marginX = isSmallMobile ? 0 : 16;

  const availH = Math.max(vh - marginY, 320);
  const availW = Math.max(vw - marginX, 240);

  // 2. Calcular stageHeight y stageWidth aplicando la relación estricta 9:16
  let stageHeight = availH;
  let stageWidth = stageHeight * TARGET_ASPECT;

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

  // 3. Distribución vertical funcional proporcional
  const hudHeight = Math.floor(stageHeight * 0.13);
  const timerHeight = Math.floor(stageHeight * 0.07);
  const jokerAreaHeight = Math.floor(stageHeight * 0.25);
  const contentHeight = stageHeight - hudHeight - timerHeight - jokerAreaHeight;

  // 4. Sub-distribución matemática del Área Central
  const contentGapQuestionAnswers = Math.max(Math.floor(contentHeight * 0.065), 14);
  const contentGapAnswersJokers = Math.max(Math.floor(contentHeight * 0.065), 14);

  const availableForCards = contentHeight - contentGapQuestionAnswers - contentGapAnswersJokers;
  const contentQuestionHeight = Math.floor(availableForCards * 0.38);
  const contentAnswersHeight = availableForCards - contentQuestionHeight;

  const answersSideInset = Math.max(Math.floor(stageWidth * 0.05), 12);
  const answersGapX = Math.max(Math.floor(stageWidth * 0.03), 8);
  const answersGapY = Math.max(Math.floor(contentAnswersHeight * 0.05), 8);

  // 5. Cálculo para las 5 columnas × 2 filas de comodines
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
  // Guardar las dimensiones base del viewport antes de que se abra ningún teclado virtual
  const baseViewportRef = useRef<{ width: number; height: number }>({
    width: typeof window !== "undefined" ? window.innerWidth : 450,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  const [dims, setDims] = useState<StageDimensions>(() => computeStageDimensions());

  useEffect(() => {
    let animFrameId: number;

    const getIsInputFocused = (): boolean => {
      if (typeof document === "undefined") return false;
      const activeEl = document.activeElement;
      if (!activeEl) return false;
      const tag = activeEl.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || (activeEl as HTMLElement).isContentEditable;
    };

    const updateDimensions = (forceReset = false) => {
      if (typeof window === "undefined") return;

      const vv = window.visualViewport;
      const rawVw = vv ? vv.width : window.innerWidth;
      const rawVh = vv ? vv.height : window.innerHeight;

      const activeBase = baseViewportRef.current;
      const isInputFocused = getIsInputFocused();

      // Detección precisa de teclado virtual en dispositivos móviles:
      // Se detecta si hay un campo de texto enfocado O si el ancho permanece prácticamente idéntico (<25px) y la altura cae drásticamente (>100px o <82% de la base)
      const widthIsSame = Math.abs(rawVw - activeBase.width) < 25;
      const heightDroppedSignificantly = rawVh < activeBase.height * 0.82 || (activeBase.height - rawVh) > 100;
      const isVirtualKeyboardOpen = isInputFocused || (widthIsSame && heightDroppedSignificantly);

      if (isVirtualKeyboardOpen && !forceReset) {
        // MANTENER DIMENSIONES BASE DEL ESCENARIO SIN COMPRIMIR NI REDUCIR EL TAMAÑO
        return;
      }

      // Si es un cambio real de pantalla o rotación de orientación sin teclado abierto:
      baseViewportRef.current = { width: rawVw, height: rawVh };
      setDims(computeStageDimensions(rawVw, rawVh));
    };

    const handleResize = () => {
      cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(() => {
        updateDimensions(false);
      });
    };

    const handleOrientationChange = () => {
      cancelAnimationFrame(animFrameId);
      setTimeout(() => {
        updateDimensions(true);
      }, 150);
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        setTimeout(() => {
          updateDimensions(true);
        }, 150);
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleOrientationChange, { passive: true });
    document.addEventListener("focusout", handleFocusOut, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize, { passive: true });
    }

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      document.removeEventListener("focusout", handleFocusOut);
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
