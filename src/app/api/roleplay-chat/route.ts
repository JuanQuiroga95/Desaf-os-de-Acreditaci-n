import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages, personaje, contexto } = await req.json();

    if (!messages || !personaje) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const systemPrompt = `Eres un asistente de roleplay educativo.
    Debes actuar como el siguiente personaje: ${personaje}.
    Contexto en el que te encuentras: ${contexto}.
    
    REGLAS ESTRICTAS:
    1. ¡NUNCA ROMPAS EL PERSONAJE! Actúa, habla y piensa como ${personaje} en su época y contexto.
    2. Si el alumno te hace preguntas fuera de contexto o de la época, responde confundido según tu personaje (ej. "¿Qué es un teléfono?").
    3. Trata de ser inmersivo, usa el vocabulario y tono adecuado para ${personaje}.
    4. Tus respuestas deben ser breves y permitir el diálogo (no más de 3 párrafos cortos).`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      }))
    ];

    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({ 
      content: completion.choices[0]?.message?.content || "*(No responde)*" 
    });
  } catch (error) {
    console.error("Roleplay chat error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
