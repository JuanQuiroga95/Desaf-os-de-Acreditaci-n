// Catálogo de actividades interactivas. El docente las asigna a una unidad
// (modelo UnitActivity); la corrección de cada respuesta se calcula siempre
// con evaluateAnswer, en el servidor cuando la actividad se registra.

export type ActivityItem = {
  id: string;
  title: string;
  price: number;
  discount: number;
  options: number[];
  answer: number;
  hint: string;
};

export type Activity = {
  key: string;
  title: string;
  area: string;
  summary: string;
  items: ActivityItem[];
};

export type AnswerResult = {
  correct: boolean;
  /** Error frecuente detectado: eligió el ahorro en lugar del precio final. */
  misconception: "savings" | null;
  title: string;
  detail: string;
};

export const money = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

export const activities: Activity[] = [
  {
    key: "porcentajes-descuentos",
    title: "Misión descuentos",
    area: "Matemática",
    summary: "Porcentajes: calcular el ahorro y el precio final de una oferta.",
    items: [
      {
        id: "mochila",
        title: "Una mochila para empezar",
        price: 20000,
        discount: 25,
        options: [5000, 15000, 18000],
        answer: 15000,
        hint: "El 25% es la cuarta parte. Dividí el precio por 4 y restá ese ahorro al precio original.",
      },
      {
        id: "auriculares",
        title: "Auriculares en oferta",
        price: 30000,
        discount: 10,
        options: [27000, 3000, 29000],
        answer: 27000,
        hint: "Para encontrar el 10%, dividí el precio por 10. Después restá ese descuento.",
      },
      {
        id: "zapatillas",
        title: "La última parada: zapatillas",
        price: 50000,
        discount: 30,
        options: [15000, 40000, 35000],
        answer: 35000,
        hint: "Calculá el 10% y multiplicalo por 3. Ese es el ahorro, no el precio final.",
      },
    ],
  },
];

export function getActivity(key: string) {
  return activities.find((activity) => activity.key === key);
}

export function evaluateAnswer(item: ActivityItem, value: number): AnswerResult {
  const savings = (item.price * item.discount) / 100;
  if (value === item.answer)
    return {
      correct: true,
      misconception: null,
      title: "¡Exacto! Separaste el ahorro del precio final.",
      detail: `${money(item.price)} × ${item.discount} ÷ 100 = ${money(savings)} de ahorro. Al restarlo, pagás ${money(item.answer)}.`,
    };
  if (value === savings)
    return {
      correct: false,
      misconception: "savings",
      title: "Todavía no. Podés probar de nuevo.",
      detail:
        "Elegiste el dinero que ahorrás. Falta restarlo del precio original para saber cuánto pagás.",
    };
  return {
    correct: false,
    misconception: null,
    title: "Todavía no. Podés probar de nuevo.",
    detail:
      "Calculá primero el descuento sobre el precio original y después restalo.",
  };
}
