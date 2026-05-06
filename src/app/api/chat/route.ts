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
          content: "Eres un tutor técnico de la Escuela N° 4-012 Ing. Ricardo Videla. Tu objetivo es ayudar al alumno a razonar sobre problemas de taller y electrónica. NUNCA des la respuesta final ni el esquema completo. Si te preguntan algo directo, responde siempre con una analogía técnica de taller (ej: presión de agua para voltaje, flujo de tráfico para corriente, válvulas para resistencias). Tu tono debe ser alentador pero riguroso, como un maestro de taller experimentado.",
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
