import { Rarity } from "./lifeline";
import { IconName } from "../components/SpriteIcon";

export type RewardCategory = "points" | "life" | "lifeline" | "special";

export interface WheelPrizeDef {
  id: string;
  category: RewardCategory;
  rarity: Rarity;
  name: string;
  shortLabel: string;
  description: string;
  icon?: IconName;
  weight: number; // Peso = % exacto ya que totaliza 100
  pointsValue?: number;
  livesValue?: number;
  lifelineId?: string;
  lifelineAmount?: number;
  isStoredInBar: boolean; // false para puntos/vidas/ronda especial, true para comodines
}

export const OFFICIAL_WHEEL_PRIZES: WheelPrizeDef[] = [
  // ==========================================
  // 1. PREMIOS DIRECTOS DE PUNTOS (67% Total)
  // ==========================================
  {
    id: "points_100",
    category: "points",
    rarity: "common",
    name: "+100 Puntos",
    shortLabel: "+100 PTS",
    description: "Suma 100 puntos directamente a tu récord de la partida.",
    icon: "coins",
    weight: 18,
    pointsValue: 100,
    isStoredInBar: false,
  },
  {
    id: "points_250",
    category: "points",
    rarity: "uncommon",
    name: "+250 Puntos",
    shortLabel: "+250 PTS",
    description: "Suma 250 puntos directamente a tu récord de la partida.",
    icon: "coins",
    weight: 16,
    pointsValue: 250,
    isStoredInBar: false,
  },
  {
    id: "points_500",
    category: "points",
    rarity: "rare",
    name: "+500 Puntos",
    shortLabel: "+500 PTS",
    description: "Suma 500 puntos directamente a tu récord de la partida.",
    icon: "coins",
    weight: 15,
    pointsValue: 500,
    isStoredInBar: false,
  },
  {
    id: "points_750",
    category: "points",
    rarity: "epic",
    name: "+750 Puntos",
    shortLabel: "+750 PTS",
    description: "Gran bonificación de 750 puntos directos a tu marcador.",
    icon: "coins",
    weight: 12,
    pointsValue: 750,
    isStoredInBar: false,
  },
  {
    id: "points_1500",
    category: "points",
    rarity: "legendary",
    name: "+1.500 Puntos Supremos",
    shortLabel: "+1.500 PTS",
    description: "¡Puntuación legendaria suprema! Suma 1.500 puntos directos.",
    icon: "trophy",
    weight: 6,
    pointsValue: 1500,
    isStoredInBar: false,
  },

  // ==========================================
  // 2. PREMIOS DIRECTOS DE VIDAS (11% Total)
  // ==========================================
  {
    id: "life_1",
    category: "life",
    rarity: "uncommon",
    name: "+1 Vida Extra",
    shortLabel: "+1 VIDA",
    description: "Añade +1 corazón directamente a tu contador de vidas (hasta máx 5).",
    icon: "extraLife",
    weight: 8,
    livesValue: 1,
    isStoredInBar: false,
  },
  {
    id: "life_2",
    category: "life",
    rarity: "epic",
    name: "❤️❤️ +2 Vidas Supremas",
    shortLabel: "+2 VIDAS",
    description: "¡Recuperación mayor! Añade +2 corazones directamente (hasta máx 5).",
    icon: "extraLife",
    weight: 3,
    livesValue: 2,
    isStoredInBar: false,
  },

  // ==========================================
  // 3. COMODINES DE ACCIÓN (20% Total - Se guardan en la barra)
  // ==========================================
  {
    id: "lifeline_fifty_fifty",
    category: "lifeline",
    rarity: "common",
    name: "Comodín 50/50 (+1)",
    shortLabel: "50/50 +1",
    description: "Se guarda en tu barra. Elimina 2 opciones incorrectas cuando decidas usarlo.",
    icon: "fiftyFifty",
    weight: 3,
    lifelineId: "fiftyFifty",
    lifelineAmount: 1,
    isStoredInBar: true,
  },
  {
    id: "lifeline_skip",
    category: "lifeline",
    rarity: "common",
    name: "Comodín Saltar (+1)",
    shortLabel: "SALTAR +1",
    description: "Se guarda en tu barra. Salta la pregunta actual cuando decidas usarlo.",
    icon: "skip",
    weight: 3,
    lifelineId: "skip",
    lifelineAmount: 1,
    isStoredInBar: true,
  },
  {
    id: "lifeline_shield",
    category: "lifeline",
    rarity: "uncommon",
    name: "Comodín Escudo (+1)",
    shortLabel: "ESCUDO +1",
    description: "Se guarda en tu barra. Te protege contra un fallo cuando lo actives.",
    icon: "shield",
    weight: 3,
    lifelineId: "shield",
    lifelineAmount: 1,
    isStoredInBar: true,
  },
  {
    id: "lifeline_pista",
    category: "lifeline",
    rarity: "rare",
    name: "Comodín Pista (+1)",
    shortLabel: "PISTA +1",
    description: "Se guarda en tu barra. Resalta la opción correcta cuando decidas usarlo.",
    icon: "target",
    weight: 2,
    lifelineId: "correctAnswer",
    lifelineAmount: 1,
    isStoredInBar: true,
  },
  {
    id: "lifeline_freeze",
    category: "lifeline",
    rarity: "uncommon",
    name: "Comodín Congelar Tiempo (+1)",
    shortLabel: "CONGELAR +1",
    description: "Se guarda en tu barra. Pausa el reloj durante 15 segundos reales cuando lo actives.",
    icon: "hourglass",
    weight: 2,
    lifelineId: "freezeTime",
    lifelineAmount: 1,
    isStoredInBar: true,
  },
  {
    id: "lifeline_extra_time",
    category: "lifeline",
    rarity: "common",
    name: "Comodín Tiempo Extra (+1)",
    shortLabel: "+15s TIEMPO +1",
    description: "Se guarda en tu barra. Añade +15 segundos al reloj de la pregunta actual.",
    icon: "star",
    weight: 2,
    lifelineId: "extraTime",
    lifelineAmount: 1,
    isStoredInBar: true,
  },
  {
    id: "lifeline_double_score",
    category: "lifeline",
    rarity: "epic",
    name: "Comodín Doble Puntos (+1)",
    shortLabel: "2X PUNTOS +1",
    description: "Se guarda en tu barra. Duplica la puntuación del próximo acierto cuando lo actives.",
    icon: "coins",
    weight: 2,
    lifelineId: "doubleScore",
    lifelineAmount: 1,
    isStoredInBar: true,
  },
  {
    id: "lifeline_second_chance",
    category: "lifeline",
    rarity: "rare",
    name: "Comodín 2da Oportunidad (+1)",
    shortLabel: "2DA OPORT. +1",
    description: "Se guarda en tu barra. Te otorga un reintento si fallas la pregunta.",
    icon: "retry",
    weight: 1,
    lifelineId: "secondChance",
    lifelineAmount: 1,
    isStoredInBar: true,
  },
  {
    id: "lifeline_reveal",
    category: "lifeline",
    rarity: "common",
    name: "Comodín Revelar Opción (+1)",
    shortLabel: "DESCARTAR +1",
    description: "Se guarda en tu barra. Descarta y tacha 1 opción incorrecta garantizada.",
    icon: "book",
    weight: 1,
    lifelineId: "revealOption",
    lifelineAmount: 1,
    isStoredInBar: true,
  },
  {
    id: "lifeline_mega_shield",
    category: "lifeline",
    rarity: "legendary",
    name: "Comodín Mega Escudo (+1)",
    shortLabel: "MEGA ESCUDO +1",
    description: "Se guarda en tu barra. Protección reforzada contra 2 fallos consecutivos.",
    icon: "infinity",
    weight: 1,
    lifelineId: "megaShield",
    lifelineAmount: 1,
    isStoredInBar: true,
  },

  // ==========================================
  // 4. RONDA ESPECIAL (2% Total - Inicia al reclamar)
  // ==========================================
  {
    id: "bonus_round_event",
    category: "special",
    rarity: "legendary",
    name: "⭐ Ronda Especial de Preguntas Fáciles",
    shortLabel: "RONDA ESPECIAL",
    description: "¡Evento supremo! Inicia directamente una ronda especial de 3 preguntas fáciles con bonificación.",
    icon: "star",
    weight: 2,
    isStoredInBar: false,
  },
];
