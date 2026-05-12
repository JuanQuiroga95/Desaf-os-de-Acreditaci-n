import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se subió ningún archivo" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    const extractedText = data.text;

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json({ error: "No se pudo extraer texto del PDF" }, { status: 400 });
    }

    // Call Groq AI to structure the content
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres un asistente pedagógico experto. Tu tarea es extraer y estructurar el contenido de un examen o práctico en formato JSON. 
          
          Reglas:
          1. Identifica el TÍTULO del práctico.
          2. Identifica el OBJETIVO pedagógico.
          3. Extrae la TEORÍA si existe (puedes resumirla).
          4. Extrae las PREGUNTAS de validación. 
          5. Si la pregunta tiene opciones (múltiple choice), lístalas.
          6. Genera una "respuesta esperada" coherente si no está explícita.
          
          IMPORTANTE: Responde ÚNICAMENTE con el objeto JSON puro, sin markdown ni explicaciones adicionales.
          
          Formato JSON requerido:
          {
            "title": "...",
            "objective": "...",
            "theory": "...",
            "questions": [
              {
                "id": "...",
                "question": "...",
                "answer": "...",
                "type": "TEXT" | "TRUE_FALSE" | "MULTIPLE_CHOICE",
                "options": ["...", "..."]
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Texto extraído del PDF:\n\n${extractedText.slice(0, 10000)}` // Limiting to 10k chars for prompt safety
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const structuredData = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(structuredData);
  } catch (error: any) {
    console.error("PDF Extraction Error:", error);
    return NextResponse.json({ error: "Error al procesar el PDF: " + error.message }, { status: 500 });
  }
}
