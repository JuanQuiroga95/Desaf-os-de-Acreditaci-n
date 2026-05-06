"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Users, Trash2, ArrowLeft, Search, Mail, ShieldCheck } from "lucide-react";
import { getAllUsers, deleteUser } from "@/app/actions/admin";
import Link from "next/link";

export default function AdminTeachersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.role === "admin") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const u = await getAllUsers();
      setTeachers(u.filter(usr => usr.role === "TEACHER"));
    } catch (error) {
      console.error("Error cargando docentes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Seguro que querés eliminar al docente ${name}?`)) {
      await deleteUser(id);
      loadData();
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">Cargando Docentes...</div>;
  if (!user || user.role !== "admin") return <div className="p-20 text-center font-black uppercase tracking-widest text-primary">Acceso Denegado</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <Link href="/admin" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
            <ArrowLeft size={14} /> Volver al Control
          </Link>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Gestión de <span className="text-primary">Docentes</span></h1>
        </div>
        
        <div className="relative w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Buscar docente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/30 border border-border rounded-2xl py-4 pl-12 pr-4 font-bold outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-[2.5rem] p-8 hover:border-primary/50 transition-all group shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-primary font-black text-2xl group-hover:bg-primary group-hover:text-white transition-all">
                {t.name.charAt(0)}
              </div>
              <button 
                onClick={() => handleDelete(t.id, t.name)}
                className="p-3 bg-secondary rounded-xl hover:bg-red-500 hover:text-white transition-all text-muted-foreground"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <h3 className="text-xl font-black mb-2 group-hover:text-primary transition-colors">{t.name}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={14} />
                <span className="text-xs font-bold truncate">{t.email}</span>
              </div>
              <div className="flex items-center gap-2 text-green-500">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Docente Activo</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Registrado el</span>
              <span className="text-[10px] font-bold">{new Date(t.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        
        {filteredTeachers.length === 0 && (
          <div className="col-span-full p-20 text-center">
            <Users size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No se encontraron docentes</p>
          </div>
        )}
      </div>
    </div>
  );
}
