import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { useStageDimensions } from "../context/StageContext";
import { UserCheck, AlertCircle, ArrowLeft } from "lucide-react";

export const NameEntryModal: React.FC = () => {
  const { submitPlayerNameAndBegin, setPhase, playerName: existingName } = useGame();
  const { stageWidth, fontScale } = useStageDimensions();
  const [inputName, setInputName] = useState<string>(existingName || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isNameEmpty = inputName.trim().length === 0;
  const modalWidth = Math.min(Math.round(stageWidth * 0.92), 420);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNameEmpty) {
      setErrorMessage("¡Debes ingresar tu nombre para comenzar la partida!");
      return;
    }

    setErrorMessage(null);
    const success = submitPlayerNameAndBegin(inputName);
    if (!success) {
      setErrorMessage("El nombre ingresado no es válido.");
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 select-none animate-in fade-in duration-200">
      <div
        style={{ width: `${modalWidth}px` }}
        className="max-h-[92%] overflow-y-auto bg-gradient-to-b from-[#10234e] via-[#0b1a3c] to-[#07122a] border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(245,186,19,0.35)] text-slate-100 relative my-auto"
      >
        {/* Encabezado */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500/10 border-2 border-amber-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
            <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
          </div>
          <h2
            style={{ fontSize: `${Math.max(20 * fontScale, 17)}px` }}
            className="font-black text-amber-400 tracking-wide uppercase drop-shadow"
          >
            ESCRIBE TU NOMBRE
          </h2>
          <p
            style={{ fontSize: `${Math.max(11 * fontScale, 9.5)}px` }}
            className="text-slate-300 mt-1 leading-snug"
          >
            El nombre es obligatorio para registrar tu récord en el Ranking
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase mb-1">
              Nombre de Jugador <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              maxLength={20}
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Escribe tu nombre aquí..."
              autoFocus
              className="w-full px-4 py-2.5 sm:py-3 bg-blue-950/90 border-2 border-blue-500 rounded-xl text-base sm:text-lg font-black text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all text-center"
            />
          </div>

          {/* Mensaje de error */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 bg-red-500/15 border border-red-500/60 rounded-xl text-red-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Botones */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isNameEmpty}
              style={{ fontSize: `${Math.max(14 * fontScale, 12.5)}px` }}
              className={`w-full py-3 sm:py-3.5 px-4 rounded-xl font-black tracking-wider uppercase shadow-lg transition-all ${
                isNameEmpty
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-60"
                  : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 active:scale-95 cursor-pointer shadow-amber-500/30"
              }`}
            >
              COMENZAR PARTIDA
            </button>

            <button
              type="button"
              onClick={() => setPhase("MENU")}
              style={{ fontSize: `${Math.max(11 * fontScale, 9.5)}px` }}
              className="w-full py-2 px-3 rounded-xl bg-blue-900/60 hover:bg-blue-900 text-slate-300 hover:text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Menú</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
