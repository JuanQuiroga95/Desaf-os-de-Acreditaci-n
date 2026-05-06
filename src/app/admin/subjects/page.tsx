"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { BookOpen, Trash2, Edit3, ArrowLeft, Search } from "lucide-react";
import { getAllSubjects, deleteSubject, getAllUsers, updateSubject } from "@/app/actions/admin";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSubjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Edit Modal
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", teacherId: "" });

  useEffect(() => {
    if (user?.role === "admin") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [s, u] = await Promise.all([getAllSubjects(), getAllUsers()]);
      setSubjects(s);
      setTeachers(u.filter(usr => usr.role === "TEACHER"));
    } catch (error) {
      console.error("Error cargando materias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Seguro que querés eliminar la materia ${name}?`)) {
      await deleteSubject(id);
      loadData();
    }
  };

  const handleEdit = (sub: any) => {
    setEditingSubject(sub);
    setEditForm({
      name: sub.name,
      description: sub.description || "",
      teacherId: sub.teacherId
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateSubject(editingSubject.id, editForm);
    if (res.success) {
      setEditingSubject(null);
      loadData();
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">Cargando Materias...</div>;
  if (!user || user.role !== "admin") return <div className="p-20 text-center font-black uppercase tracking-widest text-primary">Acceso Denegado</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <Link href="/admin" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
            <ArrowLeft size={14} /> Volver al Control
          </Link>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Gestión de <span className="text-primary">Materias</span></h1>
        </div>
        
        <div className="relative w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Buscar materia o docente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/30 border border-border rounded-2xl py-4 pl-12 pr-4 font-bold outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </header>

      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-secondary/30 border-b border-border">
            <tr>
              <th className="p-6 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Materia</th>
              <th className="p-6 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Docente Titular</th>
              <th className="p-6 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Desafíos</th>
              <th className="p-6 font-black uppercase text-[10px] tracking-widest text-muted-foreground text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredSubjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-secondary/10 transition-colors">
                <td className="p-6">
                  <p className="font-bold text-lg">{sub.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest truncate max-w-xs">{sub.description}</p>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {sub.teacher.name.charAt(0)}
                    </div>
                    <span className="font-bold">{sub.teacher.name}</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="bg-secondary px-3 py-1 rounded-full text-xs font-black">{sub._count.challenges}</span>
                </td>
                <td className="p-6 text-right space-x-2">
                  <button 
                    onClick={() => handleEdit(sub)}
                    className="p-3 bg-secondary rounded-xl hover:bg-primary hover:text-white transition-all text-muted-foreground"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(sub.id, sub.name)}
                    className="p-3 bg-secondary rounded-xl hover:bg-red-500 hover:text-white transition-all text-muted-foreground"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredSubjects.length === 0 && (
          <div className="p-20 text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No se encontraron materias</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingSubject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30">
                <h3 className="font-black uppercase italic tracking-tighter text-xl">Editar Materia</h3>
                <button onClick={() => setEditingSubject(null)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleUpdate} className="p-8 space-y-6">
                <input required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none" placeholder="Nombre de la Materia" />
                <textarea required value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none h-24" placeholder="Descripción..." />
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Docente Titular</label>
                  <select required value={editForm.teacherId} onChange={e => setEditForm({...editForm, teacherId: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none">
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl">Guardar Cambios</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
