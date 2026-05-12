import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    let buffer: Buffer;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const { url } = await request.json();
      if (!url) return NextResponse.json({ error: "No se proporcionó URL" }, { status: 400 });
      const res = await fetch(url);
      if (!res.ok) throw new Error("No se pudo descargar el archivo de la URL");
      const arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      if (!file) return NextResponse.json({ error: "No se subió ningún archivo" }, { status: 400 });
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parser = new PDFParse({ data: buffer } as any);
    const result = await parser.getText();
    const extractedText = result.text;

    if (!extractedText || extractedText.trim().length < 5) {
      return NextResponse.json({ error: "No se pudo extraer texto del PDF" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres un asistente pedagógico experto. Tu tarea es extraer y estructurar el contenido de un examen o práctico en formato JSON.

          Reglas:
          1. Identifica el TÍTULO del práctico.
          2. Identifica el OBJETIVO pedagógico.
          3. Extrae la TEORÍA si existe (podés resumirla).
          4. Extrae las PREGUNTAS de validación.
          5. Si la pregunta tiene opciones (múltiple choice), listalas.
          6. Genera una "respuesta esperada" coherente si no está explícita.

          IMPORTANTE: Responde ÚNICAMENTE con el objeto JSON puro, sin markdown ni explicaciones adicionales.

          Formato JSON requerido:
          {
            "title": "...",
            "objective": "...",
            "theory": "...",
            "questions": [
              {
                "id": "q1",
                "question": "...",
                "answer": "...",
                "type": "TEXT",
                "options": []
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Texto extraído del PDF:\n\n${extractedText.slice(0, 12000)}`
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
