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

export interface MatchRecord {
  id?: string;
  playerName: string;
  characterId: string;
  characterName: string;
  score: number;
  questionsAnswered: number;
  status: "completed" | "failed" | "abandoned";
  timestamp: number;
  dateFormatted: string;
  dateKey: string;
}

export interface VisitRecord {
  id?: string;
  timestamp: number;
  dateFormatted: string;
  dateKey: string;
}

export interface ActivityEvent {
  id?: string;
  type: "visit" | "new_player" | "match_start" | "match_completed" | "new_high_score" | "record_broken";
  description: string;
  playerName?: string;
  characterName?: string;
  score?: number;
  timestamp: number;
  dateFormatted: string;
}

export interface CharacterDef {
  id: string;
  name: string;
  role: string;
  icon: string;
}

export const OFFICIAL_CHARACTERS: CharacterDef[] = [
  { id: "sabelotodo", name: "Sabelotodo", role: "Mascota Oficial", icon: "⭐" },
  { id: "fox", name: "Fox", role: "Zorro Astuto", icon: "🦊" },
  { id: "wolf", name: "Wolf", role: "Lobo Táctico", icon: "🐺" },
  { id: "owl", name: "Búho", role: "Búho Maestro", icon: "🦉" },
  { id: "wise", name: "El Sabio", role: "Anciano Erudito", icon: "🧙‍♂️" },
  { id: "captain", name: "Capitán Trivia", role: "Capitán Heroico", icon: "🦸‍♂️" },
  { id: "cerebrin", name: "Cerebrín", role: "Genio Joven", icon: "🧠" },
  { id: "scholar", name: "Erudita", role: "Mente Brillante", icon: "👩‍🎓" },
];

const MATCHES_COLLECTION = "sabelotodo_all_matches";
const VISITS_COLLECTION = "sabelotodo_visits";
const EVENTS_COLLECTION = "sabelotodo_activity_events";

/**
 * Registra una visita en Firebase Firestore.
 */
export async function logAppVisit(): Promise<void> {
  const now = new Date();
  const timestamp = now.getTime();
  const dateFormatted = now.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateKey = now.toISOString().split("T")[0];

  try {
    const visitsRef = collection(db, VISITS_COLLECTION);
    await addDoc(visitsRef, { timestamp, dateFormatted, dateKey });

    const eventsRef = collection(db, EVENTS_COLLECTION);
    await addDoc(eventsRef, {
      type: "visit",
      description: "Nueva visita a la aplicación",
      timestamp,
      dateFormatted,
    });
  } catch (err) {
    console.warn("No se pudo registrar la visita en Firestore:", err);
  }
}

/**
 * Registra el resultado completo de una partida en Firestore.
 */
export async function logMatchRecord(data: {
  playerName: string;
  characterId?: string;
  characterName?: string;
  score: number;
  questionsAnswered: number;
  status?: "completed" | "failed" | "abandoned";
}): Promise<void> {
  const now = new Date();
  const timestamp = now.getTime();
  const dateFormatted = now.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateKey = now.toISOString().split("T")[0];

  const charDef =
    OFFICIAL_CHARACTERS.find((c) => c.id === data.characterId) || OFFICIAL_CHARACTERS[0];

  const matchDoc: Omit<MatchRecord, "id"> = {
    playerName: data.playerName.trim() || "Jugador",
    characterId: charDef.id,
    characterName: data.characterName || charDef.name,
    score: data.score,
    questionsAnswered: data.questionsAnswered,
    status: data.status || (data.score >= 1000 ? "completed" : "failed"),
    timestamp,
    dateFormatted,
    dateKey,
  };

  try {
    const matchesRef = collection(db, MATCHES_COLLECTION);
    await addDoc(matchesRef, matchDoc);

    const eventsRef = collection(db, EVENTS_COLLECTION);
    await addDoc(eventsRef, {
      type: matchDoc.status === "completed" ? "match_completed" : "match_start",
      description: `Partida ${matchDoc.status === "completed" ? "completada" : "finalizada"} por ${matchDoc.playerName} (${matchDoc.score} PTS)`,
      playerName: matchDoc.playerName,
      characterName: matchDoc.characterName,
      score: matchDoc.score,
      timestamp,
      dateFormatted,
    });
  } catch (err) {
    console.warn("No se pudo registrar la partida en Firestore:", err);
  }
}

/**
 * Obtiene todas las partidas guardadas en Firestore.
 */
export async function fetchAllMatches(): Promise<MatchRecord[]> {
  try {
    const ref = collection(db, MATCHES_COLLECTION);
    const q = query(ref, orderBy("timestamp", "desc"), limit(500));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        playerName: d.playerName || "Jugador",
        characterId: d.characterId || "sabelotodo",
        characterName: d.characterName || "Sabelotodo",
        score: Number(d.score) || 0,
        questionsAnswered: Number(d.questionsAnswered) || 0,
        status: d.status || "completed",
        timestamp: Number(d.timestamp) || Date.now(),
        dateFormatted: d.dateFormatted || "",
        dateKey: d.dateKey || new Date().toISOString().split("T")[0],
      };
    });
  } catch (err) {
    console.warn("Error leyendo partidas de Firestore:", err);
    return [];
  }
}

/**
 * Obtiene todas las visitas registradas en Firestore.
 */
export async function fetchAllVisits(): Promise<VisitRecord[]> {
  try {
    const ref = collection(db, VISITS_COLLECTION);
    const q = query(ref, orderBy("timestamp", "desc"), limit(500));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        timestamp: Number(d.timestamp) || Date.now(),
        dateFormatted: d.dateFormatted || "",
        dateKey: d.dateKey || new Date().toISOString().split("T")[0],
      };
    });
  } catch (err) {
    console.warn("Error leyendo visitas de Firestore:", err);
    return [];
  }
}

/**
 * Obtiene los eventos recientes registrados en Firestore.
 */
export async function fetchActivityEvents(): Promise<ActivityEvent[]> {
  try {
    const ref = collection(db, EVENTS_COLLECTION);
    const q = query(ref, orderBy("timestamp", "desc"), limit(100));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        type: d.type || "visit",
        description: d.description || "Evento registrado",
        playerName: d.playerName,
        characterName: d.characterName,
        score: Number(d.score) || 0,
        timestamp: Number(d.timestamp) || Date.now(),
        dateFormatted: d.dateFormatted || "",
      };
    });
  } catch (err) {
    console.warn("Error leyendo eventos de Firestore:", err);
    return [];
  }
}
