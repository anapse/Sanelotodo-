import React, { useEffect } from "react";
import { GameProvider, useGame } from "./context/GameContext";
import { StageProvider } from "./context/StageContext";
import { GameViewport } from "./components/GameViewport";
import { MainMenuScreen } from "./components/MainMenuScreen";
import { NameEntryModal } from "./components/NameEntryModal";
import { QuizCanvasView } from "./components/QuizCanvasView";
import { RouletteModal } from "./components/RouletteModal";
import { BonusRoundModal } from "./components/BonusRoundModal";
import { Top50Modal } from "./components/Top50Modal";
import { HowToPlayModal } from "./components/HowToPlayModal";
import { PauseModal } from "./components/PauseModal";
import { GameOverModal } from "./components/GameOverModal";
import { AdminPanel } from "./components/AdminPanel";
import { AssetManager } from "./components/AssetManager";

const GameApp: React.FC = () => {
  const { phase, setPhase } = useGame();

  // Detección automática de la ruta /admin en montado e historial del navegador
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAdminUrlRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (pathname.includes("/admin") || hash.includes("admin")) {
        if (phase !== "ADMIN") {
          setPhase("ADMIN");
        }
      }
    };

    // Verificar en carga/recarga inicial
    checkAdminUrlRoute();

    // Sincronizar eventos atrás/adelante del navegador
    const handlePopState = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (pathname.includes("/admin") || hash.includes("admin")) {
        setPhase("ADMIN");
      } else {
        if (phase === "ADMIN") {
          setPhase("MENU");
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [phase, setPhase]);

  return (
    <GameViewport>
      {phase === "MENU" && <MainMenuScreen />}

      {phase === "NAME_INPUT" && (
        <>
          <MainMenuScreen />
          <NameEntryModal />
        </>
      )}

      {phase === "PLAYING" && <QuizCanvasView />}

      {phase === "ROULETTE" && (
        <>
          <QuizCanvasView />
          <RouletteModal />
        </>
      )}

      {phase === "BONUS_ROUND" && <BonusRoundModal />}

      {phase === "PAUSED" && (
        <>
          <QuizCanvasView />
          <PauseModal />
        </>
      )}

      {phase === "GAME_OVER" && <GameOverModal />}

      {phase === "TOP50" && <Top50Modal />}

      {phase === "HOW_TO_PLAY" && <HowToPlayModal />}

      {phase === "ADMIN" && <AdminPanel />}

      {phase === "ASSET_MANAGER" && <AssetManager />}
    </GameViewport>
  );
};

export default function App() {
  return (
    <StageProvider>
      <GameProvider>
        <GameApp />
      </GameProvider>
    </StageProvider>
  );
}
