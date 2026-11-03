// Reglas de experiencia, nivel y monedas. Todo se calcula con datos reales
// registrados en el servidor: desafíos entregados y retos acertados en juegos
// publicados por el docente. La práctica libre no suma.

/** Monedas por acertar un reto de juego por primera vez (un desafío entregado da 10). */
export const ACTIVITY_ITEM_COINS = 2;
/** Premio único por completar todos los retos de un juego (máquina reparada). */
export const GAME_COMPLETE_BONUS = 10;
/** Experiencia por desafío entregado. */
export const XP_PER_CHALLENGE = 50;
/** Experiencia por reto de juego acertado (una vez por reto). */
export const XP_PER_ACTIVITY_ITEM = 10;
/** Experiencia necesaria para subir cada nivel. */
export const XP_PER_LEVEL = 100;

export function levelFromXp(xp: number) {
  const safe = Math.max(0, Math.floor(xp));
  return {
    xp: safe,
    level: Math.floor(safe / XP_PER_LEVEL) + 1,
    xpInLevel: safe % XP_PER_LEVEL,
    xpPerLevel: XP_PER_LEVEL,
  };
}
