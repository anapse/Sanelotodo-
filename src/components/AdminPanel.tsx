import React, { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import { useStageDimensions } from "../context/StageContext";
import { Lock, Save, ArrowLeft, ShieldCheck, Key, Settings, UserCheck, LogOut, Gamepad2, AlertCircle } from "lucide-react";

export const AdminPanel: React.FC = () => {
  const { config, updateConfig, setPhase } = useGame();
  const { stageWidth, fontScale } = useStageDimensions();

  // Persistencia de sesión en sessionStorage para la ruta /admin
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("sabelotodo_admin_session") === "true";
  });

  const [adminId, setAdminId] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
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

  // Asegurar que la URL muestre /admin cuando el panel está activo
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (!path.includes("admin") && !hash.includes("admin")) {
      try {
        const adminPath = window.location.pathname.endsWith("/")
          ? `${window.location.pathname}admin`
          : `${window.location.pathname}/admin`;
        window.history.pushState({ page: "admin" }, "Panel de Administración", adminPath);
      } catch (err) {
        window.location.hash = "/admin";
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId.trim() === "anapse" && adminPassword === "16546203") {
      setIsAuthenticated(true);
      setAuthError(null);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("sabelotodo_admin_session", "true");
      }
    } else {
      setAuthError("ID o contraseña incorrectos.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminId("");
    setAdminPassword("");
    setAuthError(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("sabelotodo_admin_session");
    }
  };

  const handleReturnToGame = () => {
    if (typeof window !== "undefined") {
      try {
        const rootPath = window.location.pathname.replace(/\/admin\/?$/i, "") || "/";
        window.history.pushState({ page: "game" }, "Juego ¿Sabelotodo?", rootPath);
      } catch (err) {
        window.location.hash = "";
      }
    }
    setPhase("MENU");
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const modalWidth = Math.min(Math.round(stageWidth * 0.92), 440);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 select-none animate-in fade-in duration-200">
      <div
        style={{ width: `${modalWidth}px` }}
        className="max-h-[92%] bg-gradient-to-b from-[#10234e] via-[#0b1a3c] to-[#07122a] border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(245,186,19,0.35)] text-slate-100 relative my-auto flex flex-col justify-between overflow-hidden"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-blue-900/80 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            <h2
              style={{ fontSize: `${Math.max(17 * fontScale, 14)}px` }}
              className="font-black text-white uppercase tracking-wide drop-shadow"
            >
              ADMINISTRACIÓN
            </h2>
          </div>

          <button
            onClick={handleReturnToGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-amber-300 hover:text-white font-bold text-xs transition-all border border-blue-700/60 cursor-pointer"
            title="Volver al Juego Principal"
          >
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>Volver al Juego</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PANTALLA DE AUTENTICACIÓN                                     */}
        {/* ------------------------------------------------------------- */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="space-y-4 my-auto py-4">
            <div className="text-center mb-2">
              <div className="w-12 h-12 bg-amber-500/10 border-2 border-amber-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <h3
                style={{ fontSize: `${Math.max(16 * fontScale, 14)}px` }}
                className="font-black text-amber-400 uppercase tracking-wide"
              >
                ACCESO RESTRINGIDO
              </h3>
              <p
                style={{ fontSize: `${Math.max(11 * fontScale, 9.5)}px` }}
                className="text-slate-300 mt-1 leading-snug"
              >
                Ingresa tu ID y Contraseña de administrador para acceder
              </p>
            </div>

            {/* Campo ID */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase">
                ID de Administrador
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => {
                    setAdminId(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Escribe tu ID..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-blue-950/90 border-2 border-blue-600 rounded-xl text-white font-bold focus:outline-none focus:border-amber-400 text-sm"
                />
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-blue-950/90 border-2 border-blue-600 rounded-xl text-white font-bold focus:outline-none focus:border-amber-400 text-sm"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Error de autenticación */}
            {authError && (
              <div className="flex items-center gap-2 p-2.5 bg-red-500/15 border border-red-500/60 rounded-xl text-red-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              style={{ fontSize: `${Math.max(14 * fontScale, 12)}px` }}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black rounded-xl uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer mt-2"
            >
              ACCEDER
            </button>
          </form>
        ) : (
          /* ------------------------------------------------------------- */
          /* PANEL DE CONFIGURACIÓN DE ADMINISTRADOR                        */
          /* ------------------------------------------------------------- */
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-blue-900/60 border border-blue-800 rounded-xl text-amber-300 font-medium">
              <span>Sesión activa de administrador</span>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Cerrar Sesión de Administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
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
                  <label className="block text-slate-300 mb-1">Mostrar ruleta cada N aciertos</label>
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
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>¡Configuraciones guardadas correctamente!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>GUARDAR CONFIGURACIÓN</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
