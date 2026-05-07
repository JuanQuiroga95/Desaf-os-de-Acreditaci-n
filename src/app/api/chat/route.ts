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
          content: "Eres el Tutor de Recuperación Activa Asistida de la Escuela N° 4-012 Ing. Ricardo Videla. Tu principio rector es: 'No se trata de bajar el nivel, sino de reorganizar las condiciones para que el aprendizaje sea posible'. Ayuda a los alumnos con andamiaje pedagógico real en Matemática y Lengua. NUNCA des la respuesta final directamente. Guía al alumno paso a paso, explicando errores y sugiriendo ejercicios similares. Tu tono es motivador, accesible (como para jóvenes de 14-15 años) y enfocado en el éxito visible desde el primer paso.",
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
