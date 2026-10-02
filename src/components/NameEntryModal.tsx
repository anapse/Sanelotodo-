import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { UserCheck, AlertCircle, ArrowLeft } from "lucide-react";

export const NameEntryModal: React.FC = () => {
  const { submitPlayerNameAndBegin, setPhase, playerName: existingName } = useGame();
  const [inputName, setInputName] = useState<string>(existingName || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isNameEmpty = inputName.trim().length === 0;

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
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 select-none">
      <div className="w-[380px] max-w-full bg-blue-950 border-2 border-amber-500 rounded-3xl p-6 shadow-[0_0_40px_rgba(245,186,19,0.3)] text-slate-100 relative">
        {/* Encabezado */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-amber-500/10 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto mb-2.5 shadow-inner">
            <UserCheck className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-amber-400 tracking-wide uppercase">
            ESCRIBE TU NOMBRE
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            El nombre es obligatorio para registrar tu récord en el Ranking
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
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
              className="w-full px-4 py-3 bg-blue-900/90 border-2 border-blue-600 rounded-xl text-lg font-black text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all text-center"
            />
          </div>

          {/* Mensaje de error */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Botones */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isNameEmpty}
              className={`w-full py-3.5 px-6 rounded-xl font-black text-lg tracking-wider uppercase shadow-lg transition-all ${
                isNameEmpty
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-60"
                  : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 active:scale-95 cursor-pointer shadow-amber-500/30"
              }`}
            >
              COMENZAR
            </button>

            <button
              type="button"
              onClick={() => setPhase("MENU")}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-900/60 hover:bg-blue-900 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
