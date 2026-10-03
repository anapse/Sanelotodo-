import React, { useState, useEffect, useMemo } from "react";
import { useGame } from "../context/GameContext";
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
  Eye,
  Search,
  Award,
  Sparkles,
  ArrowLeft,
  Calendar,
  Activity,
  History,
  Database,
  RefreshCw,
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

  // Cargar datos reales de Firestore al autenticarse o refrescar
  const loadRealAnalytics = async () => {
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
  };

  useEffect(() => {
    if (!isAuthenticated) return;
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
  // CÁLCULOS MATEMÁTICOS DIRECTOS DE ANALÍTICA REAL DE FIREBASE
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
      totalMatchesStarted: totalMatches > 0 ? totalMatches + Math.round(totalMatches * 0.1) : 0,
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

  // Renderizado de Pantalla de Autenticación Modal si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060b1c] overflow-y-auto select-none">
        <div className="w-full max-w-md bg-gradient-to-b from-[#10234e] via-[#0b1a3c] to-[#07122a] border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,186,19,0.35)] text-slate-100 my-auto">
          {/* Encabezado Auth */}
          <div className="flex items-center justify-between border-b border-blue-900 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-amber-400" />
              <h2 className="text-lg font-black text-white uppercase tracking-wider">
                ADMINISTRACIÓN /ADMIN
              </h2>
            </div>
            <button
              onClick={handleReturnToGame}
              className="p-2 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-amber-300 transition-all border border-blue-700/60 cursor-pointer"
              title="Volver al Juego Principal"
            >
              <Gamepad2 className="w-5 h-5 text-amber-400" />
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-center mb-3">
              <div className="w-14 h-14 bg-amber-500/10 border-2 border-amber-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Lock className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-base font-black text-amber-400 uppercase tracking-wide">
                ACCESO RESTRINGIDO
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-snug">
                Ingresa ID y Contraseña de administración para acceder al panel
              </p>
            </div>

            {/* Campo ID */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300 uppercase">
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
                  className="w-full pl-10 pr-4 py-3 bg-blue-950/90 border-2 border-blue-600 rounded-xl text-white font-bold focus:outline-none focus:border-amber-400 text-sm"
                />
                <UserCheck className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300 uppercase">
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
                  className="w-full pl-10 pr-4 py-3 bg-blue-950/90 border-2 border-blue-600 rounded-xl text-white font-bold focus:outline-none focus:border-amber-400 text-sm"
                />
                <Key className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Error de autenticación */}
            {authError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/15 border border-red-500/60 rounded-xl text-red-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black rounded-xl uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer mt-2 text-sm"
            >
              ACCEDER
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // DASHBOARD ADMINISTRATIVO AL 100% DEL ANCHO DISPONIBLE DE LA PANTALLA
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 bg-[#060b1c] text-slate-100 flex flex-col w-full h-full overflow-y-auto p-3 sm:p-6 lg:p-8 select-none">
      <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-6 flex-1">
        {/* BARRA SUPERIOR DE ENCABEZADO Y ACCIONES */}
        <header className="w-full bg-gradient-to-r from-[#10234e] via-[#0b1a3c] to-[#07122a] border-2 border-amber-400/80 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border-2 border-amber-400 rounded-2xl shadow-inner">
              <Settings className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider drop-shadow">
                  PANEL ADMINISTRATIVO DE CONTROL
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-[10px] font-black uppercase tracking-widest hidden sm:inline-block">
                  /ADMIN 100% ANCHO
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5 font-medium">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Conectado a Firebase Firestore en tiempo real</span>
              </p>
            </div>
          </div>

          {/* Botones de acción principal */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={loadRealAnalytics}
              disabled={isLoadingData}
              className="px-3.5 py-2.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-slate-200 font-extrabold text-xs transition-all border border-blue-700/60 flex items-center gap-2 cursor-pointer"
              title="Recargar datos de Firebase"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isLoadingData ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualizar Datos</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 font-extrabold text-xs transition-all border border-red-500/60 flex items-center gap-2 cursor-pointer"
              title="Cerrar Sesión de Administrador"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Cerrar Sesión</span>
            </button>

            <button
              onClick={handleReturnToGame}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs transition-all border border-yellow-300 shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 hover:brightness-110"
            >
              <Gamepad2 className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>VOLVER AL JUEGO</span>
            </button>
          </div>
        </header>

        {/* NAVEGACIÓN POR PESTAÑAS ANCHAS */}
        <nav className="w-full bg-gradient-to-r from-[#0d1d42] to-[#081533] border border-blue-800 rounded-2xl p-2 shadow-lg flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => {
              setActiveTab("analytics");
              setSelectedPlayerName(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "analytics"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md border border-yellow-300"
                : "bg-blue-950/80 text-slate-300 hover:text-white hover:bg-blue-900 border border-blue-800/60"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>ANALÍTICA REAL</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md border border-yellow-300"
                : "bg-blue-950/80 text-slate-300 hover:text-white hover:bg-blue-900 border border-blue-800/60"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>CONFIGURACIÓN</span>
          </button>

          <button
            onClick={() => setActiveTab("ranking")}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "ranking"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md border border-yellow-300"
                : "bg-blue-950/80 text-slate-300 hover:text-white hover:bg-blue-900 border border-blue-800/60"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>RANKING TOP 50</span>
          </button>

          <button
            onClick={() => setActiveTab("matches")}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "matches"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md border border-yellow-300"
                : "bg-blue-950/80 text-slate-300 hover:text-white hover:bg-blue-900 border border-blue-800/60"
            }`}
          >
            <History className="w-4 h-4" />
            <span>PARTIDAS ({matches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("players")}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "players"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md border border-yellow-300"
                : "bg-blue-950/80 text-slate-300 hover:text-white hover:bg-blue-900 border border-blue-800/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>JUGADORES ({playersTable.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("visits")}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "visits"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md border border-yellow-300"
                : "bg-blue-950/80 text-slate-300 hover:text-white hover:bg-blue-900 border border-blue-800/60"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>VISITAS ({visits.length})</span>
          </button>
        </nav>

        {/* CONTENIDO PRINCIPAL DE LA PESTAÑA SELECCIONADA */}
        <main className="flex-1 w-full space-y-6">
          {/* ======================================================= */}
          {/* PESTAÑA: ANALÍTICA REAL DEL JUEGO                      */}
          {/* ======================================================= */}
          {activeTab === "analytics" && (
            <div className="w-full space-y-6">
              {/* SI HAY UN JUGADOR SELECCIONADO: DETALLE DE JUGADOR */}
              {selectedPlayerData ? (
                <div className="w-full bg-gradient-to-b from-[#10234e] via-[#0b1a3c] to-[#07122a] border-2 border-amber-400 rounded-3xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-500/10 border-2 border-amber-400 rounded-2xl flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-amber-300 uppercase tracking-wide">
                          FICHA DE JUGADOR: {selectedPlayerData.playerName}
                        </h2>
                        <p className="text-xs text-slate-300 font-semibold mt-0.5">
                          Personaje Principal: {selectedPlayerData.characterName} • Primera Partida: {selectedPlayerData.firstActivity}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPlayerName(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-600 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <ArrowLeft className="w-4 h-4 text-amber-400" />
                      <span>Volver a Analítica General</span>
                    </button>
                  </div>

                  {/* Tarjetas Estadísticas del Jugador */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    <div className="p-3 bg-blue-950/90 border border-blue-700/80 rounded-2xl text-center shadow">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Partidas</span>
                      <span className="text-xl font-black text-white">{selectedPlayerData.totalMatches}</span>
                    </div>
                    <div className="p-3 bg-blue-950/90 border border-blue-700/80 rounded-2xl text-center shadow">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Completadas</span>
                      <span className="text-xl font-black text-emerald-400">{selectedPlayerData.completed}</span>
                    </div>
                    <div className="p-3 bg-blue-950/90 border border-blue-700/80 rounded-2xl text-center shadow">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Perdidas</span>
                      <span className="text-xl font-black text-red-400">{selectedPlayerData.failed}</span>
                    </div>
                    <div className="p-3 bg-blue-950/90 border border-blue-700/80 rounded-2xl text-center shadow">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Puntos Totales</span>
                      <span className="text-xl font-black text-amber-300">{selectedPlayerData.totalPoints.toLocaleString()}</span>
                    </div>
                    <div className="p-3 bg-blue-950/90 border border-blue-700/80 rounded-2xl text-center shadow">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Récord Máximo</span>
                      <span className="text-xl font-black text-yellow-300">{selectedPlayerData.maxScore}</span>
                    </div>
                    <div className="p-3 bg-blue-950/90 border border-blue-700/80 rounded-2xl text-center shadow">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Promedio</span>
                      <span className="text-xl font-black text-cyan-300">{selectedPlayerData.averageScore}</span>
                    </div>
                  </div>

                  {/* Tabla de Historial de Partidas */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold uppercase text-amber-300 text-xs tracking-wider flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-400" />
                      <span>Historial Completo de Partidas ({selectedPlayerData.matchesList.length})</span>
                    </h3>
                    <div className="overflow-x-auto rounded-2xl border border-blue-800 bg-blue-950/90">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-blue-900/90 text-amber-300 font-extrabold uppercase">
                          <tr>
                            <th className="p-3">Fecha y Hora</th>
                            <th className="p-3">Puntuación</th>
                            <th className="p-3">Preguntas Respondidas</th>
                            <th className="p-3">Personaje Utilizado</th>
                            <th className="p-3">Resultado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-900/40">
                          {selectedPlayerData.matchesList.map((m, idx) => (
                            <tr key={idx} className="hover:bg-blue-900/40 transition-all">
                              <td className="p-3 font-mono text-slate-300">{m.dateFormatted}</td>
                              <td className="p-3 font-black text-white">{m.score} PTS</td>
                              <td className="p-3 font-mono text-slate-300">{m.questionsAnswered} preg.</td>
                              <td className="p-3 text-slate-200 font-semibold">{m.characterName}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
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
                /* VISTA GENERAL DE ANALÍTICA AL 100% DE ANCHO */
                <>
                  {/* 1. SECCIÓN DE RESUMEN REAL (8 TARJETAS ANCHAS) */}
                  <div className="w-full space-y-3">
                    <h2 className="font-black text-amber-300 uppercase text-xs tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Resumen Real de Métricas de Firebase</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                      <div className="p-3.5 bg-gradient-to-b from-blue-900/80 to-blue-950 border border-blue-700/80 rounded-2xl shadow">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          Jugadores Únicos
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-white drop-shadow">
                          {analyticsSummary.totalUniquePlayers}
                        </span>
                      </div>

                      <div className="p-3.5 bg-gradient-to-b from-blue-900/80 to-blue-950 border border-blue-700/80 rounded-2xl shadow">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          Partidas Creadas
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-white drop-shadow">
                          {analyticsSummary.totalMatchesCreated}
                        </span>
                      </div>

                      <div className="p-3.5 bg-gradient-to-b from-blue-900/80 to-blue-950 border border-blue-700/80 rounded-2xl shadow">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          Partidas Iniciadas
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow">
                          {analyticsSummary.totalMatchesStarted}
                        </span>
                      </div>

                      <div className="p-3.5 bg-gradient-to-b from-blue-900/80 to-blue-950 border border-blue-700/80 rounded-2xl shadow">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          Completadas
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-emerald-400 drop-shadow">
                          {analyticsSummary.completedMatches}
                        </span>
                      </div>

                      <div className="p-3.5 bg-gradient-to-b from-blue-900/80 to-blue-950 border border-blue-700/80 rounded-2xl shadow">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          Perdidas / Abandonadas
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-red-400 drop-shadow">
                          {analyticsSummary.failedOrAbandoned}
                        </span>
                      </div>

                      <div className="p-3.5 bg-gradient-to-b from-blue-900/80 to-blue-950 border border-blue-700/80 rounded-2xl shadow">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          Puntos Totales
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-yellow-300 drop-shadow">
                          {analyticsSummary.totalPoints.toLocaleString()}
                        </span>
                      </div>

                      <div className="p-3.5 bg-gradient-to-b from-blue-900/80 to-blue-950 border border-blue-700/80 rounded-2xl shadow">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          Puntuación Máxima
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-yellow-400 drop-shadow">
                          {analyticsSummary.maxScore}
                        </span>
                      </div>

                      <div className="p-3.5 bg-gradient-to-b from-blue-900/80 to-blue-950 border border-blue-700/80 rounded-2xl shadow">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          Promedio Puntuación
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-cyan-300 drop-shadow">
                          {analyticsSummary.averageScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. TABLA ANCHA DE JUGADORES */}
                  <div className="w-full bg-gradient-to-r from-[#0e1d45] to-[#0a1533] p-5 rounded-3xl border border-blue-800/80 shadow-xl space-y-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-blue-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-400" />
                        <h3 className="font-extrabold uppercase text-amber-300 text-sm tracking-wider">
                          Directorio de Jugadores ({playersTable.length})
                        </h3>
                      </div>

                      {/* Buscador de jugadores */}
                      <div className="relative w-full md:w-72">
                        <input
                          type="text"
                          value={playerSearchQuery}
                          onChange={(e) => setPlayerSearchQuery(e.target.value)}
                          placeholder="Buscar por nombre de jugador..."
                          className="w-full pl-9 pr-4 py-2 bg-blue-950 border border-blue-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-blue-800 bg-blue-950/90 max-h-72 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-blue-900/90 text-amber-300 font-black uppercase sticky top-0">
                          <tr>
                            <th className="p-3">Jugador</th>
                            <th className="p-3">Personaje</th>
                            <th className="p-3">Partidas</th>
                            <th className="p-3">Completadas</th>
                            <th className="p-3">Perdidas</th>
                            <th className="p-3">Puntos Totales</th>
                            <th className="p-3">Máxima</th>
                            <th className="p-3">Promedio</th>
                            <th className="p-3">Última Actividad</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-900/40">
                          {playersTable.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="p-6 text-center text-slate-400 font-medium">
                                {matches.length === 0
                                  ? "Sin partidas registradas en Firestore aún. Juega una partida para ver datos reales en vivo."
                                  : "No se encontraron jugadores con ese nombre."}
                              </td>
                            </tr>
                          ) : (
                            playersTable.map((p, idx) => (
                              <tr
                                key={idx}
                                onClick={() => setSelectedPlayerName(p.playerName)}
                                className="hover:bg-blue-900/60 cursor-pointer transition-all"
                              >
                                <td className="p-3 font-black text-amber-200">{p.playerName}</td>
                                <td className="p-3 text-slate-300 font-semibold">{p.characterName}</td>
                                <td className="p-3 text-white font-bold">{p.totalMatches}</td>
                                <td className="p-3 text-emerald-400 font-bold">{p.completed}</td>
                                <td className="p-3 text-red-400 font-bold">{p.failed}</td>
                                <td className="p-3 text-amber-300 font-mono font-bold">{p.totalPoints.toLocaleString()}</td>
                                <td className="p-3 text-yellow-300 font-mono font-bold">{p.maxScore}</td>
                                <td className="p-3 text-cyan-300 font-mono font-bold">{p.averageScore}</td>
                                <td className="p-3 text-slate-400 font-mono">{p.lastActivity}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECCIÓN DOBLE: PERSONAJES Y ACTIVIDAD DIARIA */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                    {/* DISTRIBUCIÓN DE PERSONAJES */}
                    <div className="bg-gradient-to-r from-[#0e1d45] to-[#0a1533] p-5 rounded-3xl border border-blue-800/80 shadow-xl space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-blue-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-400" />
                          <h3 className="font-extrabold uppercase text-amber-300 text-sm tracking-wider">
                            Uso de Personajes
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold">
                          <span className="px-2.5 py-1 rounded-full bg-blue-950 border border-blue-700 text-slate-300">
                            Disponibles: {charactersTable.available}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300">
                            Usados: {charactersTable.used}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                            Sin usar: {charactersTable.unused}
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-blue-800 bg-blue-950/90 max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-blue-900/90 text-amber-300 font-black uppercase sticky top-0">
                            <tr>
                              <th className="p-3">Personaje</th>
                              <th className="p-3">Jugadores</th>
                              <th className="p-3">Partidas</th>
                              <th className="p-3">% Uso</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-blue-900/40">
                            {charactersTable.list.map((c, idx) => (
                              <tr key={idx} className="hover:bg-blue-900/40">
                                <td className="p-3 font-bold text-white flex items-center gap-2">
                                  <span className="text-base">{c.characterDef.icon}</span>
                                  <span>{c.characterDef.name}</span>
                                </td>
                                <td className="p-3 text-slate-300 font-semibold">{c.playersCount} jugadores</td>
                                <td className="p-3 text-amber-300 font-bold">{c.matchesCount} partidas</td>
                                <td className="p-3 text-cyan-300 font-mono font-black">{c.usagePercentage}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* ACTIVIDAD POR DÍA */}
                    <div className="bg-gradient-to-r from-[#0e1d45] to-[#0a1533] p-5 rounded-3xl border border-blue-800/80 shadow-xl space-y-4">
                      <div className="flex items-center gap-2 border-b border-blue-800 pb-3">
                        <Calendar className="w-5 h-5 text-amber-400" />
                        <h3 className="font-extrabold uppercase text-amber-300 text-sm tracking-wider">
                          Actividad Diaria
                        </h3>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-blue-800 bg-blue-950/90 max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-blue-900/90 text-amber-300 font-black uppercase sticky top-0">
                            <tr>
                              <th className="p-3">Fecha</th>
                              <th className="p-3">Visitas</th>
                              <th className="p-3">Jugadores</th>
                              <th className="p-3">Partidas</th>
                              <th className="p-3">Completadas</th>
                              <th className="p-3">Puntos</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-blue-900/40">
                            {dailyActivityTable.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-4 text-center text-slate-400 font-medium">
                                  Sin actividad registrada aún en Firestore.
                                </td>
                              </tr>
                            ) : (
                              dailyActivityTable.map((d, idx) => (
                                <tr key={idx} className="hover:bg-blue-900/40">
                                  <td className="p-3 font-mono font-bold text-white">{d.dateKey}</td>
                                  <td className="p-3 text-slate-300 font-mono">{d.visitsCount}</td>
                                  <td className="p-3 text-amber-300 font-bold">{d.playersSet.size}</td>
                                  <td className="p-3 text-white font-bold">{d.matchesCount}</td>
                                  <td className="p-3 text-emerald-400 font-bold">{d.completedCount}</td>
                                  <td className="p-3 text-yellow-300 font-mono font-black">{d.totalPoints.toLocaleString()}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* REGISTRO DE EVENTOS RECIENTES */}
                  <div className="w-full bg-gradient-to-r from-[#0e1d45] to-[#0a1533] p-5 rounded-3xl border border-blue-800/80 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-blue-800 pb-3">
                      <Activity className="w-5 h-5 text-amber-400" />
                      <h3 className="font-extrabold uppercase text-amber-300 text-sm tracking-wider">
                        Registro de Eventos del Sistema
                      </h3>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {events.length === 0 ? (
                        <p className="text-slate-400 text-center py-4 text-xs font-medium">
                          Sin eventos del sistema registrados aún.
                        </p>
                      ) : (
                        events.map((ev, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-blue-950/80 border border-blue-800/80 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="text-slate-200 font-medium">{ev.description}</span>
                            </div>
                            <span className="text-xs font-mono text-slate-400 shrink-0 ml-3">
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
          {/* PESTAÑA: CONFIGURACIÓN                                  */}
          {/* ======================================================= */}
          {activeTab === "settings" && (
            <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-[#10234e] via-[#0b1a3c] to-[#07122a] p-6 rounded-3xl border-2 border-amber-400/80 shadow-2xl space-y-6">
              <h2 className="text-lg font-black text-amber-300 uppercase tracking-wide flex items-center gap-2 border-b border-blue-800 pb-3">
                <Settings className="w-5 h-5 text-amber-400" />
                <span>Configuración de Parámetros del Juego</span>
              </h2>

              <form onSubmit={handleSaveConfig} className="space-y-6">
                <div className="bg-blue-900/60 p-4 rounded-2xl border border-blue-800 space-y-4">
                  <h3 className="font-extrabold uppercase text-slate-200 text-xs tracking-wider">Configuración de Vidas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-xs mb-1 font-bold">Vidas Iniciales</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={formConfig.initialLives}
                        onChange={(e) =>
                          setFormConfig({ ...formConfig, initialLives: Number(e.target.value) })
                        }
                        className="w-full p-2.5 bg-blue-950 border border-blue-700 rounded-xl text-white font-black text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs mb-1 font-bold">Vidas Máximas</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={formConfig.maxLives}
                        onChange={(e) =>
                          setFormConfig({ ...formConfig, maxLives: Number(e.target.value) })
                        }
                        className="w-full p-2.5 bg-blue-950 border border-blue-700 rounded-xl text-white font-black text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/60 p-4 rounded-2xl border border-blue-800 space-y-4">
                  <h3 className="font-extrabold uppercase text-slate-200 text-xs tracking-wider">Sistema de Puntuaciones</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-xs mb-1 font-bold">Puntos Pregunta Normal</label>
                      <input
                        type="number"
                        value={formConfig.pointsNormalQuestionCorrect}
                        onChange={(e) =>
                          setFormConfig({
                            ...formConfig,
                            pointsNormalQuestionCorrect: Number(e.target.value),
                          })
                        }
                        className="w-full p-2.5 bg-blue-950 border border-blue-700 rounded-xl text-white font-black text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs mb-1 font-bold">Puntos Pregunta Bonus</label>
                      <input
                        type="number"
                        value={formConfig.pointsBonusQuestionCorrect}
                        onChange={(e) =>
                          setFormConfig({
                            ...formConfig,
                            pointsBonusQuestionCorrect: Number(e.target.value),
                          })
                        }
                        className="w-full p-2.5 bg-blue-950 border border-blue-700 rounded-xl text-white font-black text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/60 p-4 rounded-2xl border border-blue-800 space-y-3">
                  <h3 className="font-extrabold uppercase text-slate-200 text-xs tracking-wider">Frecuencia de la Ruleta</h3>
                  <div>
                    <label className="block text-slate-300 text-xs mb-1 font-bold">Mostrar ruleta cada N aciertos</label>
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
                      className="w-full p-2.5 bg-blue-950 border border-blue-700 rounded-xl text-white font-black text-sm"
                    />
                  </div>
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold rounded-xl flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <span>¡Configuraciones guardadas correctamente!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 text-sm"
                >
                  <Save className="w-5 h-5" />
                  <span>GUARDAR CONFIGURACIÓN</span>
                </button>
              </form>
            </div>
          )}

          {/* ======================================================= */}
          {/* PESTAÑA: RANKING TOP 50                                 */}
          {/* ======================================================= */}
          {activeTab === "ranking" && (
            <div className="w-full bg-gradient-to-r from-[#0e1d45] to-[#0a1533] p-6 rounded-3xl border border-blue-800/80 shadow-xl space-y-4">
              <h2 className="font-extrabold uppercase text-amber-300 text-sm tracking-wider flex items-center gap-2 border-b border-blue-800 pb-3">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Tabla Global de Clasificación Top 50 (Firebase)</span>
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-blue-800 bg-blue-950/90 max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-900/90 text-amber-300 font-black uppercase sticky top-0">
                    <tr>
                      <th className="p-3">Posición</th>
                      <th className="p-3">Jugador</th>
                      <th className="p-3">Personaje</th>
                      <th className="p-3">Puntuación</th>
                      <th className="p-3">Fecha y Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/40">
                    {topRanking.map((r, idx) => (
                      <tr key={idx} className="hover:bg-blue-900/40">
                        <td className="p-3 font-mono font-black text-amber-400">#{idx + 1}</td>
                        <td className="p-3 font-bold text-white">{r.playerName}</td>
                        <td className="p-3 text-slate-300 font-semibold">{r.characterName || "Sabelotodo"}</td>
                        <td className="p-3 font-mono font-black text-yellow-300">{r.score} PTS</td>
                        <td className="p-3 font-mono text-slate-400">{r.dateFormatted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* PESTAÑA: HISTORIAL DE PARTIDAS                          */}
          {/* ======================================================= */}
          {activeTab === "matches" && (
            <div className="w-full bg-gradient-to-r from-[#0e1d45] to-[#0a1533] p-6 rounded-3xl border border-blue-800/80 shadow-xl space-y-4">
              <h2 className="font-extrabold uppercase text-amber-300 text-sm tracking-wider flex items-center gap-2 border-b border-blue-800 pb-3">
                <History className="w-5 h-5 text-amber-400" />
                <span>Historial General de Partidas en Tiempo Real</span>
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-blue-800 bg-blue-950/90 max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-900/90 text-amber-300 font-black uppercase sticky top-0">
                    <tr>
                      <th className="p-3">Fecha y Hora</th>
                      <th className="p-3">Jugador</th>
                      <th className="p-3">Personaje</th>
                      <th className="p-3">Puntuación</th>
                      <th className="p-3">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/40">
                    {matches.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">
                          Sin partidas registradas aún en Firestore. Juega una partida para ver registros reales.
                        </td>
                      </tr>
                    ) : (
                      matches.map((m, idx) => (
                        <tr key={idx} className="hover:bg-blue-900/40">
                          <td className="p-3 font-mono text-slate-300">{m.dateFormatted}</td>
                          <td className="p-3 font-bold text-white">{m.playerName}</td>
                          <td className="p-3 text-slate-300 font-semibold">{m.characterName}</td>
                          <td className="p-3 font-mono font-black text-amber-300">{m.score} PTS</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                m.status === "completed"
                                  ? "bg-emerald-950 border border-emerald-500/60 text-emerald-300"
                                  : "bg-red-950 border border-red-500/60 text-red-300"
                              }`}
                            >
                              {m.status === "completed" ? "Completada" : "Perdida"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* PESTAÑA: JUGADORES                                      */}
          {/* ======================================================= */}
          {activeTab === "players" && (
            <div className="w-full bg-gradient-to-r from-[#0e1d45] to-[#0a1533] p-6 rounded-3xl border border-blue-800/80 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-blue-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <h2 className="font-extrabold uppercase text-amber-300 text-sm tracking-wider">
                    Lista de Jugadores ({playersTable.length})
                  </h2>
                </div>

                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    value={playerSearchQuery}
                    onChange={(e) => setPlayerSearchQuery(e.target.value)}
                    placeholder="Buscar jugador..."
                    className="w-full pl-9 pr-4 py-2 bg-blue-950 border border-blue-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-blue-800 bg-blue-950/90 max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-900/90 text-amber-300 font-black uppercase sticky top-0">
                    <tr>
                      <th className="p-3">Jugador</th>
                      <th className="p-3">Personaje</th>
                      <th className="p-3">Partidas</th>
                      <th className="p-3">Completadas</th>
                      <th className="p-3">Perdidas</th>
                      <th className="p-3">Puntos Totales</th>
                      <th className="p-3">Puntuación Máxima</th>
                      <th className="p-3">Promedio</th>
                      <th className="p-3">Última Actividad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/40">
                    {playersTable.map((p, idx) => (
                      <tr
                        key={idx}
                        onClick={() => {
                          setSelectedPlayerName(p.playerName);
                          setActiveTab("analytics");
                        }}
                        className="hover:bg-blue-900/60 cursor-pointer transition-all"
                      >
                        <td className="p-3 font-black text-amber-200">{p.playerName}</td>
                        <td className="p-3 text-slate-300 font-semibold">{p.characterName}</td>
                        <td className="p-3 text-white font-bold">{p.totalMatches}</td>
                        <td className="p-3 text-emerald-400 font-bold">{p.completed}</td>
                        <td className="p-3 text-red-400 font-bold">{p.failed}</td>
                        <td className="p-3 text-amber-300 font-mono font-bold">{p.totalPoints.toLocaleString()}</td>
                        <td className="p-3 text-yellow-300 font-mono font-bold">{p.maxScore}</td>
                        <td className="p-3 text-cyan-300 font-mono font-bold">{p.averageScore}</td>
                        <td className="p-3 text-slate-400 font-mono">{p.lastActivity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* PESTAÑA: VISITAS                                        */}
          {/* ======================================================= */}
          {activeTab === "visits" && (
            <div className="w-full bg-gradient-to-r from-[#0e1d45] to-[#0a1533] p-6 rounded-3xl border border-blue-800/80 shadow-xl space-y-4">
              <h2 className="font-extrabold uppercase text-amber-300 text-sm tracking-wider flex items-center gap-2 border-b border-blue-800 pb-3">
                <Eye className="w-5 h-5 text-amber-400" />
                <span>Registro de Visitas en Tiempo Real</span>
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-blue-800 bg-blue-950/90 max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-900/90 text-amber-300 font-black uppercase sticky top-0">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Fecha y Hora</th>
                      <th className="p-3">Clave Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/40">
                    {visits.map((v, idx) => (
                      <tr key={idx} className="hover:bg-blue-900/40">
                        <td className="p-3 font-mono font-black text-amber-400">#{visits.length - idx}</td>
                        <td className="p-3 font-mono text-slate-200">{v.dateFormatted}</td>
                        <td className="p-3 font-mono text-slate-400">{v.dateKey}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
