"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { updateStudentForTeacher } from "@/app/actions/teacher-students";

type Student = { id: string; name: string; email: string };

export default function EditStudentModal({
  student,
  onClose,
  onSaved,
}: {
  student: Student;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await updateStudentForTeacher(student.id, { name, email });
      if (!res.success) return setError(res.error || "No se pudo guardar.");
      onSaved();
      onClose();
    } catch {
      setError("No se pudo conectar. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const input =
    "w-full bg-secondary/30 border border-border rounded-2xl py-3 px-4 font-bold outline-none focus:ring-2 focus:ring-primary/50";
  const label = "text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-student-title"
        className="bg-card border border-border rounded-[2rem] w-full max-w-md p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 id="edit-student-title" className="text-2xl font-black uppercase italic tracking-tight">
            Editar <span className="text-primary">estudiante</span>
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className={label} htmlFor="es-name">Nombre y apellido</label>
            <input id="es-name" required autoFocus value={name} onChange={(e) => setName(e.target.value)} className={input} />
          </div>
          <div>
            <label className={label} htmlFor="es-email">Correo</label>
            <input id="es-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </div>

          {error && <p className="text-sm font-bold text-red-500">{error}</p>}

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="py-3 px-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-secondary">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-white rounded-2xl py-3 px-6 font-black uppercase tracking-widest text-[11px] hover:opacity-90 disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />} Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
