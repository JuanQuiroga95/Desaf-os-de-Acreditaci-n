"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Users, ArrowLeft, BookOpen, X, Edit2, Mail } from "lucide-react";
import { getAllUsers, getAllSubjects, updateUser, deleteUser } from "@/app/actions/admin";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function AdminTeachersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editModal, setEditModal] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  useEffect(() => {
    if (user?.role === "admin") loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [u, s] = await Promise.all([getAllUsers(), getAllSubjects()]);
      setTeachers(u.filter((usr: any) => usr.role === "TEACHER"));
      setSubjects(s);
    } finally {
      setIsLoading(false);
    }
  };

  const openEdit = (teacher: any) => {
    setEditModal(teacher);
    setEditForm({ name: teacher.name, email: teacher.email });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateUser(editModal.id, editForm);
    if (res.success) {
      showToast("Docente actualizado", "success");
      setEditModal(null);
      loadData();
    } else {
      showToast("Error al actualizar", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar al docente "${name}"?`)) return;
    const res = await deleteUser(id);
    if (res.success) { showToast("Docente eliminado", "success"); loadData(); }
    else showToast("Error al eliminar", "error");
  };

  const getTeacherSubjects = (teacherId: string) =>
    subjects.filter((s: any) => s.teacherId === teacherId);

  if (authLoading || isLoading)
    return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-widest text-primary">Cargando Docentes...</div>;
  if (!user || user.role !== "admin") { router.push("/login"); return null; }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12">
        <Link href="/admin" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
          <ArrowLeft size={14} /> Volver al Panel Admin
        </Link>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
          Gestión de <span className="text-primary">Docentes</span>
        </h1>
        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em] mt-2">
          {teachers.length} docentes registrados · Para agregar uno, usá "Nuevo Usuario" en el panel admin
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((t) => {
          const mySubjects = getTeacherSubjects(t.id);
          return (
            <div key={t.id} className="bg-card border border-border rounded-[2.5rem] p-8 hover:border-primary/30 transition-all shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-2xl">
                  {t.name.charAt(0)}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(t)} className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-secondary transition-all border border-border">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(t.id, t.name)} className="p-2 rounded-xl text-muted-foreground hover:bg-red-500 hover:text-white transition-all border border-border">
                    <X size={14} />
                  </button>
                </div>
              </div>

              <h3 className="font-black text-xl mb-1">{t.name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <Mail size={12} />
                <span className="text-xs font-bold truncate">{t.email}</span>
              </div>

              <div className="mt-auto">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Materias asignadas</p>
                {mySubjects.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic">Sin materias asignadas</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {mySubjects.map((s: any) => (
                      <span key={s.id} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest border border-primary/20 flex items-center gap-1">
                        <BookOpen size={10} /> {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {teachers.length === 0 && (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-border rounded-[2.5rem]">
            <Users className="mx-auto mb-4 text-muted-foreground opacity-20" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No hay docentes registrados.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30">
                <h3 className="font-black uppercase italic tracking-tighter text-xl">Editar Docente</h3>
                <button onClick={() => setEditModal(null)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
              </div>
              <form onSubmit={handleEdit} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nombre</label>
                  <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Email</label>
                  <input required type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:scale-[1.02] transition-all">Guardar Cambios</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
