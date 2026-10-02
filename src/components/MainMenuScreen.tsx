import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { OFFICIAL_SPRITES } from "../config/assetManager";
import { ContactModal } from "./ContactModal";
import { Top50Modal } from "./Top50Modal";
import { HowToPlayModal } from "./HowToPlayModal";
import { Volume2, VolumeX, Mail, Trophy, HelpCircle, Play, Award } from "lucide-react";

export const MainMenuScreen: React.FC = () => {
  const { startNewGameSession, score } = useGame();
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showContact, setShowContact] = useState<boolean>(false);
  const [showTop50, setShowTop50] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showRecordAlert, setShowRecordAlert] = useState<boolean>(false);

  return (
    <div className="relative w-[480px] h-[800px] overflow-hidden text-white font-sans">
      {/* ----------------------------------------------------------------- */}
      {/* BARRA SUPERIOR (Y = 20 - 80) */}
      {/* ----------------------------------------------------------------- */}

      {/* Botón CONTACTO */}
      <button
        onClick={() => setShowContact(true)}
        style={{ left: "38px", top: "25px", width: "140px", height: "42px" }}
        className="absolute z-10 flex items-center justify-center gap-2 rounded-2xl bg-slate-950/70 backdrop-blur-md border-2 border-amber-500/80 text-amber-300 font-extrabold text-xs uppercase tracking-wider hover:bg-slate-900/80 active:scale-95 shadow-lg shadow-amber-500/10 transition-all"
      >
        <Mail className="w-4 h-4 text-amber-400" />
        <span>Contacto</span>
      </button>

      {/* Botón SONIDO */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        style={{ left: "390px", top: "22px", width: "48px", height: "48px" }}
        className="absolute z-10 flex items-center justify-center rounded-2xl bg-slate-950/70 backdrop-blur-md border-2 border-amber-500/80 text-amber-300 hover:bg-slate-900/80 active:scale-95 shadow-lg shadow-amber-500/10 transition-all"
        title={isMuted ? "Activar Sonido" : "Silenciar"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-red-400" />
        ) : (
          <Volume2 className="w-5 h-5 text-amber-400" />
        )}
      </button>

      {/* ----------------------------------------------------------------- */}
      {/* LOGO OFICIAL (Zona reservada: X = 50, Y = 90, MAX W = 380px, MAX H = 230px) */}
      {/* ----------------------------------------------------------------- */}
      <div
        style={{
          left: "50px",
          top: "85px",
          width: "380px",
          height: "230px",
        }}
        className="absolute z-10 flex items-center justify-center pointer-events-none"
      >
        <img
          src={OFFICIAL_SPRITES.logo.spritePath}
          alt="Logo Oficial ¿SABELOTODO?"
          className="max-w-full max-h-full object-contain filter drop-shadow-[0_12px_25px_rgba(0,0,0,0.8)]"
        />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* BOTONERA PRINCIPAL CON DEGRADADO SEMITRANSPARENTE (Centro X = 240, W = 340px) */}
      {/* ----------------------------------------------------------------- */}

      {/* BOTÓN 1: JUGAR (Y ≈ 375, W = 340px, H = 72px) - BOTÓN PRINCIPAL */}
      <button
        onClick={startNewGameSession}
        style={{ left: "70px", top: "375px", width: "340px", height: "72px" }}
        className="absolute z-10 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500/90 via-amber-400/85 to-yellow-500/90 backdrop-blur-md text-slate-950 font-black text-2xl uppercase tracking-widest border-2 border-yellow-300/90 shadow-[0_8px_25px_rgba(245,186,19,0.4)] hover:brightness-110 active:scale-95 transition-all"
      >
        <Play className="w-8 h-8 fill-slate-950 text-slate-950" />
        <span>JUGAR</span>
      </button>

      {/* BOTÓN 2: TOP 50 JUGADORES (Y ≈ 462px, W = 340px, H = 54px) */}
      <button
        onClick={() => setShowTop50(true)}
        style={{ left: "70px", top: "462px", width: "340px", height: "54px" }}
        className="absolute z-10 flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-blue-900/75 to-blue-950/80 backdrop-blur-md border-2 border-amber-500/80 text-amber-300 font-extrabold text-base uppercase tracking-wider hover:border-amber-400 active:scale-95 shadow-lg shadow-black/40 transition-all"
      >
        <Trophy className="w-5 h-5 text-amber-400" />
        <span>TOP 50 JUGADORES</span>
      </button>

      {/* BOTÓN 3: CÓMO JUGAR (Y ≈ 528px, W = 340px, H = 54px) */}
      <button
        onClick={() => setShowHowToPlay(true)}
        style={{ left: "70px", top: "528px", width: "340px", height: "54px" }}
        className="absolute z-10 flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-blue-900/75 to-blue-950/80 backdrop-blur-md border-2 border-amber-500/80 text-amber-300 font-extrabold text-base uppercase tracking-wider hover:border-amber-400 active:scale-95 shadow-lg shadow-black/40 transition-all"
      >
        <HelpCircle className="w-5 h-5 text-amber-400" />
        <span>CÓMO JUGAR</span>
      </button>

      {/* BOTÓN 4: MI RÉCORD PERSONAL (Y ≈ 594px, W = 340px, H = 54px) */}
      <button
        onClick={() => setShowRecordAlert(true)}
        style={{ left: "70px", top: "594px", width: "340px", height: "54px" }}
        className="absolute z-10 flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-blue-900/75 to-blue-950/80 backdrop-blur-md border-2 border-amber-500/80 text-amber-300 font-extrabold text-base uppercase tracking-wider hover:border-amber-400 active:scale-95 shadow-lg shadow-black/40 transition-all"
      >
        <Award className="w-5 h-5 text-amber-400" />
        <span>MI RÉCORD PERSONAL</span>
      </button>

      {/* ----------------------------------------------------------------- */}
      {/* PIE DEL MENÚ (Y ≈ 760 - 785) */}
      {/* ----------------------------------------------------------------- */}
      <div
        style={{ left: "0px", top: "760px", width: "480px" }}
        className="absolute text-center text-[11px] font-bold text-slate-300 drop-shadow tracking-wider uppercase pointer-events-none"
      >
        ¿SABELOTODO? v1.0.0 • Edición Oficial
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MODALES ESPECÍFICOS */}
      {/* ----------------------------------------------------------------- */}

      {/* Modal CONTACTO */}
      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />

      {/* Modal TOP 50 */}
      <Top50Modal
        isOpen={showTop50}
        onClose={() => setShowTop50(false)}
      />

      {/* Modal CÓMO JUGAR */}
      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      {/* Alerta de Record Personal */}
      {showRecordAlert && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-[380px] bg-blue-950/90 backdrop-blur-md border-2 border-amber-500 rounded-3xl p-6 text-center text-white shadow-2xl">
            <Award className="w-12 h-12 text-amber-400 mx-auto mb-2" />
            <h3 className="text-xl font-black uppercase text-amber-300 mb-1">
              Tu Récord Personal
            </h3>
            <p className="text-3xl font-black text-white my-3">
              {score} PUNTOS
            </p>
            <button
              onClick={() => setShowRecordAlert(false)}
              className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
