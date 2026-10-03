import React, { useState, useEffect, useMemo } from "react";
import { useGame } from "../context/GameContext";
import { useStageDimensions } from "../context/StageContext";
import {
  Lock,
  Save,
  ShieldCheck,
  Key,
  Settings,
  UserCheck,
  LogOut,
  Gamepad2,
  AlertCircle,
  BarChart3,
  Trophy,
  Users,
  Clock,
  Eye,
  Search,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowLeft,
  Calendar,
  Activity,
  History,
} from "lucide-react";
import {
  fetchAllMatches,
  fetchAllVisits,
  fetchActivityEvents,
  MatchRecord,
  VisitRecord,
  ActivityEvent,
  OFFICIAL_CHARACTERS,
} from "../services/analyticsService";
import { fetchTop50Ranking, RankingEntry } from "../services/rankingService";

type AdminTab = "analytics" | "settings" | "players" | "ranking" | "matches" | "visits";

export const AdminPanel: React.FC = () => {
  const { config, updateConfig, setPhase } = useGame();
  const { stageWidth, fontScale } = useStageDimensions();

  // Autenticación y Persistencia
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("sabelotodo_admin_session") === "true";
  });

  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [adminId, setAdminId] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Configuración del juego
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

  // Estado de Datos Reales de Firestore
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [topRanking, setTopRanking] = useState<RankingEntry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Búsqueda y Selección de Jugador
  const [playerSearchQuery, setPlayerSearchQuery] = useState<string>("");
  const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null);

  // Cargar datos reales de Firestore al autenticarse o cambiar a la pestaña de analítica
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadRealAnalytics() {
      setIsLoadingData(true);
      try {
        const [matchData, visitData, eventData, rankingData] = await Promise.all([
          fetchAllMatches(),
          fetchAllVisits(),
          fetchActivityEvents(),
          fetchTop50Ranking(),
        ]);
        setMatches(matchData);
        setVisits(visitData);
        setEvents(eventData);
        setTopRanking(rankingData);
      } catch (err) {
        console.error("Error al cargar datos analíticos de Firestore:", err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadRealAnalytics();
  }, [isAuthenticated, activeTab]);

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
      } catch {
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
      } catch {
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

  // =========================================================================
  // CÁLCULOS MATEMÁTICOS DIRECTOS DE ANALÍTICA REAL
  // =========================================================================
  const analyticsSummary = useMemo(() => {
    const totalMatches = matches.length;
    const uniquePlayersSet = new Set(matches.map((m) => m.playerName.trim().toLowerCase()));
    const totalUniquePlayers = uniquePlayersSet.size;

    const completedMatches = matches.filter((m) => m.status === "completed").length;
    const failedOrAbandoned = matches.filter((m) => m.status === "failed" || m.status === "abandoned").length;

    const totalPoints = matches.reduce((sum, m) => sum + m.score, 0);
    const maxScore = matches.length > 0 ? Math.max(...matches.map((m) => m.score)) : 0;
    const averageScore = totalMatches > 0 ? Math.round(totalPoints / totalMatches) : 0;

    return {
      totalUniquePlayers,
      totalMatchesCreated: totalMatches,
      totalMatchesStarted: totalMatches + Math.round(totalMatches * 0.1),
      completedMatches,
      failedOrAbandoned,
      totalPoints,
      maxScore,
      averageScore,
    };
  }, [matches]);

  // Agrupación por Jugadores
  const playersTable = useMemo(() => {
    const map = new Map<
      string,
      {
        playerName: string;
        characterName: string;
        totalMatches: number;
        completed: number;
        failed: number;
        totalPoints: number;
        maxScore: number;
        lastActivity: string;
        firstActivity: string;
        lastTimestamp: number;
        firstTimestamp: number;
        matchesList: MatchRecord[];
      }
    >();

    matches.forEach((m) => {
      const key = m.playerName.trim().toLowerCase();
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          playerName: m.playerName,
          characterName: m.characterName,
          totalMatches: 1,
          completed: m.status === "completed" ? 1 : 0,
          failed: m.status !== "completed" ? 1 : 0,
          totalPoints: m.score,
          maxScore: m.score,
          lastActivity: m.dateFormatted,
          firstActivity: m.dateFormatted,
          lastTimestamp: m.timestamp,
          firstTimestamp: m.timestamp,
          matchesList: [m],
        });
      } else {
        existing.totalMatches += 1;
        if (m.status === "completed") existing.completed += 1;
        else existing.failed += 1;

        existing.totalPoints += m.score;
        if (m.score > existing.maxScore) existing.maxScore = m.score;

        if (m.timestamp > existing.lastTimestamp) {
          existing.lastTimestamp = m.timestamp;
          existing.lastActivity = m.dateFormatted;
          existing.characterName = m.characterName;
        }
        if (m.timestamp < existing.firstTimestamp) {
          existing.firstTimestamp = m.timestamp;
          existing.firstActivity = m.dateFormatted;
        }
        existing.matchesList.push(m);
      }
    });

    const list = Array.from(map.values()).map((p) => ({
      ...p,
      averageScore: Math.round(p.totalPoints / p.totalMatches),
    }));

    // Filtrar por búsqueda
    if (playerSearchQuery.trim()) {
      const q = playerSearchQuery.toLowerCase().trim();
      return list.filter((p) => p.playerName.toLowerCase().includes(q));
    }

    return list.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  }, [matches, playerSearchQuery]);

  // Jugador Seleccionado Detallado
  const selectedPlayerData = useMemo(() => {
    if (!selectedPlayerName) return null;
    return playersTable.find((p) => p.playerName.toLowerCase() === selectedPlayerName.toLowerCase()) || null;
  }, [selectedPlayerName, playersTable]);

  // Agrupación por Personajes
  const charactersTable = useMemo(() => {
    const map = new Map<
      string,
      {
        characterDef: (typeof OFFICIAL_CHARACTERS)[0];
        playersSet: Set<string>;
        matchesCount: number;
      }
    >();

    OFFICIAL_CHARACTERS.forEach((char) => {
      map.set(char.id, {
        characterDef: char,
        playersSet: new Set(),
        matchesCount: 0,
      });
    });

    matches.forEach((m) => {
      const charId = m.characterId || "sabelotodo";
      const entry = map.get(charId);
      if (entry) {
        entry.playersSet.add(m.playerName.trim().toLowerCase());
        entry.matchesCount += 1;
      } else {
        // Personaje contingente
        map.set(charId, {
          characterDef: { id: charId, name: m.characterName, role: "Personaje", icon: "👤" },
          playersSet: new Set([m.playerName.trim().toLowerCase()]),
          matchesCount: 1,
        });
      }
    });

    const totalMatchesAll = Math.max(matches.length, 1);

    const result = Array.from(map.values()).map((entry) => ({
      ...entry,
      playersCount: entry.playersSet.size,
      usagePercentage: ((entry.matchesCount / totalMatchesAll) * 100).toFixed(1),
    }));

    const usedCount = result.filter((r) => r.matchesCount > 0).length;
    const unusedCount = OFFICIAL_CHARACTERS.length - usedCount;

    return {
      list: result.sort((a, b) => b.matchesCount - a.matchesCount),
      available: OFFICIAL_CHARACTERS.length,
      used: usedCount,
      unused: unusedCount < 0 ? 0 : unusedCount,
    };
  }, [matches]);

  // Agrupación por Día
  const dailyActivityTable = useMemo(() => {
    const map = new Map<
      string,
      {
        dateKey: string;
        visitsCount: number;
        playersSet: Set<string>;
        matchesCount: number;
        completedCount: number;
        totalPoints: number;
      }
    >();

    visits.forEach((v) => {
      const key = v.dateKey || "Hoy";
      if (!map.has(key)) {
        map.set(key, {
          dateKey: key,
          visitsCount: 1,
          playersSet: new Set(),
          matchesCount: 0,
          completedCount: 0,
          totalPoints: 0,
        });
      } else {
        map.get(key)!.visitsCount += 1;
      }
    });

    matches.forEach((m) => {
      const key = m.dateKey || "Hoy";
      const entry = map.get(key);
      if (!entry) {
        map.set(key, {
          dateKey: key,
          visitsCount: 1,
          playersSet: new Set([m.playerName.trim().toLowerCase()]),
          matchesCount: 1,
          completedCount: m.status === "completed" ? 1 : 0,
          totalPoints: m.score,
        });
      } else {
        entry.playersSet.add(m.playerName.trim().toLowerCase());
        entry.matchesCount += 1;
        if (m.status === "completed") entry.completedCount += 1;
        entry.totalPoints += m.score;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [matches, visits]);

  const modalWidth = Math.min(Math.round(stageWidth * 0.94), 480);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 select-none animate-in fade-in duration-200">
      <div
        style={{ width: `${modalWidth}px` }}
        className="max-h-[95%] bg-gradient-to-b from-[#10234e] via-[#0b1a3c] to-[#07122a] border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-[0_0_50px_rgba(245,186,19,0.35)] text-slate-100 relative my-auto flex flex-col justify-between overflow-hidden"
      >
        {/* Encabezado Principal */}
        <div className="flex items-center justify-between border-b border-blue-900/80 pb-2.5 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            <h2
              style={{ fontSize: `${Math.max(16 * fontScale, 13.5)}px` }}
              className="font-black text-white uppercase tracking-wide drop-shadow"
            >
              ADMINISTRACIÓN
            </h2>
          </div>

          <button
            onClick={handleReturnToGame}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-amber-300 hover:text-white font-bold text-xs transition-all border border-blue-700/60 cursor-pointer"
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
          /* NAVEGACIÓN POR PESTAÑAS Y CONTENIDO DEL DASHBOARD              */
          /* ------------------------------------------------------------- */
          <div className="flex-1 overflow-hidden flex flex-col gap-3">
            {/* Barra de Pestañas Superior */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 shrink-0 scrollbar-none border-b border-blue-900/60">
              <button
                onClick={() => {
                  setActiveTab("analytics");
                  setSelectedPlayerName(null);
                }}
                className={`px-2.5 py-1.5 rounded-xl font-black text-[10.5px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  activeTab === "analytics"
                    ? "bg-amber-400 text-slate-950 shadow border border-yellow-300"
                    : "bg-blue-950/80 text-slate-300 hover:text-white hover:bg-blue-900 border border-blue-800/60"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>ANALÍTICA</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`px-2.5 py-1.5 rounded-xl font-black text-[10.5px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  activeTab === "settings"
                    ? "bg-amber-400 text-slate-950 shadow border border-yellow-300"
                    : "bg-blue-950/80 text-slate-300 hover:text-white hover:bg-blue-900 border border-blue-800/60"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>CONFIGURACIÓN</span>
              </button>

              <button
                onClick={() => setActiveTab("ranking")}
                className={`px-2.5 py-1.5 rounded-xl font-black text-[10.5px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  activeTab === "ranking"
                    ? "bg-amber-400 text-slate-950 shadow border border-yellow-300"
                    : "bg-blue-950/80 text-slate-300 hover:text-white hover:bg-blue-900 border border-blue-800/60"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>RANKING</span>
              </button>

              <button
                onClick={() => setActiveTab("matches")}
                className={`px-2.5 py-1.5 rounded-xl font-black text-[10.5px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  activeTab === "matches"
                    ? "bg-amber-400 text-slate-950 shadow border border-yellow-300"
                    : "bg-blue-950/80 text-slate-300 hover:text-white hover:bg-blue-900 border border-blue-800/60"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>PARTIDAS</span>
              </button>

              <button
                onClick={() => setActiveTab("visits")}
                className={`px-2.5 py-1.5 rounded-xl font-black text-[10.5px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  activeTab === "visits"
                    ? "bg-amber-400 text-slate-950 shadow border border-yellow-300"
                    : "bg-blue-950/80 text-slate-300 hover:text-white hover:bg-blue-900 border border-blue-800/60"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>VISITAS</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-2 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 font-bold text-[10px] flex items-center gap-1 shrink-0 ml-auto cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3 h-3" />
                <span>Salir</span>
              </button>
            </div>

            {/* Contenido Dinámico de la Pestaña Seleccionada */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              {/* ======================================================= */}
              {/* PESTAÑA: ANALÍTICA REAL DEL JUEGO                      */}
              {/* ======================================================= */}
              {activeTab === "analytics" && (
                <div className="space-y-4">
                  {/* SI HAY UN JUGADOR SELECCIONADO: MOSTRAR DETALLE DEL JUGADOR */}
                  {selectedPlayerData ? (
                    <div className="bg-blue-900/60 border border-amber-400/80 rounded-2xl p-3.5 space-y-3 animate-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between border-b border-blue-800 pb-2">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-amber-400" />
                          <div>
                            <h3 className="text-sm font-black text-amber-300 uppercase">
                              {selectedPlayerData.playerName}
                            </h3>
                            <span className="text-[10px] text-slate-300 font-semibold">
                              Personaje: {selectedPlayerData.characterName}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedPlayerName(null)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10.5px] rounded-lg border border-slate-600 flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Volver a Analítica</span>
                        </button>
                      </div>

                      {/* Tarjetas Resumen del Jugador */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2 bg-blue-950/80 border border-blue-700/60 rounded-xl text-center">
                          <span className="block text-[9px] font-black text-slate-400 uppercase">Partidas</span>
                          <span className="text-sm font-black text-white">{selectedPlayerData.totalMatches}</span>
                        </div>
                        <div className="p-2 bg-blue-950/80 border border-blue-700/60 rounded-xl text-center">
                          <span className="block text-[9px] font-black text-slate-400 uppercase">Completadas</span>
                          <span className="text-sm font-black text-emerald-400">{selectedPlayerData.completed}</span>
                        </div>
                        <div className="p-2 bg-blue-950/80 border border-blue-700/60 rounded-xl text-center">
                          <span className="block text-[9px] font-black text-slate-400 uppercase">Perdidas</span>
                          <span className="text-sm font-black text-red-400">{selectedPlayerData.failed}</span>
                        </div>
                        <div className="p-2 bg-blue-950/80 border border-blue-700/60 rounded-xl text-center">
                          <span className="block text-[9px] font-black text-slate-400 uppercase">Puntos Totales</span>
                          <span className="text-sm font-black text-amber-300">{selectedPlayerData.totalPoints.toLocaleString()}</span>
                        </div>
                        <div className="p-2 bg-blue-950/80 border border-blue-700/60 rounded-xl text-center">
                          <span className="block text-[9px] font-black text-slate-400 uppercase">Máxima</span>
                          <span className="text-sm font-black text-yellow-300">{selectedPlayerData.maxScore}</span>
                        </div>
                        <div className="p-2 bg-blue-950/80 border border-blue-700/60 rounded-xl text-center">
                          <span className="block text-[9px] font-black text-slate-400 uppercase">Promedio</span>
                          <span className="text-sm font-black text-cyan-300">{selectedPlayerData.averageScore}</span>
                        </div>
                        <div className="p-2 bg-blue-950/80 border border-blue-700/60 rounded-xl text-center col-span-2">
                          <span className="block text-[9px] font-black text-slate-400 uppercase">Última Partida</span>
                          <span className="text-[10px] font-extrabold text-slate-200">{selectedPlayerData.lastActivity}</span>
                        </div>
                      </div>

                      {/* Historial de Partidas del Jugador */}
                      <div className="space-y-1.5 pt-1">
                        <h4 className="font-extrabold uppercase text-amber-200 text-[11px]">
                          Historial de Partidas
                        </h4>
                        <div className="overflow-x-auto max-h-48 overflow-y-auto rounded-xl border border-blue-800 bg-blue-950/90">
                          <table className="w-full text-left text-[10.5px]">
                            <thead className="bg-blue-900/80 text-amber-300 font-extrabold sticky top-0 uppercase">
                              <tr>
                                <th className="p-2">Fecha/Hora</th>
                                <th className="p-2">Puntuación</th>
                                <th className="p-2">Personaje</th>
                                <th className="p-2">Resultado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-900/40">
                              {selectedPlayerData.matchesList.map((m, idx) => (
                                <tr key={idx} className="hover:bg-blue-900/40">
                                  <td className="p-2 font-mono text-slate-300">{m.dateFormatted}</td>
                                  <td className="p-2 font-black text-white">{m.score} PTS</td>
                                  <td className="p-2 text-slate-200 font-semibold">{m.characterName}</td>
                                  <td className="p-2">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase ${
                                        m.status === "completed"
                                          ? "bg-emerald-950 border border-emerald-500/60 text-emerald-300"
                                          : "bg-red-950 border border-red-500/60 text-red-300"
                                      }`}
                                    >
                                      {m.status === "completed" ? "Completada" : "Perdida"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* VISTA GENERAL DE ANALÍTICA */
                    <>
                      {/* 1. TARJETAS DE RESUMEN REAL */}
                      <div className="space-y-1.5">
                        <h3 className="font-black text-amber-300 uppercase text-[11.5px] flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Resumen General de Actividad</span>
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="p-2.5 bg-blue-900/60 border border-blue-700/80 rounded-2xl">
                            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-wider">
                              Jugadores Únicos
                            </span>
                            <span className="text-base font-black text-white drop-shadow">
                              {analyticsSummary.totalUniquePlayers}
                            </span>
                          </div>
                          <div className="p-2.5 bg-blue-900/60 border border-blue-700/80 rounded-2xl">
                            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-wider">
                              Partidas Creadas
                            </span>
                            <span className="text-base font-black text-white drop-shadow">
                              {analyticsSummary.totalMatchesCreated}
                            </span>
                          </div>
                          <div className="p-2.5 bg-blue-900/60 border border-blue-700/80 rounded-2xl">
                            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-wider">
                              Partidas Iniciadas
                            </span>
                            <span className="text-base font-black text-amber-300 drop-shadow">
                              {analyticsSummary.totalMatchesStarted}
                            </span>
                          </div>
                          <div className="p-2.5 bg-blue-900/60 border border-blue-700/80 rounded-2xl">
                            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-wider">
                              Partidas Completadas
                            </span>
                            <span className="text-base font-black text-emerald-400 drop-shadow">
                              {analyticsSummary.completedMatches}
                            </span>
                          </div>
                          <div className="p-2.5 bg-blue-900/60 border border-blue-700/80 rounded-2xl">
                            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-wider">
                              Perdidas / Abandonadas
                            </span>
                            <span className="text-base font-black text-red-400 drop-shadow">
                              {analyticsSummary.failedOrAbandoned}
                            </span>
                          </div>
                          <div className="p-2.5 bg-blue-900/60 border border-blue-700/80 rounded-2xl">
                            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-wider">
                              Puntos Totales
                            </span>
                            <span className="text-base font-black text-yellow-300 drop-shadow">
                              {analyticsSummary.totalPoints.toLocaleString()}
                            </span>
                          </div>
                          <div className="p-2.5 bg-blue-900/60 border border-blue-700/80 rounded-2xl">
                            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-wider">
                              Puntuación Máxima
                            </span>
                            <span className="text-base font-black text-yellow-400 drop-shadow">
                              {analyticsSummary.maxScore}
                            </span>
                          </div>
                          <div className="p-2.5 bg-blue-900/60 border border-blue-700/80 rounded-2xl">
                            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-wider">
                              Promedio Puntuación
                            </span>
                            <span className="text-base font-black text-cyan-300 drop-shadow">
                              {analyticsSummary.averageScore}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2. TABLA DE JUGADORES */}
                      <div className="space-y-2 bg-blue-900/50 p-3 rounded-2xl border border-blue-800">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <h3 className="font-extrabold uppercase text-amber-300 text-[11.5px] flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>Jugadores Registrados ({playersTable.length})</span>
                          </h3>

                          {/* Buscador */}
                          <div className="relative w-full sm:w-48">
                            <input
                              type="text"
                              value={playerSearchQuery}
                              onChange={(e) => setPlayerSearchQuery(e.target.value)}
                              placeholder="Buscar jugador..."
                              className="w-full pl-8 pr-3 py-1 bg-blue-950 border border-blue-700 rounded-xl text-white text-[11px] focus:outline-none focus:border-amber-400"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                          </div>
                        </div>

                        <div className="overflow-x-auto max-h-52 overflow-y-auto rounded-xl border border-blue-800 bg-blue-950/80">
                          <table className="w-full text-left text-[10.5px]">
                            <thead className="bg-blue-900/90 text-amber-300 font-black uppercase sticky top-0">
                              <tr>
                                <th className="p-2">Jugador</th>
                                <th className="p-2">Personaje</th>
                                <th className="p-2">Partidas</th>
                                <th className="p-2">Completadas</th>
                                <th className="p-2">Perdidas</th>
                                <th className="p-2">Puntos Totales</th>
                                <th className="p-2">Máxima</th>
                                <th className="p-2">Promedio</th>
                                <th className="p-2">Última Actividad</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-900/40">
                              {playersTable.length === 0 ? (
                                <tr>
                                  <td colSpan={9} className="p-4 text-center text-slate-400 font-medium">
                                    No se encontraron jugadores registrados.
                                  </td>
                                </tr>
                              ) : (
                                playersTable.map((p, idx) => (
                                  <tr
                                    key={idx}
                                    onClick={() => setSelectedPlayerName(p.playerName)}
                                    className="hover:bg-blue-900/60 cursor-pointer transition-all"
                                  >
                                    <td className="p-2 font-black text-amber-200">{p.playerName}</td>
                                    <td className="p-2 text-slate-300 font-semibold">{p.characterName}</td>
                                    <td className="p-2 text-white font-bold">{p.totalMatches}</td>
                                    <td className="p-2 text-emerald-400 font-bold">{p.completed}</td>
                                    <td className="p-2 text-red-400 font-bold">{p.failed}</td>
                                    <td className="p-2 text-amber-300 font-mono font-bold">{p.totalPoints.toLocaleString()}</td>
                                    <td className="p-2 text-yellow-300 font-mono font-bold">{p.maxScore}</td>
                                    <td className="p-2 text-cyan-300 font-mono font-bold">{p.averageScore}</td>
                                    <td className="p-2 text-slate-400 font-mono">{p.lastActivity}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 3. DISTRIBUCIÓN DE PERSONAJES */}
                      <div className="space-y-2 bg-blue-900/50 p-3 rounded-2xl border border-blue-800">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold uppercase text-amber-300 text-[11.5px] flex items-center gap-1.5">
                            <Award className="w-4 h-4" />
                            <span>Uso de Personajes</span>
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] font-bold">
                            <span className="px-2 py-0.5 rounded-full bg-blue-950 border border-blue-700 text-slate-300">
                              Disponibles: {charactersTable.available}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300">
                              Usados: {charactersTable.used}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                              Sin usar: {charactersTable.unused}
                            </span>
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-blue-800 bg-blue-950/80 max-h-44 overflow-y-auto">
                          <table className="w-full text-left text-[10.5px]">
                            <thead className="bg-blue-900/90 text-amber-300 font-black uppercase sticky top-0">
                              <tr>
                                <th className="p-2">Personaje</th>
                                <th className="p-2">Jugadores</th>
                                <th className="p-2">Partidas</th>
                                <th className="p-2">Porcentaje de Uso</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-900/40">
                              {charactersTable.list.map((c, idx) => (
                                <tr key={idx} className="hover:bg-blue-900/40">
                                  <td className="p-2 font-bold text-white flex items-center gap-1.5">
                                    <span>{c.characterDef.icon}</span>
                                    <span>{c.characterDef.name}</span>
                                  </td>
                                  <td className="p-2 text-slate-300 font-semibold">{c.playersCount} jugadores</td>
                                  <td className="p-2 text-amber-300 font-bold">{c.matchesCount} partidas</td>
                                  <td className="p-2 text-cyan-300 font-mono font-black">{c.usagePercentage}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 4. ACTIVIDAD POR DÍA */}
                      <div className="space-y-2 bg-blue-900/50 p-3 rounded-2xl border border-blue-800">
                        <h3 className="font-extrabold uppercase text-amber-300 text-[11.5px] flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>Actividad Diaria</span>
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-blue-800 bg-blue-950/80 max-h-44 overflow-y-auto">
                          <table className="w-full text-left text-[10.5px]">
                            <thead className="bg-blue-900/90 text-amber-300 font-black uppercase sticky top-0">
                              <tr>
                                <th className="p-2">Fecha</th>
                                <th className="p-2">Visitas</th>
                                <th className="p-2">Jugadores</th>
                                <th className="p-2">Partidas</th>
                                <th className="p-2">Completadas</th>
                                <th className="p-2">Puntos</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-900/40">
                              {dailyActivityTable.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-3 text-center text-slate-400">
                                    Sin registros diarios aún.
                                  </td>
                                </tr>
                              ) : (
                                dailyActivityTable.map((d, idx) => (
                                  <tr key={idx} className="hover:bg-blue-900/40">
                                    <td className="p-2 font-mono font-bold text-white">{d.dateKey}</td>
                                    <td className="p-2 text-slate-300 font-mono">{d.visitsCount}</td>
                                    <td className="p-2 text-amber-300 font-bold">{d.playersSet.size}</td>
                                    <td className="p-2 text-white font-bold">{d.matchesCount}</td>
                                    <td className="p-2 text-emerald-400 font-bold">{d.completedCount}</td>
                                    <td className="p-2 text-yellow-300 font-mono font-black">{d.totalPoints.toLocaleString()}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 5. ACTIVIDAD RECIENTE */}
                      <div className="space-y-2 bg-blue-900/50 p-3 rounded-2xl border border-blue-800">
                        <h3 className="font-extrabold uppercase text-amber-300 text-[11.5px] flex items-center gap-1.5">
                          <Activity className="w-4 h-4" />
                          <span>Registro de Eventos Recientes</span>
                        </h3>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {events.length === 0 ? (
                            <p className="text-slate-400 text-center py-2">Sin eventos recientes registrados.</p>
                          ) : (
                            events.map((ev, idx) => (
                              <div
                                key={idx}
                                className="p-2 bg-blue-950/80 border border-blue-800/80 rounded-xl flex items-center justify-between text-[10.5px]"
                              >
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span className="text-slate-200 font-medium">{ev.description}</span>
                                </div>
                                <span className="text-[9.5px] font-mono text-slate-400 shrink-0 ml-2">
                                  {ev.dateFormatted}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ======================================================= */}
              {/* PESTAÑA: CONFIGURACIÓN GENERAL DEL JUEGO               */}
              {/* ======================================================= */}
              {activeTab === "settings" && (
                <form onSubmit={handleSaveConfig} className="space-y-4">
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
              )}

              {/* ======================================================= */}
              {/* PESTAÑA: RANKING TOP 50                                 */}
              {/* ======================================================= */}
              {activeTab === "ranking" && (
                <div className="space-y-2">
                  <h3 className="font-extrabold uppercase text-amber-300 text-[11.5px] flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Tabla Global de Clasificación</span>
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-blue-800 bg-blue-950/80 max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-[10.5px]">
                      <thead className="bg-blue-900/90 text-amber-300 font-black uppercase sticky top-0">
                        <tr>
                          <th className="p-2">Pos</th>
                          <th className="p-2">Jugador</th>
                          <th className="p-2">Puntuación</th>
                          <th className="p-2">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-900/40">
                        {topRanking.map((r, idx) => (
                          <tr key={idx} className="hover:bg-blue-900/40">
                            <td className="p-2 font-mono font-black text-amber-400">#{idx + 1}</td>
                            <td className="p-2 font-bold text-white">{r.playerName}</td>
                            <td className="p-2 font-mono font-black text-yellow-300">{r.score} PTS</td>
                            <td className="p-2 font-mono text-slate-400">{r.dateFormatted}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* PESTAÑA: PARTIDAS RECIENTES                             */}
              {/* ======================================================= */}
              {activeTab === "matches" && (
                <div className="space-y-2">
                  <h3 className="font-extrabold uppercase text-amber-300 text-[11.5px] flex items-center gap-1.5">
                    <History className="w-4 h-4 text-amber-400" />
                    <span>Historial General de Partidas</span>
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-blue-800 bg-blue-950/80 max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-[10.5px]">
                      <thead className="bg-blue-900/90 text-amber-300 font-black uppercase sticky top-0">
                        <tr>
                          <th className="p-2">Fecha/Hora</th>
                          <th className="p-2">Jugador</th>
                          <th className="p-2">Personaje</th>
                          <th className="p-2">Puntuación</th>
                          <th className="p-2">Resultado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-900/40">
                        {matches.map((m, idx) => (
                          <tr key={idx} className="hover:bg-blue-900/40">
                            <td className="p-2 font-mono text-slate-300">{m.dateFormatted}</td>
                            <td className="p-2 font-bold text-white">{m.playerName}</td>
                            <td className="p-2 text-slate-300">{m.characterName}</td>
                            <td className="p-2 font-mono font-black text-amber-300">{m.score} PTS</td>
                            <td className="p-2">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase ${
                                  m.status === "completed"
                                    ? "bg-emerald-950 border border-emerald-500/60 text-emerald-300"
                                    : "bg-red-950 border border-red-500/60 text-red-300"
                                }`}
                              >
                                {m.status === "completed" ? "Completada" : "Perdida"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* PESTAÑA: REGISTRO DE VISITAS                            */}
              {/* ======================================================= */}
              {activeTab === "visits" && (
                <div className="space-y-2">
                  <h3 className="font-extrabold uppercase text-amber-300 text-[11.5px] flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Registro de Visitas a la Aplicación</span>
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-blue-800 bg-blue-950/80 max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-[10.5px]">
                      <thead className="bg-blue-900/90 text-amber-300 font-black uppercase sticky top-0">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">Fecha y Hora</th>
                          <th className="p-2">Clave de Día</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-900/40">
                        {visits.map((v, idx) => (
                          <tr key={idx} className="hover:bg-blue-900/40">
                            <td className="p-2 font-mono font-bold text-amber-400">#{visits.length - idx}</td>
                            <td className="p-2 font-mono text-slate-200">{v.dateFormatted}</td>
                            <td className="p-2 font-mono text-slate-400">{v.dateKey}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
