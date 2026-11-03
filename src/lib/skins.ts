// Skins del personaje del Mundo. Se compran en la Tienda con monedas Videla
// y se dibujan con figuras simples (3D en el Mundo, SVG en la Tienda).

export type SkinAccessory =
  | "sombrero"
  | "antena"
  | "vincha"
  | "astronauta"
  | "orejas"
  | "mago"
  | "capa"
  | "corona";

export type Skin = {
  id: string;
  name: string;
  description: string;
  /** 0 = viene de regalo. */
  price: number;
  body: string;
  head: string;
  /** Visor o mirada: es la parte que brilla. */
  visor: string;
  /** Mochila; null si la skin no la usa (por ejemplo, la capa). */
  pack: string | null;
  /** Color del accesorio. */
  accent: string;
  accessory: SkinAccessory | null;
};

export const DEFAULT_SKIN_ID = "tecnico";

export const SKINS: Skin[] = [
  {
    id: "tecnico",
    name: "Técnico de la ciudad",
    description: "El uniforme de siempre para reparar máquinas.",
    price: 0,
    body: "#f59e0b",
    head: "#fde68a",
    visor: "#38bdf8",
    pack: "#334155",
    accent: "#38bdf8",
    accessory: null,
  },
  {
    id: "explorador",
    name: "Explorador",
    description: "Sombrero de aventura para recorrer cada barrio.",
    price: 15,
    body: "#16a34a",
    head: "#f5d0a9",
    visor: "#a3e635",
    pack: "#78350f",
    accent: "#92400e",
    accessory: "sombrero",
  },
  {
    id: "robot",
    name: "Robot neón",
    description: "Antena que brilla y visor fucsia.",
    price: 25,
    body: "#64748b",
    head: "#cbd5e1",
    visor: "#e879f9",
    pack: "#1e293b",
    accent: "#e879f9",
    accessory: "antena",
  },
  {
    id: "ninja",
    name: "Ninja del cálculo",
    description: "Silencioso y rápido con las cuentas.",
    price: 35,
    body: "#111827",
    head: "#1f2937",
    visor: "#f87171",
    pack: "#374151",
    accent: "#dc2626",
    accessory: "vincha",
  },
  {
    id: "gato",
    name: "Gato curioso",
    description: "Orejas atentas a cada pista.",
    price: 40,
    body: "#fb923c",
    head: "#fdba74",
    visor: "#4ade80",
    pack: "#7c2d12",
    accent: "#ea580c",
    accessory: "orejas",
  },
  {
    id: "astronauta",
    name: "Astronauta",
    description: "Casco espacial y mochila de oxígeno.",
    price: 50,
    body: "#f1f5f9",
    head: "#e2e8f0",
    visor: "#fbbf24",
    pack: "#f97316",
    accent: "#bae6fd",
    accessory: "astronauta",
  },
  {
    id: "mago",
    name: "Mago de los números",
    description: "Sombrero con estrella para los retos difíciles.",
    price: 60,
    body: "#7c3aed",
    head: "#fde68a",
    visor: "#c4b5fd",
    pack: "#4c1d95",
    accent: "#4c1d95",
    accessory: "mago",
  },
  {
    id: "heroe",
    name: "Superhéroe Pi",
    description: "Capa roja para salvar la ciudad.",
    price: 80,
    body: "#2563eb",
    head: "#fde68a",
    visor: "#f8fafc",
    pack: null,
    accent: "#dc2626",
    accessory: "capa",
  },
  {
    id: "leyenda",
    name: "Leyenda dorada",
    description: "Corona para quien encendió toda la ciudad.",
    price: 120,
    body: "#eab308",
    head: "#fef3c7",
    visor: "#f59e0b",
    pack: "#a16207",
    accent: "#facc15",
    accessory: "corona",
  },
];

export function getSkin(id: string | null | undefined): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}
