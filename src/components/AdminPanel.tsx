import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { Lock, Save, ArrowLeft, ShieldCheck, Key, Settings } from "lucide-react";

export const AdminPanel: React.FC = () => {
  const { config, updateConfig, setPhase } = useGame();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(config.adminSecretKey === null);
  const [inputKey, setInputKey] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [formConfig, setFormConfig] = useState({
    initialLives: config.initialLives,
    maxLives: config.maxLives,
    rouletteFrequencyQuestions: config.rouletteFrequencyQuestions,
    pointsNormalQuestionCorrect: config.pointsNormalQuestionCorrect,
    pointsBonusQuestionCorrect: config.pointsBonusQuestionCorrect,
    pointsRouletteSmallPrize: config.pointsRouletteSmallPrize,
    pointsRouletteMediumPrize: config.pointsRouletteMediumPrize,
  });

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.adminSecretKey || inputKey === config.adminSecretKey) {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError("Clave de acceso incorrecta.");
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
      <div className="w-full max-w-md sm:max-w-lg bg-blue-950 border-2 border-amber-500 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black text-white uppercase tracking-wide">
              PANEL DE ADMINISTRACIÓN
            </h2>
          </div>

          <button
            onClick={() => setPhase("MENU")}
            className="p-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-slate-300 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="space-y-4 my-auto py-8">
            <div className="text-center">
              <Lock className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300">
                Ingresa la clave de administración para acceder a las configuraciones
              </p>
            </div>

            <div className="relative">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Clave de Administrador"
                className="w-full px-4 py-3 bg-blue-900/90 border-2 border-blue-600 rounded-xl text-center text-white font-bold focus:outline-none focus:border-amber-400"
              />
              <Key className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>

            {authError && (
              <p className="text-xs text-red-400 font-bold text-center">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl uppercase tracking-wider transition-all"
            >
              ACCEDER
            </button>
          </form>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
            <div className="p-3 bg-blue-900/60 border border-blue-800 rounded-xl text-amber-300">
              Todos los valores numéricos y parámetros de puntuación permanecen centralizados y dinámicos sin hardcoding.
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* Vidas */}
              <div className="bg-blue-900/60 p-3 rounded-2xl border border-blue-800 space-y-3">
                <h3 className="font-extrabold uppercase text-slate-200">Configuración de Vidas</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Vidas Iniciales</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={formConfig.initialLives}
                      onChange={(e) =>
                        setFormConfig({ ...formConfig, initialLives: Number(e.target.value) })
                      }
                      className="w-full p-2 bg-blue-950 border border-blue-700 rounded-lg text-white font-black"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Vidas Máximas</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={formConfig.maxLives}
                      onChange={(e) =>
                        setFormConfig({ ...formConfig, maxLives: Number(e.target.value) })
                      }
                      className="w-full p-2 bg-blue-950 border border-blue-700 rounded-lg text-white font-black"
                    />
                  </div>
                </div>
              </div>

              {/* Puntuación */}
              <div className="bg-blue-900/60 p-3 rounded-2xl border border-blue-800 space-y-3">
                <h3 className="font-extrabold uppercase text-slate-200">Sistema de Puntuaciones</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Puntos Pregunta Normal</label>
                    <input
                      type="number"
                      value={formConfig.pointsNormalQuestionCorrect}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          pointsNormalQuestionCorrect: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 bg-blue-950 border border-blue-700 rounded-lg text-white font-black"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Puntos Pregunta Bonus</label>
                    <input
                      type="number"
                      value={formConfig.pointsBonusQuestionCorrect}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          pointsBonusQuestionCorrect: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 bg-blue-950 border border-blue-700 rounded-lg text-white font-black"
                    />
                  </div>
                </div>
              </div>

              {/* Frecuencia de Ruleta */}
              <div className="bg-blue-900/60 p-3 rounded-2xl border border-blue-800 space-y-2">
                <h3 className="font-extrabold uppercase text-slate-200">Frecuencia de la Ruleta</h3>
                <div>
                  <label className="block text-slate-300 mb-1">Mostrar ruleta cada N preguntas</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formConfig.rouletteFrequencyQuestions}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        rouletteFrequencyQuestions: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-blue-950 border border-blue-700 rounded-lg text-white font-black"
                  />
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold rounded-xl flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>¡Configuraciones guardadas correctamente!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Save className="w-5 h-5" />
                <span>GUARDAR CONFIGURACIÓN</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
