import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SubjectHeaderProps {
  subject: any;
}

export function SubjectHeader({ subject }: SubjectHeaderProps) {
  return (
    <header className="mb-12">
      <Link href="/" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
        <ArrowLeft size={14} /> Volver a Mis Materias
      </Link>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">{subject?.name || "Materia no encontrada"}</h1>
          <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em] mt-2">
            Docente: {subject?.teacher?.name || "Desconocido"} • Modelo: Recuperación Activa Asistida
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Estado Académico</span>
          <p className="text-2xl font-black italic uppercase">En Curso</p>
        </div>
      </div>
    </header>
  );
}
