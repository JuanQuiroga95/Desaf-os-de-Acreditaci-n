import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { groqCompletion } from "@/lib/groq";

const TOTAL_QUESTIONS = 5;

const MAX_THEORY_CHARS = 6000;

type ChatMessage = { role: "user" | "assistant"; content: string };

function cleanMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is ChatMessage =>
        Boolean(m) &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-2 * TOTAL_QUESTIONS - 2)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 3000) }));
}

/** Teoría que cargaron los docentes, para que las preguntas sean de lo que se dio. */
async function subjectTheory(subjectId: string) {
  const [materials, challenges] = await Promise.all([
    db.material.findMany({
      where: { subjectId, type: "THEORY", visible: true },
      select: { title: true, content: true },
      orderBy: { order: "asc" },
      take: 10,
    }),
    db.challenge.findMany({
      where: { subjectId },
      select: { title: true, content: true },
      take: 10,
    }),
  ]);
  let text = "";
  for (const m of materials) text += `Tema: ${m.title}\n${m.content}\n\n`;
  for (const c of challenges) {
    const content = c.content as { theory?: unknown } | null;
    if (content && typeof content.theory === "string")
      text += `Tema: ${c.title}\n${content.theory}\n\n`;
  }
  return text.slice(0, MAX_THEORY_CHARS);
}

function aiErrorMessage(error: unknown) {
  const status = error instanceof Groq.APIError ? error.status : undefined;
  if (status === 401 || status === 403)
    return "La clave de la IA (GROQ_API_KEY) fue rechazada. Hay que revisarla en Vercel.";
  if (status === 404 || status === 400)
    return "El modelo de IA configurado no está disponible. Se puede cambiar con GROQ_MODEL en Vercel.";
  if (status === 429) return "La IA recibió muchas consultas seguidas. Esperá un minuto y reintentá.";
  return "La IA no respondió. Probá de nuevo en un momento.";
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "student")
    return NextResponse.json({ error: "Tu sesión venció. Volvé a iniciar sesión." }, { status: 401 });
  if (!process.env.GROQ_API_KEY)
    return NextResponse.json(
      { error: "El simulacro no está configurado: falta GROQ_API_KEY en el servidor." },
      { status: 503 },
    );

  const body = await req.json().catch(() => null);
  const subjectId = typeof body?.subjectId === "string" ? body.subjectId : "";
  const messages = cleanMessages(body?.messages);
  const answered = messages.filter((m) => m.role === "user").length;
  const wantsFeedback = body?.mode === "feedback" || answered >= TOTAL_QUESTIONS;

  // Mismo criterio que el resto del sistema: sin inscripciones, ve todas las materias.
  const [subject, enrollments] = await Promise.all([
    db.subject.findUnique({ where: { id: subjectId }, select: { id: true, name: true } }),
    db.enrollment.findMany({ where: { studentId: session.id }, select: { subjectId: true } }),
  ]);
  if (!subject || (enrollments.length && !enrollments.some((e) => e.subjectId === subject.id)))
    return NextResponse.json({ error: "No encontramos esa materia." }, { status: 404 });

  const theory = await subjectTheory(subject.id).catch(() => "");
  const theoryBlock = theory
    ? `\n\nTemas que cargaron los docentes (preguntá sobre esto):\n${theory}`
    : "\n\nNo hay material cargado: preguntá sobre los contenidos básicos de la materia para secundaria.";

  const school = "la Escuela N° 4-012 Ing. Ricardo Videla";
  const system = wantsFeedback
    ? `Sos un profesor de ${school} y acabás de tomar un simulacro de examen oral de "${subject.name}".
Leé todas las preguntas y respuestas del alumno y escribí la devolución final en español rioplatense, con estas secciones en markdown:
## Nota estimada (del 1 al 10, una sola cifra)
## Lo que demostraste saber
## Lo que tenés que reforzar
## Consejo para la mesa
Sé justo, concreto y alentador. Si una respuesta quedó vacía o fue "no sé", tenelo en cuenta.${theoryBlock}`
    : `Sos un profesor de ${school} tomando un simulacro de examen oral de "${subject.name}" a un alumno de secundaria.
Son ${TOTAL_QUESTIONS} preguntas en total, de a una. Ahora toca la pregunta ${answered + 1} de ${TOTAL_QUESTIONS}.
${answered === 0 ? "Empezá directo con la pregunta 1, sin presentación larga." : "Primero comentá en 1 o 2 oraciones la respuesta anterior (si estuvo mal o incompleta, corregila brevemente). Después hacé la pregunta siguiente."}
Dificultad: preguntas 1 y 2 fáciles, 3 y 4 medias, 5 difícil.
Escribí la pregunta en negrita, empezando con "**Pregunta ${answered + 1}:**". Hacé una sola pregunta y no reveles su respuesta.
Usá español rioplatense. Para fórmulas usá $...$.${theoryBlock}`;

  const history: ChatMessage[] = messages.length
    ? messages
    : [{ role: "user", content: "Hola, estoy listo para empezar el simulacro." }];
  if (wantsFeedback)
    history.push({ role: "user", content: "Terminé las preguntas. Dame la devolución final." });

  let lastError: unknown = new Error("Respuesta vacía");
  try {
    const completion = await groqCompletion({
      messages: [{ role: "system", content: system }, ...history],
      temperature: 0.6,
      max_tokens: wantsFeedback ? 1200 : 600,
    });
    const content = completion.choices[0]?.message?.content?.trim();
    if (content)
      return NextResponse.json({
        content,
        question: wantsFeedback ? TOTAL_QUESTIONS : answered + 1,
        done: wantsFeedback,
      });
  } catch (error) {
    lastError = error;
  }
  return NextResponse.json({ error: aiErrorMessage(lastError) }, { status: 502 });
}
