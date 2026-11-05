"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowLeft, Search, Mail, TrendingUp, UserPlus, Pencil } from "lucide-react";
import { getTeacherStudents, getTeacherSubjects } from "@/app/actions/teacher";
import EditableTitle from "@/components/teacher/EditableTitle";
import AddStudentsModal from "@/components/teacher/AddStudentsModal";
import EditStudentModal from "@/components/teacher/EditStudentModal";
import Link from "next/link";

export default function TeacherStudentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    if (user?.role === "teacher") {
      loadData();
    }
  }, [user]);

  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const [res, subs] = await Promise.all([getTeacherStudents(user!.id), getTeacherSubjects(user!.id)]);
      if (res.success) {
        setStudents(res.students || []);
      }
      setSubjects(subs.subjects || []);
    } catch (error) {
      console.error("Error cargando alumnos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">Cargando Estudiantes...</div>;
  if (!user || user.role !== "teacher") return <div className="p-20 text-center font-black uppercase tracking-widest text-primary">Acceso Denegado</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex flex-wrap gap-6 justify-between items-end">
        <div>
          <Link href="/docente" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
            <ArrowLeft size={14} /> Volver al Panel
          </Link>
          <EditableTitle titleKey="students" defaultTitle="Estudiantes" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary text-white rounded-2xl py-4 px-6 font-black uppercase tracking-widest text-[11px] hover:opacity-90 shadow-lg shadow-primary/20"
        >
          <UserPlus size={18} /> Cargar estudiantes
        </button>
        <div className="relative w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o correo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/30 border border-border rounded-2xl py-4 pl-12 pr-4 font-bold outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        </div>
      </header>

      {showAdd && (
        <AddStudentsModal subjects={subjects} onClose={() => setShowAdd(false)} onDone={() => loadData(true)} />
      )}

      {editing && (
        <EditStudentModal student={editing} onClose={() => setEditing(null)} onSaved={() => loadData(true)} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((s) => (
          <div key={s.id} className="bg-card border border-border rounded-[2.5rem] p-8 hover:border-primary/50 transition-all group shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-primary font-black text-2xl group-hover:bg-primary group-hover:text-white transition-all">
                {s.name.charAt(0)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing({ id: s.id, name: s.name, email: s.email })}
                  className="p-2 rounded-xl bg-secondary text-muted-foreground hover:bg-primary hover:text-white transition-all"
                  title="Editar nombre o correo"
                  aria-label={`Editar a ${s.name}`}
                >
                  <Pencil size={18} />
                </button>
                <div className="bg-green-500/10 text-green-500 p-2 rounded-xl">
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-black mb-1 group-hover:text-primary transition-colors">{s.name}</h3>
            <div className="flex items-center gap-2 text-muted-foreground mb-6">
              <Mail size={14} />
              <span className="text-xs font-bold truncate">{s.email}</span>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Materias en común</p>
              <div className="flex flex-wrap gap-2">
                {s.subjects.map((sub: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-secondary rounded-lg text-[9px] font-black uppercase tracking-widest border border-border">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-border flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Progreso Global</p>
                <p className="text-xl font-black">78%</p>
              </div>
              <Link 
                href={`/docente/students/${s.id}`}
                className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                Ver Legajo <ArrowLeft size={12} className="rotate-180" />
              </Link>
            </div>
          </div>
        ))}
        
        {filteredStudents.length === 0 && (
          <div className="col-span-full p-20 text-center">
            <GraduationCap size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No se encontraron estudiantes</p>
          </div>
        )}
      </div>
    </div>
  );
}
