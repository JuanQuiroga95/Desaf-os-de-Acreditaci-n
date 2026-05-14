import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    console.log("PDF Extraction request received. CWD:", process.cwd());
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

    // HACK: pdf-parse v1.1.1 has a bug where it tries to open a test file at runtime.
    // It specifically looks for './test/data/05-versions-space.pdf'.
    try {
      const fs = require("fs");
      const path = require("path");
      
      const baseDir = process.cwd();
      const testDir = path.join(baseDir, "test", "data");
      const testFile = path.join(testDir, "05-versions-space.pdf");

      if (!fs.existsSync(testFile)) {
        console.log("Hack: Creating dummy PDF file to satisfy pdf-parse bug (lowercase)");
        if (!fs.existsSync(testDir)) {
          fs.mkdirSync(testDir, { recursive: true });
        }
        fs.writeFileSync(testFile, "");
      }
    } catch (e) {
      console.warn("PDF-Parse hack failed (ignoring):", e);
    }

    let extractedText = "";
    try {
      // Use dynamic require to avoid issues with some bundlers
      const pdf = require("pdf-parse");
      const data = await pdf(buffer);
      extractedText = data.text;
    } catch (parseErr: any) {
      console.error("PDF Parse specific error:", parseErr);
      
      // If it's the specific ENOENT error, give a clearer message
      if (parseErr.message && (parseErr.message.includes("ENOENT") || parseErr.message.toLowerCase().includes("05-versions-space"))) {
        throw new Error(`Error de librería (pdf-parse): No se encontró el archivo de prueba requerido. Asegúrate de que 'test/data/05-versions-space.pdf' existe en la raíz del proyecto. Detalle: ${parseErr.message}`);
      }
      
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
          content: `Eres un asistente pedagógico experto en educación secundaria. Tu tarea es convertir un texto extraído de un PDF (examen, práctico o guía de estudio) en un formato estructurado JSON.
          
          OBJETIVO: Fidelidad absoluta al contenido original. No resumas excesivamente, no simplifiques los ejercicios y mantén todos los valores numéricos y datos exactos.

          REGLAS DE EXTRACCIÓN:
          1. TÍTULO: Extrae el título principal del documento.
          2. OBJETIVO: Identifica o deduce el objetivo pedagógico (ej: "Evaluación de capacidades en álgebra y estadística").
          3. TEORÍA: Extrae el marco teórico si existe. Si el PDF solo tiene ejercicios, genera un breve resumen conceptual (4-5 líneas) que sirva de apoyo para resolver esos ejercicios específicos.
          4. PREGUNTAS:
             - Crea una entrada en "questions" por cada ejercicio principal del PDF.
             - Si un ejercicio tiene varios incisos (a, b, c...), inclúyelos todos en la misma descripción de la pregunta para mantener el contexto, o sepáralos si son muy extensos.
             - MATEMÁTICAS: Mantén las expresiones matemáticas tal cual. Usa ^ para potencias, / para fracciones y descripciones claras para raíces.
             - TABLAS Y DATOS: Si el texto contiene datos tabulares o listas de valores (ej: una tabla de frecuencias o una lista de edades), represéntalos fielmente en formato Markdown dentro del campo "question".
          5. FORMATO DE RESPUESTA:
             - "TEXT": Para la mayoría de los ejercicios de desarrollo.
             - "MULTIPLE_CHOICE": Solo si el PDF ofrece opciones explícitas.
          6. RESOLUCIÓN: En el campo "answer", proporciona la respuesta correcta o el procedimiento esperado.

          IMPORTANTE: Responde ÚNICAMENTE con el objeto JSON puro.

          Formato JSON requerido:
          {
            "title": "...",
            "objective": "...",
            "theory": "...",
            "questions": [
              {
                "id": "q1",
                "question": "Enunciado completo del ejercicio...",
                "answer": "Resolución o respuesta correcta...",
                "type": "TEXT",
                "options": []
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Texto extraído del PDF:\n\n${extractedText.slice(0, 15000)}`
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
