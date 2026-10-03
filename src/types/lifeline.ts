import { IconName } from "../components/SpriteIcon";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface RarityInfo {
  key: Rarity;
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  glowColor: string;
}

export const RARITY_CONFIG: Record<Rarity, RarityInfo> = {
  common: {
    key: "common",
    label: "COMÚN",
    badgeBg: "bg-slate-700/80",
    badgeBorder: "border-slate-400",
    badgeText: "text-slate-200",
    glowColor: "rgba(148, 163, 184, 0.4)",
  },
  uncommon: {
    key: "uncommon",
    label: "POCO COMÚN",
    badgeBg: "bg-emerald-950/80",
    badgeBorder: "border-emerald-400",
    badgeText: "text-emerald-300",
    glowColor: "rgba(52, 211, 153, 0.5)",
  },
  rare: {
    key: "rare",
    label: "RARA",
    badgeBg: "bg-blue-950/80",
    badgeBorder: "border-blue-400",
    badgeText: "text-blue-300",
    glowColor: "rgba(96, 165, 250, 0.5)",
  },
  epic: {
    key: "epic",
    label: "ÉPICA",
    badgeBg: "bg-purple-950/80",
    badgeBorder: "border-purple-400",
    badgeText: "text-purple-300",
    glowColor: "rgba(192, 132, 252, 0.6)",
  },
  legendary: {
    key: "legendary",
    label: "LEGENDARIA",
    badgeBg: "bg-amber-950/90",
    badgeBorder: "border-amber-400",
    badgeText: "text-amber-300",
    glowColor: "rgba(251, 191, 36, 0.8)",
  },
};

export type LifelineId =
  | "fiftyFifty"
  | "skip"
  | "shield"
  | "correctAnswer"
  | "freezeTime"
  | "megaShield"
  | "secondChance"
  | "extraTime"
  | "doubleScore"
  | "revealOption";

export interface LifelineDef {
  id: LifelineId;
  slotIndex: number; // 0 a 9
  name: string;
  shortName: string;
  description: string;
  activationMessage: string;
  icon: IconName;
  rarity: Rarity;
  initialUses: number;
  whenToUse: string;
}

export const OFFICIAL_10_LIFELINES: LifelineDef[] = [
  {
    id: "fiftyFifty",
    slotIndex: 0,
    name: "50 / 50",
    shortName: "50/50",
    description: "Elimina dos opciones incorrectas de la pantalla, dejando únicamente dos respuestas posibles.",
    activationMessage: "¡50/50 ACTIVADO! Se han descartado dos opciones incorrectas.",
    icon: "fiftyFifty",
    rarity: "common",
    initialUses: 1,
    whenToUse: "Cuando dudes entre varias respuestas.",
  },
  {
    id: "skip",
    slotIndex: 1,
    name: "SALTAR PREGUNTA",
    shortName: "SALTAR",
    description: "Salta la pregunta actual sin penalización de vida y presenta una nueva pregunta.",
    activationMessage: "¡PREGUNTA SALTADA! Pasando a una nueva pregunta.",
    icon: "skip",
    rarity: "common",
    initialUses: 1,
    whenToUse: "Cuando desconozcas el tema y no quieras arriesgar una vida.",
  },
  {
    id: "shield",
    slotIndex: 2,
    name: "ESCUDO PROTECTOR",
    shortName: "ESCUDO",
    description: "Protege contra 1 fallo en la pregunta actual. Si fallas, no pierdes vida y puedes reintentar la misma pregunta.",
    activationMessage: "¡ESCUDO ACTIVO! Tu próximo fallo en esta pregunta estará protegido.",
    icon: "shield",
    rarity: "uncommon",
    initialUses: 1,
    whenToUse: "Actívalo antes de responder si tienes dudas.",
  },
  {
    id: "correctAnswer",
    slotIndex: 3,
    name: "PISTA FOCALIZADA",
    shortName: "PISTA",
    description: "Resalta con un aura dorada brillante la respuesta correcta para que puedas pulsarla.",
    activationMessage: "¡PISTA REVELADA! La respuesta correcta está resaltada en oro.",
    icon: "target",
    rarity: "rare",
    initialUses: 0,
    whenToUse: "En preguntas de alta dificultad o cuando te quede 1 sola vida.",
  },
  {
    id: "freezeTime",
    slotIndex: 4,
    name: "CONGELAR TIEMPO",
    shortName: "CONGELAR",
    description: "Detiene por completo el temporizador de la pregunta durante 15 segundos para pensar con calma.",
    activationMessage: "¡TIEMPO CONGELADO! El reloj se detiene durante 15 segundos.",
    icon: "hourglass",
    rarity: "uncommon",
    initialUses: 0,
    whenToUse: "Cuando te queden menos de 5 segundos en el reloj.",
  },
  {
    id: "megaShield",
    slotIndex: 5,
    name: "MEGA ESCUDO",
    shortName: "MEGA ESC.",
    description: "Escudo reforzado que protege contra 2 fallos consecutivos sin restar corazones.",
    activationMessage: "¡MEGA ESCUDO ACTIVO! Protección contra 2 fallos consecutivos.",
    icon: "infinity",
    rarity: "legendary",
    initialUses: 0,
    whenToUse: "Para asegurar una ronda de alta dificultad o en rondas avanzadas.",
  },
  {
    id: "secondChance",
    slotIndex: 6,
    name: "SEGUNDA OPORTUNIDAD",
    shortName: "2DA OPORT.",
    description: "Si respondes incorrectamente, no pierdes corazón y se descarta la opción errónea para un segundo intento.",
    activationMessage: "¡SEGUNDA OPORTUNIDAD ACTIVA! Tendrás un reintento si fallas.",
    icon: "retry",
    rarity: "rare",
    initialUses: 0,
    whenToUse: "Antes de arriesgar una respuesta de la que no estás 100% seguro.",
  },
  {
    id: "extraTime",
    slotIndex: 7,
    name: "TIEMPO EXTRA (+15s)",
    shortName: "+15s TIEMPO",
    description: "Añade +15 segundos adicionales al reloj de la pregunta actual.",
    activationMessage: "¡+15 SEGUNDOS AÑADIDOS! Tiempo extra disponible.",
    icon: "star",
    rarity: "common",
    initialUses: 0,
    whenToUse: "Cuando necesites más tiempo para leer o pensar las opciones.",
  },
  {
    id: "doubleScore",
    slotIndex: 8,
    name: "DOBLE PUNTUACIÓN (2X)",
    shortName: "2X PUNTOS",
    description: "Duplica los puntos ganados al acertar la pregunta activa (+200 PTS en normal, +100 PTS en bonus).",
    activationMessage: "¡2X PUNTOS ACTIVO! Tu próximo acierto otorgará puntuación doble.",
    icon: "coins",
    rarity: "epic",
    initialUses: 0,
    whenToUse: "En preguntas donde conozcas la respuesta con certeza para maximizar tu puntuación.",
  },
  {
    id: "revealOption",
    slotIndex: 9,
    name: "REVELAR OPCIÓN",
    shortName: "DESCARTAR",
    description: "Descarta y tacha inmediatamente 1 opción incorrecta garantizada.",
    activationMessage: "¡OPCIÓN DESCARTADA! Una respuesta incorrecta ha sido tachada.",
    icon: "book",
    rarity: "common",
    initialUses: 0,
    whenToUse: "Para reducir las alternativas en preguntas complejas.",
  },
];
