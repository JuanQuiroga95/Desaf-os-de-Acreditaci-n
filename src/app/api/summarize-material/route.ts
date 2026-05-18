import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { content, title, type } = await req.json();
  if (!content || content.length < 50) {
    return NextResponse.json({ error: "Contenido muy corto para resumir" }, { status: 400 });
  }

  const prompt = `Sos un asistente pedagógico de la Escuela N° 4-012 Ing. Ricardo Videla, Mendoza, Argentina.
Tu tarea es crear un resumen de estudio de este material "${title}" (tipo: ${type}).

MATERIAL:
${content.slice(0, 4000)}

Generá un resumen en EXACTAMENTE este formato:

## Resumen Ejecutivo
[2-3 oraciones clave del tema]

## Puntos Clave
• [punto 1]
• [punto 2]
• [punto 3]
• [punto 4 si hay]

## Para recordar en el examen
[2-3 conceptos o fórmulas más importantes, específicos y concretos]

## Preguntas de repaso
1. [pregunta 1]
2. [pregunta 2]
3. [pregunta 3]

Sé concreto, usa lenguaje accesible para estudiantes de 14-16 años, máximo 300 palabras en total.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });
    return NextResponse.json({ summary: completion.choices[0]?.message?.content || "" });
  } catch (error) {
    return NextResponse.json({ error: "Error al generar resumen" }, { status: 500 });
  }
}
