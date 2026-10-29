// Catálogo de actividades interactivas. El docente las asigna a una unidad
// (modelo UnitActivity); la corrección de cada respuesta se calcula siempre
// con evaluateAnswer, en el servidor cuando la actividad se registra.

type WrongAnswer = { detail: string; code?: string };

type BaseItem = {
  id: string;
  title: string;
  /** Opciones válidas, tal como se guardan en ActivityAttempt.answer. */
  options: string[];
  answer: string;
  hint: string;
  praise: string;
  explanation: string;
  wrong: Record<string, WrongAnswer>;
  fallback: string;
};

export type PercentageItem = BaseItem & { price: number; discount: number };

export type VariableItem = BaseItem & { round: "variables" };
export type CenterItem = BaseItem & {
  round: "centro";
  measure: "moda" | "mediana" | "media";
};
export type StatisticsItem = VariableItem | CenterItem;

type ActivityBase = {
  key: string;
  title: string;
  area: string;
  topic: string;
  summary: string;
  /** Ruta de práctica libre, sin registro. */
  practiceHref: string;
  /** Errores frecuentes que se informan al docente. */
  misconceptions: Record<string, string>;
};

export type Activity =
  | (ActivityBase & { kind: "percentages"; items: PercentageItem[] })
  | (ActivityBase & { kind: "statistics"; items: StatisticsItem[] });

export type AnswerResult = {
  correct: boolean;
  misconception: string | null;
  title: string;
  detail: string;
};

export const money = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

function percentageItem(
  id: string,
  title: string,
  price: number,
  discount: number,
  options: number[],
  hint: string,
): PercentageItem {
  const savings = (price * discount) / 100;
  const answer = price - savings;
  return {
    id,
    title,
    price,
    discount,
    options: options.map(String),
    answer: String(answer),
    hint,
    praise: "¡Exacto! Separaste el ahorro del precio final.",
    explanation: `${money(price)} × ${discount} ÷ 100 = ${money(savings)} de ahorro. Al restarlo, pagás ${money(answer)}.`,
    wrong: {
      [savings]: {
        code: "ahorro",
        detail:
          "Elegiste el dinero que ahorrás. Falta restarlo del precio original para saber cuánto pagás.",
      },
    },
    fallback:
      "Calculá primero el descuento sobre el precio original y después restalo.",
  };
}

const variableOptions = ["cualitativa", "discreta", "continua"];
export const variableLabels: Record<string, string> = {
  cualitativa: "Cualitativa",
  discreta: "Cuantitativa discreta",
  continua: "Cuantitativa continua",
};

function variableItem(
  id: string,
  title: string,
  answer: "cualitativa" | "discreta" | "continua",
  explanation: string,
  hint: string,
): VariableItem {
  const wrong: Record<string, WrongAnswer> = {};
  for (const option of variableOptions) {
    if (option === answer) continue;
    if (answer === "cualitativa")
      wrong[option] = {
        code: "cualidad-numero",
        detail: "Esta variable no se expresa con números: se responde con una palabra o una categoría.",
      };
    else if (option === "cualitativa")
      wrong[option] = {
        code: "cualidad-numero",
        detail: "La respuesta es un número, así que la variable es cuantitativa. ¿Se cuenta o se mide?",
      };
    else
      wrong[option] = {
        code: "contar-medir",
        detail:
          answer === "discreta"
            ? "Se cuenta de a uno: no existen valores intermedios como 2,5."
            : "Se mide con un instrumento: entre dos valores siempre puede haber otro (por ejemplo, con decimales).",
      };
  }
  return {
    id,
    round: "variables",
    title,
    options: variableOptions,
    answer,
    hint,
    praise: `¡Bien! Es ${variableLabels[answer].toLowerCase()}.`,
    explanation,
    wrong,
    fallback: "",
  };
}

/** Libros leídos en el año por nueve estudiantes (orden en que se registraron). */
export const booksData = [2, 5, 1, 2, 8, 3, 2, 6, 7];

export const activities: Activity[] = [
  {
    key: "porcentajes-descuentos",
    kind: "percentages",
    title: "Misión descuentos",
    area: "Matemática",
    topic: "Porcentajes",
    summary: "Porcentajes: calcular el ahorro y el precio final de una oferta.",
    practiceHref: "/explorar/porcentajes",
    misconceptions: { ahorro: "confundió el ahorro con el precio final" },
    items: [
      percentageItem(
        "mochila",
        "Una mochila para empezar",
        20000,
        25,
        [5000, 15000, 18000],
        "El 25% es la cuarta parte. Dividí el precio por 4 y restá ese ahorro al precio original.",
      ),
      percentageItem(
        "auriculares",
        "Auriculares en oferta",
        30000,
        10,
        [27000, 3000, 29000],
        "Para encontrar el 10%, dividí el precio por 10. Después restá ese descuento.",
      ),
      percentageItem(
        "zapatillas",
        "La última parada: zapatillas",
        50000,
        30,
        [15000, 40000, 35000],
        "Calculá el 10% y multiplicalo por 3. Ese es el ahorro, no el precio final.",
      ),
    ],
  },
  {
    key: "estadistica-detectives",
    kind: "statistics",
    title: "Detectives de datos",
    area: "Matemática",
    topic: "Estadística",
    summary: "Estadística: clasificar variables y encontrar moda, mediana y media.",
    practiceHref: "/explorar/estadistica",
    misconceptions: {
      "cualidad-numero": "confundió variables cualitativas y cuantitativas",
      "contar-medir": "confundió variables discretas y continuas",
      "frecuencia-valor": "dio la frecuencia en lugar del valor de la moda",
      "sin-ordenar": "buscó la mediana sin ordenar los datos",
      "sin-dividir": "sumó los datos sin dividir para la media",
    },
    items: [
      variableItem(
        "deporte",
        "Deporte favorito de cada estudiante",
        "cualitativa",
        "Las respuestas son nombres: fútbol, vóley, básquet…",
        "Pensá cómo responde alguien: ¿con un número o con una palabra?",
      ),
      variableItem(
        "hermanos",
        "Cantidad de hermanos",
        "discreta",
        "Se cuenta: 0, 1, 2, 3… Nadie tiene 1,5 hermanos.",
        "¿Se cuenta o se mide? ¿Puede haber un valor entre 1 y 2?",
      ),
      variableItem(
        "altura",
        "Altura de los estudiantes del curso",
        "continua",
        "Se mide: 158 cm, 158,5 cm, 158,57 cm… siempre puede haber un valor intermedio.",
        "¿Se cuenta o se mide con una cinta métrica?",
      ),
      variableItem(
        "goles",
        "Goles de tu equipo en cada partido",
        "discreta",
        "Se cuenta gol por gol: no existen medios goles.",
        "¿Puede un equipo hacer 2,5 goles?",
      ),
      variableItem(
        "temperatura",
        "Temperatura registrada cada hora",
        "continua",
        "Se mide con un termómetro y puede tomar valores como −2,4 °C.",
        "¿Con qué instrumento se obtiene este dato?",
      ),
      variableItem(
        "transporte",
        "Medio de transporte para llegar a la escuela",
        "cualitativa",
        "Las respuestas son categorías: a pie, colectivo, bicicleta…",
        "Imaginá la respuesta de un compañero: ¿es un número?",
      ),
      {
        id: "moda",
        round: "centro",
        measure: "moda",
        title: "¿Cuál es la moda?",
        options: ["2", "3", "8"],
        answer: "2",
        hint: "La moda es el valor que más se repite. Mirá qué columna del gráfico es la más alta.",
        praise: "¡Bien! La moda es 2 libros.",
        explanation: "El 2 aparece 3 veces, más que cualquier otro valor.",
        wrong: {
          "3": {
            code: "frecuencia-valor",
            detail: "3 es cuántas veces aparece el valor más repetido. La moda es el valor, no la cantidad de veces.",
          },
          "8": { detail: "8 es el valor más alto, no el que más se repite." },
        },
        fallback: "",
      },
      {
        id: "mediana",
        round: "centro",
        measure: "mediana",
        title: "¿Cuál es la mediana?",
        options: ["8", "3", "4"],
        answer: "3",
        hint: "Primero ordená los datos de menor a mayor. Con 9 datos, la mediana es el que queda en el lugar 5.",
        praise: "¡Exacto! La mediana es 3 libros.",
        explanation: "Ordenados: 1, 2, 2, 2, 3, 5, 6, 7, 8. El dato del medio (lugar 5) es 3.",
        wrong: {
          "8": {
            code: "sin-ordenar",
            detail: "8 está en el medio de la lista original, pero antes hay que ordenar los datos.",
          },
          "4": { detail: "4 es la media (el promedio). La mediana es el dato del medio una vez ordenados." },
        },
        fallback: "",
      },
      {
        id: "media",
        round: "centro",
        measure: "media",
        title: "¿Cuál es la media?",
        options: ["36", "4", "3"],
        answer: "4",
        hint: "Sumá todos los datos y dividí por la cantidad de estudiantes (9).",
        praise: "¡Muy bien! La media es 4 libros por estudiante.",
        explanation: "2 + 5 + 1 + 2 + 8 + 3 + 2 + 6 + 7 = 36, y 36 ÷ 9 = 4.",
        wrong: {
          "36": {
            code: "sin-dividir",
            detail: "36 es la suma de todos los libros. Falta dividir por la cantidad de estudiantes.",
          },
          "3": { detail: "3 es la mediana. La media se obtiene sumando y dividiendo." },
        },
        fallback: "",
      },
    ],
  },
];

export function getActivity(key: string) {
  return activities.find((activity) => activity.key === key);
}

export function evaluateAnswer(item: BaseItem, value: string): AnswerResult {
  if (value === item.answer)
    return {
      correct: true,
      misconception: null,
      title: item.praise,
      detail: item.explanation,
    };
  const wrong = item.wrong[value];
  return {
    correct: false,
    misconception: wrong?.code ?? null,
    title: "Todavía no. Podés probar de nuevo.",
    detail: wrong?.detail ?? item.fallback,
  };
}
