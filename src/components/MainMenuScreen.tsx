import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { useStageDimensions } from "../context/StageContext";
import { OFFICIAL_SPRITES } from "../config/assetManager";
import { ContactModal } from "./ContactModal";
import { Top50Modal } from "./Top50Modal";
import { HowToPlayModal } from "./HowToPlayModal";
import { Volume2, VolumeX, Mail, Trophy, HelpCircle, Play, Award } from "lucide-react";

export const MainMenuScreen: React.FC = () => {
  const { startNewGameSession, score } = useGame();
  const { stageWidth, stageHeight, fontScale, iconScale } = useStageDimensions();
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showContact, setShowContact] = useState<boolean>(false);
  const [showTop50, setShowTop50] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showRecordAlert, setShowRecordAlert] = useState<boolean>(false);

  const btnWidth = Math.min(Math.round(stageWidth * 0.82), 360);

  return (
    <div
      style={{ width: `${stageWidth}px`, height: `${stageHeight}px` }}
      className="relative overflow-hidden text-white font-sans flex flex-col justify-between p-3 sm:p-4"
    >
      {/* ----------------------------------------------------------------- */}
      {/* BARRA SUPERIOR (Contacto y Sonido) */}
      {/* ----------------------------------------------------------------- */}
      <div className="w-full flex items-center justify-between z-10 shrink-0">
        <button
          onClick={() => setShowContact(true)}
          style={{ fontSize: `${Math.max(11 * fontScale, 10)}px` }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-950/90 border-2 border-amber-500/80 text-amber-300 font-extrabold uppercase tracking-wider hover:bg-slate-900 active:scale-95 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
        >
          <Mail size={Math.round(16 * iconScale)} className="text-amber-400" />
          <span>Contacto</span>
        </button>

        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            width: `${Math.round(40 * iconScale)}px`,
            height: `${Math.round(40 * iconScale)}px`,
          }}
          className="flex items-center justify-center rounded-2xl bg-slate-950/90 border-2 border-amber-500/80 text-amber-300 hover:bg-slate-900 active:scale-95 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
          title={isMuted ? "Activar Sonido" : "Silenciar"}
        >
          {isMuted ? (
            <VolumeX size={Math.round(18 * iconScale)} className="text-red-400" />
          ) : (
            <Volume2 size={Math.round(18 * iconScale)} className="text-amber-400" />
          )}
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* LOGO OFICIAL */}
      {/* ----------------------------------------------------------------- */}
      <div
        style={{
          width: `${Math.min(Math.round(stageWidth * 0.85), 380)}px`,
          height: `${Math.floor(stageHeight * 0.28)}px`,
        }}
        className="mx-auto flex items-center justify-center pointer-events-none z-10 my-auto shrink-0"
      >
        <img
          src={OFFICIAL_SPRITES.logo.spritePath}
          alt="Logo Oficial ¿SABELOTODO?"
          className="max-w-full max-h-full object-contain filter drop-shadow-[0_12px_25px_rgba(0,0,0,0.8)]"
        />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* BOTONERA PRINCIPAL */}
      {/* ----------------------------------------------------------------- */}
      <div
        style={{ width: `${btnWidth}px` }}
        className="mx-auto flex flex-col gap-2 z-10 mb-1 shrink-0"
      >
        {/* BOTÓN 1: JUGAR - BOTÓN PRINCIPAL */}
        <button
          onClick={startNewGameSession}
          style={{
            fontSize: `${Math.max(22 * fontScale, 18)}px`,
            paddingTop: `${Math.max(12 * fontScale, 8)}px`,
            paddingBottom: `${Math.max(12 * fontScale, 8)}px`,
          }}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black uppercase tracking-widest border-2 border-yellow-300 shadow-[0_8px_25px_rgba(245,186,19,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Play size={Math.round(24 * iconScale)} className="fill-slate-950 text-slate-950" />
          <span>JUGAR</span>
        </button>

        {/* BOTÓN 2: TOP 50 JUGADORES */}
        <button
          onClick={() => setShowTop50(true)}
          style={{
            fontSize: `${Math.max(14 * fontScale, 12)}px`,
            paddingTop: `${Math.max(9 * fontScale, 6)}px`,
            paddingBottom: `${Math.max(9 * fontScale, 6)}px`,
          }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#173379] via-[#1f4299] to-[#152e6d] border-2 border-amber-400 text-amber-300 font-extrabold uppercase tracking-wider hover:border-yellow-300 hover:brightness-110 active:scale-95 shadow-[0_6px_20px_rgba(0,0,0,0.6)] transition-all cursor-pointer"
        >
          <Trophy size={Math.round(18 * iconScale)} className="text-amber-300" />
          <span className="drop-shadow">TOP 50 JUGADORES</span>
        </button>

        {/* BOTÓN 3: CÓMO JUGAR */}
        <button
          onClick={() => setShowHowToPlay(true)}
          style={{
            fontSize: `${Math.max(14 * fontScale, 12)}px`,
            paddingTop: `${Math.max(9 * fontScale, 6)}px`,
            paddingBottom: `${Math.max(9 * fontScale, 6)}px`,
          }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#173379] via-[#1f4299] to-[#152e6d] border-2 border-amber-400 text-amber-300 font-extrabold uppercase tracking-wider hover:border-yellow-300 hover:brightness-110 active:scale-95 shadow-[0_6px_20px_rgba(0,0,0,0.6)] transition-all cursor-pointer"
        >
          <HelpCircle size={Math.round(18 * iconScale)} className="text-amber-300" />
          <span className="drop-shadow">CÓMO JUGAR</span>
        </button>

        {/* BOTÓN 4: MI RÉCORD PERSONAL */}
        <button
          onClick={() => setShowRecordAlert(true)}
          style={{
            fontSize: `${Math.max(14 * fontScale, 12)}px`,
            paddingTop: `${Math.max(9 * fontScale, 6)}px`,
            paddingBottom: `${Math.max(9 * fontScale, 6)}px`,
          }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#173379] via-[#1f4299] to-[#152e6d] border-2 border-amber-400 text-amber-300 font-extrabold uppercase tracking-wider hover:border-yellow-300 hover:brightness-110 active:scale-95 shadow-[0_6px_20px_rgba(0,0,0,0.6)] transition-all cursor-pointer"
        >
          <Award size={Math.round(18 * iconScale)} className="text-amber-300" />
          <span className="drop-shadow">MI RÉCORD PERSONAL</span>
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* PIE DEL MENÚ */}
      {/* ----------------------------------------------------------------- */}
      <div
        style={{ fontSize: `${Math.max(10 * fontScale, 8)}px` }}
        className="w-full text-center font-bold text-slate-300 drop-shadow tracking-wider uppercase pointer-events-none pb-0.5 shrink-0"
      >
        ¿SABELOTODO? v2.3.0 • Edición Oficial
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
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95">
          <div className="w-[380px] bg-blue-950 border-2 border-amber-500 rounded-3xl p-6 text-center text-white shadow-2xl">
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
