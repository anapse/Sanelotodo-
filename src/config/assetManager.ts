/**
 * GESTOR CENTRALIZADO DE ASSETS Y SPRITES OFICIALES - ¿SABELOTODO?
 *
 * Mapeo directo a la carpeta /public/assets/sprites/ con las imágenes oficiales
 * subidas por el usuario:
 * - /assets/sprites/logo.png (Logo Oficial)
 * - /assets/sprites/ruleta.png (Ilustración Oficial de la Ruleta)
 * - /assets/sprites/iconos1.png (Hoja de Iconos 1)
 * - /assets/sprites/iconos2.png (Hoja de Iconos 2)
 * - /assets/sprites/fondo.png (Fondo Oficial del Juego)
 */

export interface AssetStatus {
  id: string;
  name: string;
  category: "logo" | "fondo" | "sprite" | "comodines" | "premios" | "vidas" | "ruleta" | "decoracion" | "ui";
  description: string;
  isProvided: boolean;
  spritePath: string;
}

/**
 * Resuelve la ruta relativa a la base pública de la aplicación (Soporta GitHub Pages subpaths).
 */
export function resolvePublicAssetPath(path: string): string {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const baseUrl = import.meta.env.BASE_URL || "/";
  return baseUrl.endsWith("/") ? `${baseUrl}${cleanPath}` : `${baseUrl}/${cleanPath}`;
}

export const OFFICIAL_SPRITES: Record<string, AssetStatus> = {
  logo: {
    id: "logo",
    name: "Logo Oficial ¿SABELOTODO?",
    category: "logo",
    description: "Logo oficial tridimensional en dorado y azul con planeta tierra y libro del saber.",
    isProvided: true,
    spritePath: resolvePublicAssetPath("/assets/sprites/logo.png"),
  },
  ruleta: {
    id: "ruleta",
    name: "Ruleta Oficial de Premios",
    category: "ruleta",
    description: "Asset e ilustración oficial de la ruleta de premios.",
    isProvided: true,
    spritePath: resolvePublicAssetPath("/assets/sprites/ruleta.png"),
  },
  iconos1: {
    id: "iconos1",
    name: "Hoja de Iconos Brillantes 1",
    category: "sprite",
    description: "Hoja oficial de iconos para comodines, ruleta, vidas y trofeos.",
    isProvided: true,
    spritePath: resolvePublicAssetPath("/assets/sprites/iconos1.png"),
  },
  iconos2: {
    id: "iconos2",
    name: "Hoja de Iconos Brillantes 2",
    category: "sprite",
    description: "Segunda hoja oficial de iconos brillantes para la trivia.",
    isProvided: true,
    spritePath: resolvePublicAssetPath("/assets/sprites/iconos2.png"),
  },
  background: {
    id: "background",
    name: "Fondo Oficial del Juego",
    category: "fondo",
    description: "Fondo principal de la interfaz con libro del saber, estantes y globos terráqueos.",
    isProvided: true,
    spritePath: resolvePublicAssetPath("/assets/sprites/fondo.png"),
  },
  peinecito: {
    id: "peinecito",
    name: "Sprite del Peinecito",
    category: "sprite",
    description: "Sprite oficial independiente para el peinecito.",
    isProvided: false,
    spritePath: resolvePublicAssetPath("/assets/sprites/peinecito.png"),
  },
};

export const SPRITE_RESOURCES = {
  logo: OFFICIAL_SPRITES.logo.spritePath,
  ruleta: OFFICIAL_SPRITES.ruleta.spritePath,
  iconos1: OFFICIAL_SPRITES.iconos1.spritePath,
  iconos2: OFFICIAL_SPRITES.iconos2.spritePath,
  background: OFFICIAL_SPRITES.background.spritePath,
  fiftyFifty: { name: "50/50", spritePath: OFFICIAL_SPRITES.iconos1.spritePath },
  skip: { name: "SALTAR", spritePath: OFFICIAL_SPRITES.iconos1.spritePath },
  shield: { name: "ESCUDO", spritePath: OFFICIAL_SPRITES.iconos1.spritePath },
  correctAnswer: { name: "RESPUESTA CORRECTA", spritePath: OFFICIAL_SPRITES.iconos1.spritePath },
  extraLife: { name: "VIDA EXTRA", spritePath: OFFICIAL_SPRITES.iconos1.spritePath },
  peinecito: { name: "PEINECITO", spritePath: OFFICIAL_SPRITES.peinecito.spritePath },
};
