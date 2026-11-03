// Plano de la ciudad, compartido por la escena 3D, el minimapa y el mapa 2D.
// Coordenadas en el plano del suelo: x (izquierda/derecha), z (arriba/abajo).

import type { WorldMachine } from "@/app/actions/world";

export const WORLD_LIMIT = 17;
export const INTERACT_RADIUS = 2.8;
export const GENERATOR = { x: 0, z: 0, r: 2.2 };
export const GUIDE = { x: 3, z: 3.5, r: 0.9 };
export const SPAWN = { x: 0, z: 6 };
/** Torre de Desafíos: al norte de la plaza, al final de la calle central. */
export const TOWER = { x: 0, z: -11, r: 1.6 };
/** Clave de la torre en el aviso de "cerca de". */
export const TOWER_KEY = "__torre__";
/** Distancia para usar la puerta de la torre (es más ancha que una máquina). */
export const TOWER_INTERACT_RADIUS = INTERACT_RADIUS + 0.9;

export type District = {
  id: string;
  name: string;
  area: string;
  x: number;
  z: number;
  color: string;
  /** Sin juegos todavía: el barrio se muestra cerrado. */
  comingSoon?: boolean;
};

export const DISTRICTS: District[] = [
  { id: "matematica", name: "Barrio Matemática", area: "Matemática", x: -10, z: -3, color: "#22d3ee" },
  { id: "lengua", name: "Barrio Lengua", area: "Lengua", x: 10, z: -3, color: "#f472b6", comingSoon: true },
];

/** Lugares para las máquinas dentro de un barrio, relativos a su centro. */
const SLOTS = [
  { x: 0, z: -4 },
  { x: 0, z: 3.5 },
  { x: -4, z: -0.5 },
  { x: 3.5, z: -0.5 },
];

export type PlacedMachine = WorldMachine & { x: number; z: number; color: string };

export function placeMachines(machines: WorldMachine[]): PlacedMachine[] {
  return DISTRICTS.flatMap((d) =>
    machines
      .filter((m) => m.area === d.area)
      .slice(0, SLOTS.length)
      .map((m, i) => ({ ...m, x: d.x + SLOTS[i].x, z: d.z + SLOTS[i].z, color: d.color })),
  );
}

export function districtEnergy(district: District, placed: PlacedMachine[]) {
  const own = placed.filter((m) => m.area === district.area);
  if (!own.length) return 0;
  return own.reduce((acc, m) => acc + (m.total ? m.solved / m.total : 0), 0) / own.length;
}

export const isRepaired = (m: WorldMachine) => m.total > 0 && m.solved >= m.total;

/**
 * La torre se abre cuando el barrio que tiene juegos recupera toda su energía.
 * Si las tablas de juegos no están disponibles, queda abierta para no frenar
 * las entregas.
 */
export function towerStatus(placed: PlacedMachine[], activitiesReady: boolean) {
  const machines = placed.filter((m) => !DISTRICTS.find((d) => d.area === m.area)?.comingSoon);
  const repaired = machines.filter(isRepaired).length;
  return {
    open: !activitiesReady || !machines.length || repaired === machines.length,
    repaired,
    total: machines.length,
    pending: machines.filter((m) => !isRepaired(m)),
  };
}
