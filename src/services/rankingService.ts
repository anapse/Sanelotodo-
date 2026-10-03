import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { logMatchRecord } from "./analyticsService";

export interface RankingEntry {
  id?: string;
  playerName: string;
  score: number;
  timestamp: number;
  dateFormatted?: string;
  questionsAnswered?: number;
  characterId?: string;
  characterName?: string;
}

const RANKING_COLLECTION_NAME = "sabelotodo_top50_ranking";
const LOCAL_STORAGE_RANKING_KEY = "sabelotodo_top50_ranking_cache";

enum OperationType {
  CREATE = "create",
  GET = "get",
  LIST = "list",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.error("Firestore Ranking Error: ", JSON.stringify(errInfo));
}

/**
 * Obtiene las 50 mejores puntuaciones globales directamente desde Firebase Firestore.
 */
export async function fetchTop50Ranking(): Promise<RankingEntry[]> {
  try {
    const rankingRef = collection(db, RANKING_COLLECTION_NAME);
    const q = query(rankingRef, orderBy("score", "desc"), limit(50));

    const snapshot = await getDocs(q);

    const rankingData: RankingEntry[] = snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        playerName: data.playerName || "Jugador",
        score: Number(data.score) || 0,
        timestamp: Number(data.timestamp) || Date.now(),
        dateFormatted: data.dateFormatted || "",
        questionsAnswered: Number(data.questionsAnswered) || 0,
        characterId: data.characterId || "sabelotodo",
        characterName: data.characterName || "Sabelotodo",
      };
    });

    localStorage.setItem(LOCAL_STORAGE_RANKING_KEY, JSON.stringify(rankingData));
    return rankingData;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, RANKING_COLLECTION_NAME);

    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_RANKING_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignorar
    }

    return [];
  }
}

/**
 * Guarda el resultado de una partida en Firebase Firestore y actualiza analítica.
 */
export async function saveGameScore(
  entry: Omit<RankingEntry, "timestamp" | "dateFormatted">
): Promise<RankingEntry[]> {
  const qAnswered = entry.questionsAnswered || 0;
  const charId = entry.characterId || "sabelotodo";
  const charName = entry.characterName || "Sabelotodo";

  const newEntry: Omit<RankingEntry, "id"> = {
    playerName: entry.playerName.trim() || "Jugador",
    score: entry.score,
    questionsAnswered: qAnswered,
    characterId: charId,
    characterName: charName,
    timestamp: Date.now(),
    dateFormatted: new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  // 1. Registrar partida en la colección analítica general
  logMatchRecord({
    playerName: newEntry.playerName,
    characterId: charId,
    characterName: charName,
    score: newEntry.score,
    questionsAnswered: qAnswered,
    status: newEntry.score >= 1000 ? "completed" : "failed",
  });

  // 2. Registrar en ranking general
  try {
    const rankingRef = collection(db, RANKING_COLLECTION_NAME);
    await addDoc(rankingRef, newEntry);

    return await fetchTop50Ranking();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, RANKING_COLLECTION_NAME);

    try {
      const current = await fetchTop50Ranking();
      current.push({ ...newEntry, id: `local_${Date.now()}` });
      current.sort((a, b) => b.score - a.score);
      const top50 = current.slice(0, 50);
      localStorage.setItem(LOCAL_STORAGE_RANKING_KEY, JSON.stringify(top50));
      return top50;
    } catch {
      return [];
    }
  }
}
