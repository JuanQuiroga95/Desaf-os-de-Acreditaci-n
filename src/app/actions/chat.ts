"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function sendMessage(content: string, receiverId: string, subjectId?: string) {
  const session = await requireAuth(["student", "teacher", "admin"]);
  
  try {
    const message = await db.message.create({
      data: {
        content,
        senderId: session.userId,
        receiverId,
        subjectId: subjectId || null,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      }
    });

    return { success: true, message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Error sending message" };
  }
}

export async function getConversation(otherUserId: string) {
  const session = await requireAuth(["student", "teacher", "admin"]);

  try {
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.userId }
        ]
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarId: true } }
      }
    });

    // Mark as read
    await db.message.updateMany({
      where: {
        receiverId: session.userId,
        senderId: otherUserId,
        read: false
      },
      data: { read: true }
    });

    return { success: true, messages };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return { success: false, messages: [] };
  }
}

export async function getChatContacts() {
  const session = await requireAuth(["student", "teacher", "admin"]);
  const userId = session.userId;

  try {
    // Buscar con quién puede hablar el usuario dependiendo de su rol
    let contacts = [];

    if (session.role === "student") {
      // Un alumno puede hablar con los profesores de las materias en las que está inscrito
      const enrollments = await db.enrollment.findMany({
        where: { studentId: userId },
        include: { subject: { include: { teacher: true } } }
      });
      const teachers = enrollments.map(e => e.subject.teacher);
      // Eliminar duplicados
      contacts = Array.from(new Map(teachers.map(item => [item.id, item])).values());
    } else if (session.role === "teacher") {
      // Un profesor puede hablar con los alumnos inscritos en sus materias
      const subjects = await db.subject.findMany({
        where: { teacherId: userId },
        include: { enrollments: { include: { student: true } } }
      });
      const students = subjects.flatMap(s => s.enrollments.map(e => e.student));
      contacts = Array.from(new Map(students.map(item => [item.id, item])).values());
    }

    // Calcular mensajes sin leer por contacto
    const unreadCounts = await db.message.groupBy({
      by: ['senderId'],
      where: {
        receiverId: userId,
        read: false
      },
      _count: {
        id: true
      }
    });

    const unreadMap = new Map(unreadCounts.map(u => [u.senderId, u._count.id]));

    return { 
      success: true, 
      contacts: contacts.map(c => ({
        id: c.id,
        name: c.name,
        role: c.role,
        avatarId: c.avatarId,
        unreadCount: unreadMap.get(c.id) || 0
      }))
    };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return { success: false, contacts: [] };
  }
}
