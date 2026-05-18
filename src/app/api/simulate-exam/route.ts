import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { messages, subjectName, mode } = await req.json();

  const systemPrompt =
    mode === "feedback"
      ? `Sos un profesor evaluador de la Escuela N° 4-012 Ing. Ricardo Videla evaluando una mesa de examen de "${subjectName}".
       Revisaste todas las respuestas del alumno y debés dar una devolución final detallada:
       1. Una nota estimada del 1 al 10
       2. Qué demostró saber bien
       3. Qué aspectos necesita reforzar
       4. Un consejo pedagógico final
       Sé justo, específico y alentador. Usá formato con secciones claras.`
      : `Sos un profesor tomando mesa de examen oral de "${subjectName}" en la Escuela N° 4-012 Ing. Ricardo Videla.
       Tu tarea: hacer UNA pregunta por vez sobre los temas de la materia, esperar la respuesta, y hacer la siguiente pregunta.
       Hacé 5 preguntas en total variando dificultad (2 fáciles, 2 medias, 1 difícil).
       Después de cada respuesta del alumno: "Ok, siguiente pregunta:" o si la respuesta es incorrecta: breve corrección + siguiente pregunta.
       Cuando hayas hecho las 5 preguntas, escribí exactamente "SIMULACRO_COMPLETO" como última línea.
       Empezá con la primera pregunta directamente, sin presentación larga.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      model: "llama-3.3-70b-versatile",
    });
    return NextResponse.json({ content: completion.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error("Simulate exam error:", error);
    return NextResponse.json({ error: "Error de API" }, { status: 500 });
  }
}
