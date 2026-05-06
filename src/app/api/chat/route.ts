import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Eres un tutor técnico de la Escuela N° 4-012 Ing. Ricardo Videla. Tu objetivo es ayudar al alumno a razonar sobre problemas de taller y electrónica. NUNCA des la respuesta final ni el esquema completo. Si te preguntan algo directo, responde siempre con una analogía técnica de taller (ej: presión de agua para voltaje, flujo de tráfico para corriente, válvulas para resistencias). Tu tono debe ser alentador pero riguroso, como un maestro de taller experimentado.",
    });

    const result = await model.generateContent(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Falla en el taller (Error de API)" }, { status: 500 });
  }
}
