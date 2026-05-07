"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { BookOpen, ArrowLeft, Users, X, Plus, Edit2, Check, Search } from "lucide-react";
import { getAllSubjects, getAllUsers, updateSubject, deleteSubject } from "@/app/actions/admin";
import { getSubjectEnrollments, enrollStudent, unenrollStudent } from "@/app/actions/enrollment";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function AdminSubjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [enrollModal, setEnrollModal] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState("");

  const [editModal, setEditModal] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", teacherId: "" });

  useEffect(() => {
    if (user?.role === "admin") loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [s, u] = await Promise.all([getAllSubjects(), getAllUsers()]);
      setSubjects(s);
      setAllUsers(u);
    } finally {
      setIsLoading(false);
    }
  };

  const openEnrollModal = async (subject: any) => {
    setEnrollModal(subject);
    setStudentSearch("");
    const res = await getSubjectEnrollments(subject.id);
    if (res.success) setEnrollments(res.enrollments || []);
  };

  const openEditModal = (subject: any) => {
    setEditModal(subject);
    setEditForm({ name: subject.name, description: subject.description || "", teacherId: subject.teacherId });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateSubject(editModal.id, editForm);
    if (res.success) {
      showToast("Materia actualizada", "success");
      setEditModal(null);
      loadData();
    } else {
      showToast("Error al actualizar", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la materia "${name}"? Se eliminarán todos sus encuentros y materiales.`)) return;
    const res = await deleteSubject(id);
    if (res.success) { showToast("Materia eliminada", "success"); loadData(); }
    else showToast("Error al eliminar", "error");
  };

  const handleEnroll = async (studentId: string) => {
    const res = await enrollStudent(studentId, enrollModal.id);
    if (res.success) {
      showToast("Alumno inscripto", "success");
      const updated = await getSubjectEnrollments(enrollModal.id);
      if (updated.success) setEnrollments(updated.enrollments || []);
    } else showToast("Error al inscribir", "error");
  };

  const handleUnenroll = async (studentId: string) => {
    const res = await unenrollStudent(studentId, enrollModal.id);
    if (res.success) {
      showToast("Alumno desinscripto", "success");
      const updated = await getSubjectEnrollments(enrollModal.id);
      if (updated.success) setEnrollments(updated.enrollments || []);
    } else showToast("Error al desinscribir", "error");
  };

  const enrolledIds = new Set(enrollments.map((e: any) => e.studentId));
  const students = allUsers.filter((u) => u.role === "STUDENT");
  const teachers = allUsers.filter((u) => u.role === "TEACHER");
  const filteredStudents = students.filter(
    (s) =>
      !enrolledIds.has(s.id) &&
      (s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  if (authLoading || isLoading)
    return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-widest text-primary">Cargando Materias...</div>;
  if (!user || user.role !== "admin") { router.push("/login"); return null; }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12">
        <Link href="/admin" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
          <ArrowLeft size={14} /> Volver al Panel Admin
        </Link>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
          Gestión de <span className="text-primary">Materias</span>
        </h1>
        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em] mt-2">
          {subjects.length} materias · Inscripción de alumnos y asignación docente
        </p>
      </header>

      <div className="space-y-4">
        {subjects.map((sub) => (
          <div key={sub.id} className="bg-card border border-border rounded-[2rem] p-8 flex items-center justify-between hover:border-primary/30 transition-all shadow-sm">
            <div className="flex items-center gap-8">
              <div className="w-14 h-14 rounded-[1.25rem] bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="font-black text-xl mb-1">{sub.name}</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                  Docente: {sub.teacher.name} · {sub._count.challenges} Encuentros · {sub.enrollments?.length ?? 0} Alumnos
                </p>
                {sub.description && <p className="text-xs text-muted-foreground mt-1 max-w-md">{sub.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => openEnrollModal(sub)} className="flex items-center gap-2 bg-secondary border border-border px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-border transition-all">
                <Users size={14} /> Alumnos
              </button>
              <button onClick={() => openEditModal(sub)} className="flex items-center gap-2 bg-secondary border border-border px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-border transition-all">
                <Edit2 size={14} /> Editar
              </button>
              <button onClick={() => handleDelete(sub.id, sub.name)} className="p-3 rounded-xl text-muted-foreground hover:bg-red-500 hover:text-white transition-all border border-border">
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
        {subjects.length === 0 && (
          <div className="p-20 text-center border-2 border-dashed border-border rounded-[2.5rem]">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No hay materias creadas aún.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30">
                <h3 className="font-black uppercase italic tracking-tighter text-xl">Editar Materia</h3>
                <button onClick={() => setEditModal(null)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
              </div>
              <form onSubmit={handleEdit} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nombre</label>
                  <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Descripción</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none h-20 focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Docente Titular</label>
                  <select value={editForm.teacherId} onChange={(e) => setEditForm({ ...editForm, teacherId: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 text-foreground" style={{ colorScheme: "dark" }}>
                    {teachers.map((t) => (<option key={t.id} value={t.id} className="bg-background">{t.name}</option>))}
                  </select>
                </div>
                <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:scale-[1.02] transition-all">Guardar Cambios</button>
              </form>
            </motion.div>
          </div>
        )}

        {enrollModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30 shrink-0">
                <div>
                  <h3 className="font-black uppercase italic tracking-tighter text-xl">Inscripción de Alumnos</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">{enrollModal.name}</p>
                </div>
                <button onClick={() => setEnrollModal(null)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Inscriptos ({enrollments.length})</h4>
                  {enrollments.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Ningún alumno inscripto aún.</p>
                  ) : (
                    <div className="space-y-2">
                      {enrollments.map((e: any) => (
                        <div key={e.id} className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-border">
                          <div>
                            <p className="font-bold text-sm">{e.student.name}</p>
                            <p className="text-[10px] text-muted-foreground">{e.student.email}</p>
                          </div>
                          <button onClick={() => handleUnenroll(e.studentId)} className="p-2 rounded-lg text-muted-foreground hover:bg-red-500 hover:text-white transition-all">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Agregar Alumnos</h4>
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <input type="text" placeholder="Buscar alumno..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="w-full bg-secondary/30 border border-border rounded-xl py-3 pl-10 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredStudents.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-4 bg-secondary/10 rounded-xl border border-border hover:border-primary/30 transition-all">
                        <div>
                          <p className="font-bold text-sm">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground">{s.email}</p>
                        </div>
                        <button onClick={() => handleEnroll(s.id)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                          <Plus size={12} /> Inscribir
                        </button>
                      </div>
                    ))}
                    {filteredStudents.length === 0 && (
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest text-center py-4">
                        {students.length === 0 ? "No hay alumnos registrados." : "Todos los alumnos ya están inscriptos."}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border shrink-0">
                <button onClick={() => setEnrollModal(null)} className="w-full py-4 bg-secondary border border-border rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-border transition-all">
                  <Check size={14} /> Listo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
