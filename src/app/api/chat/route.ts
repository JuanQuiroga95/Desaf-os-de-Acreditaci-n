import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/tour-config";
import { db } from "@/lib/db";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { messages, currentPath } = await req.json();

    // Fetch user enrollments or teacher subjects to get relevant theory materials
    const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
    
    let subjectIds: string[] = [];
    if (user?.role === "TEACHER") {
      const teacherSubjects = await db.subject.findMany({
        where: { teacherId: userId },
        select: { id: true }
      });
      subjectIds = teacherSubjects.map(s => s.id);
    } else {
      const userEnrollments = await db.enrollment.findMany({
        where: { studentId: userId },
        select: { subjectId: true }
      });
      subjectIds = userEnrollments.map(e => e.subjectId);
    }

    // Fetch standalone theory materials
    const materials = await db.material.findMany({
      where: { 
        subjectId: { in: subjectIds },
        type: "THEORY",
        visible: true
      },
      select: { title: true, content: true, subject: { select: { name: true } } }
    });

    // Fetch challenge theories
    const challenges = await db.challenge.findMany({
      where: { subjectId: { in: subjectIds } },
      select: { title: true, content: true, subject: { select: { name: true } } }
    });

    let theoryContext = "";
    materials.forEach(m => {
      theoryContext += `[Materia: ${m.subject.name}] Tema: ${m.title}\nContenido:\n${m.content}\n\n`;
    });

    challenges.forEach(c => {
      const contentObj = typeof c.content === 'string' ? JSON.parse(c.content) : c.content;
      if (contentObj && contentObj.theory) {
        theoryContext += `[Materia: ${c.subject.name}] Tema: ${c.title} (Desafío)\nContenido:\n${contentObj.theory}\n\n`;
      }
    });

    // Build the dynamic system prompt with page context
    let systemPrompt = buildSystemPrompt(currentPath);

    if (theoryContext.trim() !== "") {
      systemPrompt += `\n\nREPOSITORIO DE TEORÍA DEL ALUMNO (Usá esta información SIEMPRE que respondes dudas académicas):\n${theoryContext}`;
    }

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
