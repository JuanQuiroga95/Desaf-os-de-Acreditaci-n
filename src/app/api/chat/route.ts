import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres el Tutor IA de la Escuela N° 4-012 Ing. Ricardo Videla, orientado a la modalidad de Economía y Administración. Tu objetivo es ayudar al alumno a razonar sobre desafíos financieros, contables y administrativos. NUNCA des la respuesta final. Si te preguntan algo directo, responde con analogías de gestión (ej: el flujo de caja como el riego de un viñedo, el interés compuesto como el crecimiento de una parra, las deudas como el granizo). Tu tono es el de un mentor empresarial mendocino: riguroso, visionario y motivador.",
        },
        ...messages,
      ],
      model: "llama-3.3-70b-versatile",
    });

    const text = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error("Groq Chat Error:", error);
    return NextResponse.json({ error: "Falla en el taller (Error de API)" }, { status: 500 });
  }
}
