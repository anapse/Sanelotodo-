export interface RankingEntry {
  id?: string;
  playerName: string;
  score: number;
  timestamp: number;
  dateFormatted?: string;
  questionsAnswered?: number;
}

const LOCAL_STORAGE_RANKING_KEY = "sabelotodo_top50_ranking";

/**
 * Puntuaciones de demostración iniciales para que el Top 50 nunca se muestre vacío.
 */
const DEFAULT_INITIAL_RANKING: RankingEntry[] = [
  { playerName: "ProfesorSaber", score: 4850, timestamp: Date.now() - 86400000, questionsAnswered: 28 },
  { playerName: "AstroMaestro", score: 4200, timestamp: Date.now() - 172800000, questionsAnswered: 24 },
  { playerName: "MenteBrillante", score: 3900, timestamp: Date.now() - 259200000, questionsAnswered: 22 },
  { playerName: "GenioGaláctico", score: 3450, timestamp: Date.now() - 345600000, questionsAnswered: 19 },
  { playerName: "SabioCósmico", score: 3100, timestamp: Date.now() - 432000000, questionsAnswered: 17 },
  { playerName: "TriviaKing", score: 2850, timestamp: Date.now() - 518400000, questionsAnswered: 15 },
  { playerName: "CuriosoPro", score: 2500, timestamp: Date.now() - 604800000, questionsAnswered: 13 },
  { playerName: "SuperCerebro", score: 2200, timestamp: Date.now() - 691200000, questionsAnswered: 11 },
  { playerName: "NovatoAudaz", score: 1800, timestamp: Date.now() - 777600000, questionsAnswered: 9 },
  { playerName: "Explorador", score: 1400, timestamp: Date.now() - 864000000, questionsAnswered: 7 },
];

/**
 * Obtiene las 50 mejores puntuaciones globales.
 */
export async function fetchTop50Ranking(): Promise<RankingEntry[]> {
  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_RANKING_KEY);
    let ranking: RankingEntry[] = localData ? JSON.parse(localData) : [];

    if (ranking.length === 0) {
      ranking = [...DEFAULT_INITIAL_RANKING];
      localStorage.setItem(LOCAL_STORAGE_RANKING_KEY, JSON.stringify(ranking));
    }

    ranking.sort((a, b) => b.score - a.score);
    return ranking.slice(0, 50);
  } catch (error) {
    console.error("Error al obtener ranking:", error);
    return DEFAULT_INITIAL_RANKING;
  }
}

/**
 * Guarda el resultado de una partida en el ranking global.
 */
export async function saveGameScore(entry: Omit<RankingEntry, "timestamp" | "dateFormatted">): Promise<RankingEntry[]> {
  const newEntry: RankingEntry = {
    ...entry,
    timestamp: Date.now(),
    dateFormatted: new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  try {
    const current = await fetchTop50Ranking();
    current.push(newEntry);
    current.sort((a, b) => b.score - a.score);

    const top50 = current.slice(0, 50);
    localStorage.setItem(LOCAL_STORAGE_RANKING_KEY, JSON.stringify(top50));
    return top50;
  } catch (error) {
    console.error("Error al guardar puntuación:", error);
    return [];
  }
}
