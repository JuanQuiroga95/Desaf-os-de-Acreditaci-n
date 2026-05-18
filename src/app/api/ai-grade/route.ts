import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { challengeTitle, questions, answers, rubric } = await req.json();

  const prompt = `Sos un evaluador pedagógico de la Escuela N° 4-012 Ing. Ricardo Videla.
Evaluá las respuestas del alumno para el desafío "${challengeTitle}".

${rubric ? `Rúbrica de evaluación: ${rubric}` : ""}

Preguntas y respuestas del alumno:
${questions?.map((q: any, i: number) => `${i + 1}. Pregunta: ${q.question}\n   Respuesta esperada: ${q.answer}\n   Respuesta del alumno: ${answers?.[q.id] || "Sin respuesta"}`).join("\n\n") || ""}

Responde con:
1. NOTA_SUGERIDA: [número del 1 al 10]
2. JUSTIFICACION: [2-3 oraciones explicando la nota]
3. FEEDBACK_ALUMNO: [devolución motivadora y pedagógica para el alumno, máximo 3 oraciones]`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const text = completion.choices[0]?.message?.content || "";
    const notaMatch = text.match(/NOTA_SUGERIDA:\s*(\d+(?:\.\d+)?)/);
    const justMatch = text.match(/JUSTIFICACION:\s*([\s\S]+?)(?=FEEDBACK|$)/);
    const feedbackMatch = text.match(/FEEDBACK_ALUMNO:\s*([\s\S]+?)$/);

    return NextResponse.json({
      nota: notaMatch ? parseFloat(notaMatch[1]) : null,
      justificacion: justMatch ? justMatch[1].trim() : "",
      feedback: feedbackMatch ? feedbackMatch[1].trim() : text
    });
  } catch (error) {
    return NextResponse.json({ error: "Error de IA" }, { status: 500 });
  }
}
