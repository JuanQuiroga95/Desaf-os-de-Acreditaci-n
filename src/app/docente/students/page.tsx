"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Users, Search, BookOpen, GraduationCap, Mail, ArrowRight } from "lucide-react";
import { getTeacherStudents } from "@/app/actions/teacher";

export default function TeacherStudentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getTeacherStudents(user!.id);
      if (res.success) {
        setStudents(res.students || []);
      }
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-widest text-primary">Cargando Lista de Alumnos...</div>;

  if (!user || user?.role !== "teacher") { router.push("/login"); return null; }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-6xl font-black tracking-tighter mb-2 uppercase italic leading-none">Tus <span className="text-primary">Alumnos</span></h1>
          <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em]">Seguimiento de Trayectorias Escolares</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-6 font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
          />
        </div>
      </header>

      {filteredStudents.length === 0 ? (
        <div className="p-20 text-center border-2 border-dashed border-border rounded-[3rem] bg-secondary/10">
          <Users className="mx-auto mb-6 text-muted-foreground opacity-30" size={64} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No se encontraron alumnos vinculados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm hover:border-primary/50 transition-all group relative overflow-hidden">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-secondary flex items-center justify-center font-black text-2xl text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black leading-tight group-hover:text-primary transition-colors">{student.name}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-2 mt-1">
                    <GraduationCap size={12} className="text-primary" />
                    Estudiante Técnico
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail size={16} />
                  <span className="text-xs font-medium truncate">{student.email}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.subjects.map((sub: string, i: number) => (
                    <span key={i} className="text-[8px] font-black uppercase tracking-widest bg-secondary px-3 py-1.5 rounded-full border border-border">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50 hover:bg-primary hover:text-white transition-all group/btn">
                <span className="text-[10px] font-black uppercase tracking-widest">Ver Expediente</span>
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
