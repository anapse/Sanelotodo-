import React from "react";
import { LifelineDef, RARITY_CONFIG } from "../types/lifeline";
import { SpriteIcon } from "./SpriteIcon";
import { useStageDimensions } from "../context/StageContext";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface LifelineActivationModalProps {
  lifeline: LifelineDef;
  onConfirm: () => void;
  onCancel?: () => void;
  isActivating?: boolean;
}

export const LifelineActivationModal: React.FC<LifelineActivationModalProps> = ({
  lifeline,
  onConfirm,
  onCancel,
  isActivating = false,
}) => {
  const { stageWidth, fontScale, iconScale } = useStageDimensions();
  const rarityInfo = RARITY_CONFIG[lifeline.rarity];
  const modalWidth = Math.min(Math.round(stageWidth * 0.88), 380);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div
        style={{ width: `${modalWidth}px`, boxShadow: `0 0 40px ${rarityInfo.glowColor}` }}
        className="bg-gradient-to-b from-[#10234e] via-[#0c1a3b] to-[#071126] border-2 border-amber-400 rounded-3xl p-5 sm:p-6 text-center relative overflow-hidden flex flex-col items-center justify-between"
      >
        {/* Badge de Rareza */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-widest mb-3 shadow-md"
          style={{
            backgroundColor: rarityInfo.badgeBg,
            borderColor: rarityInfo.badgeBorder,
            color: rarityInfo.badgeText,
          }}
        >
          <Sparkles size={Math.round(12 * iconScale)} />
          <span>COMODÍN {rarityInfo.label}</span>
        </div>

        {/* Icono Grande */}
        <div className="relative my-2 p-3 bg-blue-950/80 border-2 border-amber-400/60 rounded-2xl shadow-inner flex items-center justify-center">
          <SpriteIcon name={lifeline.icon} size={Math.round(52 * iconScale)} className="drop-shadow-lg" />
        </div>

        {/* Nombre del Comodín */}
        <h3
          style={{ fontSize: `${Math.max(18 * fontScale, 15)}px` }}
          className="font-black text-white uppercase tracking-wide mt-1 drop-shadow"
        >
          {lifeline.name}
        </h3>

        {/* Descripción del Efecto */}
        <div className="my-3 px-3 py-2.5 bg-slate-950/60 border border-slate-700/60 rounded-xl w-full">
          <p
            style={{ fontSize: `${Math.max(12 * fontScale, 10.5)}px` }}
            className="text-slate-200 leading-relaxed font-medium"
          >
            {lifeline.description}
          </p>
        </div>

        {/* Mensaje de Consejo / Cuándo usar */}
        <div className="text-[10px] sm:text-[11px] text-amber-300/90 font-bold mb-4 flex items-center gap-1">
          <span>💡 Consejo: {lifeline.whenToUse}</span>
        </div>

        {/* Botón de Confirmación / Activación */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onConfirm}
            disabled={isActivating}
            style={{ fontSize: `${Math.max(13 * fontScale, 11)}px` }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black tracking-wider uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={16} />
            <span>{isActivating ? "ACTIVANDO..." : "¡USAR COMODÍN!"}</span>
          </button>

          {onCancel && !isActivating && (
            <button
              onClick={onCancel}
              style={{ fontSize: `${Math.max(11 * fontScale, 9.5)}px` }}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold tracking-wider uppercase transition-all cursor-pointer"
            >
              Cancelar y Volver
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
