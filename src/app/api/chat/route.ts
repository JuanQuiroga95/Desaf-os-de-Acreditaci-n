import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/tour-config";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { messages, currentPath } = await req.json();

    // Build the dynamic system prompt with page context
    const systemPrompt = buildSystemPrompt(currentPath);

    // Contextualize the last user message with their current location
    // This is the "truco adivino": Brok knows exactly what the user is looking at
    const contextualizedMessages = messages.map(
      (msg: { role: string; content: string }, i: number) => {
        if (i === messages.length - 1 && msg.role === "user" && currentPath) {
          return {
            ...msg,
            content: `[Contexto actual: El usuario está en la pantalla ${currentPath}]. Mensaje del usuario: ${msg.content}`,
          };
        }
        return msg;
      }
    );

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...contextualizedMessages,
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
