import React from "react";
import { useGame } from "../context/GameContext";
import { OFFICIAL_SPRITES } from "../config/assetManager";
import { Image as ImageIcon, ArrowLeft, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export const AssetManager: React.FC = () => {
  const { setPhase } = useGame();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
      <div className="w-full max-w-md sm:max-w-lg bg-blue-950 border-2 border-amber-500 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black text-white uppercase tracking-wide">
              GESTOR DE ASSETS Y SPRITES
            </h2>
          </div>

          <button
            onClick={() => setPhase("MENU")}
            className="p-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-slate-300 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Sprites */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          <div className="p-3 bg-blue-900/60 border border-blue-800 rounded-xl text-xs text-slate-300">
            Estructura conceptual: Asset Manager → /public/sprites/ → Sprite correspondiente. Únicamente se utilizan assets oficiales entregados por el usuario.
          </div>

          {Object.values(OFFICIAL_SPRITES).map((asset) => (
            <div
              key={asset.id}
              className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                asset.isProvided
                  ? "bg-blue-900/80 border-emerald-500/50"
                  : "bg-blue-950/60 border-amber-500/50"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">{asset.name}</span>
                  {asset.isProvided ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> OFICIAL CARGADO
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> PENDIENTE ENTREGAR
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">{asset.description}</p>
                {asset.spritePath && (
                  <p className="text-[10px] font-mono text-amber-300/80">
                    Ruta: <span className="text-slate-200">{asset.spritePath}</span>
                  </p>
                )}
              </div>

              {asset.isProvided && asset.spritePath && (
                <div className="w-14 h-14 bg-slate-950 border border-blue-700 rounded-xl overflow-hidden flex items-center justify-center p-1 flex-shrink-0">
                  <img src={asset.spritePath} alt={asset.name} className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          ))}

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2 mt-4">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <span>
              Las referencias para el Sprite del Peinecito y el Fondo Oficial están preparadas en /public/sprites/ para ser reemplazadas sin alterar la lógica.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-blue-900 mt-3 text-center">
          <button
            onClick={() => setPhase("MENU")}
            className="w-full py-3 px-4 bg-blue-900 hover:bg-blue-800 border border-blue-600 rounded-xl font-bold text-xs text-slate-200 transition-all uppercase"
          >
            VOLVER AL MENÚ
          </button>
        </div>
      </div>
    </div>
  );
};
