import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  console.log("PDF Extraction request received");
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Falta GROQ_API_KEY en las variables de entorno" }, { status: 500 });
    }

    let buffer: Buffer;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const { url } = await request.json();
      if (!url) return NextResponse.json({ error: "No se proporcionó URL" }, { status: 400 });
      console.log("Fetching PDF from URL:", url);
      const res = await fetch(url);
      if (!res.ok) throw new Error("No se pudo descargar el archivo de la URL. Status: " + res.status);
      const arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      if (!file) return NextResponse.json({ error: "No se subió ningún archivo" }, { status: 400 });
      console.log("Processing uploaded file:", file.name);
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    }

    console.log("Parsing PDF buffer, length:", buffer.length);
    let extractedText = "";
    try {
      // Intentar usar PDFParse con los parámetros correctos
      const parser = new PDFParse({ data: new Uint8Array(buffer) } as any);
      const result = await parser.getText();
      extractedText = result.text;
    } catch (parseErr: any) {
      console.error("PDF Parse specific error:", parseErr);
      throw new Error("Error interno al leer el PDF: " + parseErr.message);
    }

    if (!extractedText || extractedText.trim().length < 5) {
      return NextResponse.json({ error: "El PDF parece estar vacío o no se pudo leer el texto." }, { status: 400 });
    }

    console.log("Sending text to Groq IA, length:", extractedText.length);
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
    console.log("Groq extraction successful");

    return NextResponse.json(structuredData);
  } catch (error: any) {
    console.error("PDF Extraction Global Error:", error);
    // Asegurarnos de devolver JSON incluso en errores globales
    return NextResponse.json({ 
      error: error.message || "Error desconocido al procesar el PDF",
      details: error.stack 
    }, { status: 500 });
  }
}
