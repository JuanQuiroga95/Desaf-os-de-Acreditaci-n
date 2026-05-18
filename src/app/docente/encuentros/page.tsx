"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users2,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Calendar,
  MapPin,
  Laptop,
} from "lucide-react";
import {
  createEncounter,
  updateEncounterStatus,
  deleteEncounter,
  getEncountersBySubject,
} from "@/app/actions/encounters";
import { getTeacherSubjects, getSubjectStudents } from "@/app/actions/teacher";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  COMPLETED: { label: "Completado", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  ABSENT: { label: "Ausente", color: "bg-red-500/10 text-red-500 border-red-500/20" },
};

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  PRESENCIAL: { label: "Presencial", icon: <MapPin size={12} /> },
  VIRTUAL: { label: "Virtual", icon: <Laptop size={12} /> },
};

export default function EncuentrosPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [encounters, setEncounters] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEncounters, setIsLoadingEncounters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    studentId: "",
    date: new Date().toISOString().split("T")[0],
    type: "PRESENCIAL",
    status: "PENDING",
    notes: "",
  });

  useEffect(() => {
    if (user?.role === "teacher" && user?.id) {
      loadSubjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedSubjectId) {
      loadEncounters();
      loadStudents();
    } else {
      setEncounters([]);
      setStudents([]);
    }
  }, [selectedSubjectId]);

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      const res = await getTeacherSubjects(user!.id);
      if (res.success) {
        setSubjects(res.subjects);
        if (res.subjects.length > 0) {
          setSelectedSubjectId(res.subjects[0].id);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadEncounters = async () => {
    if (!selectedSubjectId) return;
    setIsLoadingEncounters(true);
    try {
      const res = await getEncountersBySubject(selectedSubjectId);
      if (res.success) setEncounters(res.encounters);
    } finally {
      setIsLoadingEncounters(false);
    }
  };

  const loadStudents = async () => {
    if (!selectedSubjectId) return;
    const res = await getSubjectStudents(selectedSubjectId);
    if (res.success) setStudents(res.students);
  };

  const handleCreateEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !selectedSubjectId) return;
    setSubmitting(true);
    try {
      const res = await createEncounter({
        ...form,
        subjectId: selectedSubjectId,
        teacherId: user!.id,
      });
      if (res.success) {
        setShowModal(false);
        setForm({
          studentId: "",
          date: new Date().toISOString().split("T")[0],
          type: "PRESENCIAL",
          status: "PENDING",
          notes: "",
        });
        loadEncounters();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateEncounterStatus(id, status);
    loadEncounters();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este encuentro?")) return;
    await deleteEncounter(id);
    loadEncounters();
  };

  if (authLoading || isLoading)
    return (
      <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">
        Cargando Encuentros RAA...
      </div>
    );
  if (!user || user.role !== "teacher")
    return (
      <div className="p-20 text-center font-black uppercase tracking-widest text-primary">
        Acceso Denegado
      </div>
    );

  const total = encounters.length;
  const completed = encounters.filter((e) => e.status === "COMPLETED").length;
  const absent = encounters.filter((e) => e.status === "ABSENT").length;
  const pending = encounters.filter((e) => e.status === "PENDING").length;

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12">
        <Link
          href="/docente"
          className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline"
        >
          <ArrowLeft size={14} /> Volver al Panel Docente
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
              Encuentros <span className="text-primary">RAA</span>
            </h1>
            <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em] mt-2">
              Recuperación Activa Asistida
            </p>
          </div>
          {selectedSubjectId && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary text-primary-foreground px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-primary/30"
            >
              <Plus size={18} />
              Nuevo Encuentro
            </button>
          )}
        </div>
      </header>

      {/* Subject Selector */}
      <div className="mb-8">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
          Materia
        </label>
        {subjects.length === 0 ? (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            No tenés materias asignadas.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                  selectedSubjectId === sub.id
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSubjectId && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total", value: total, color: "text-foreground", bg: "bg-secondary/20" },
              { label: "Completados", value: completed, color: "text-green-600", bg: "bg-green-500/10" },
              { label: "Ausentes", value: absent, color: "text-red-500", bg: "bg-red-500/10" },
              { label: "Pendientes", value: pending, color: "text-yellow-500", bg: "bg-yellow-500/10" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`${stat.bg} border border-border rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-sm`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                  {stat.label}
                </p>
                <p className={`text-4xl font-black italic ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Encounters Table */}
          <section className="bg-card border border-border rounded-[3rem] p-10 shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-8 flex items-center gap-3">
              <Users2 size={16} />
              Registro de Encuentros
            </h2>

            {isLoadingEncounters ? (
              <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                Cargando...
              </div>
            ) : encounters.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-[2.5rem]">
                <Users2 className="mx-auto mb-4 text-muted-foreground opacity-20" size={48} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  No hay encuentros registrados para esta materia.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-6 bg-primary/10 text-primary px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                >
                  <Plus size={12} className="inline mr-2" />
                  Registrar primer encuentro
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {encounters.map((enc) => {
                  const statusInfo = STATUS_LABELS[enc.status] ?? STATUS_LABELS.PENDING;
                  const typeInfo = TYPE_LABELS[enc.type] ?? TYPE_LABELS.VIRTUAL;
                  return (
                    <motion.div
                      key={enc.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-6 bg-secondary/10 rounded-[2rem] border border-border hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-[1rem] bg-primary/10 text-primary flex items-center justify-center font-black text-lg shrink-0">
                          {enc.student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-base leading-tight mb-1">{enc.student.name}</p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(enc.date).toLocaleDateString("es-AR")}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                              {typeInfo.icon}
                              {typeInfo.label}
                            </span>
                            {enc.notes && (
                              <span className="text-[9px] text-muted-foreground italic max-w-xs truncate">
                                {enc.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                        {enc.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleStatusChange(enc.id, "COMPLETED")}
                            title="Marcar completado"
                            className="p-2 rounded-xl text-muted-foreground hover:bg-green-500/10 hover:text-green-600 transition-all border border-border"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        {enc.status !== "ABSENT" && (
                          <button
                            onClick={() => handleStatusChange(enc.id, "ABSENT")}
                            title="Marcar ausente"
                            className="p-2 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all border border-border"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        {enc.status !== "PENDING" && (
                          <button
                            onClick={() => handleStatusChange(enc.id, "PENDING")}
                            title="Marcar pendiente"
                            className="p-2 rounded-xl text-muted-foreground hover:bg-yellow-500/10 hover:text-yellow-500 transition-all border border-border"
                          >
                            <Clock size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(enc.id)}
                          className="p-2 rounded-xl text-muted-foreground hover:bg-red-500 hover:text-white transition-all border border-border"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* Modal Nuevo Encuentro */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30">
                <div>
                  <h3 className="font-black uppercase italic tracking-tighter text-xl">Nuevo Encuentro</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                    Recuperación Activa Asistida
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateEncounter} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                    Alumno *
                  </label>
                  {students.length === 0 ? (
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground p-4 bg-secondary/30 rounded-xl border border-border">
                      No hay alumnos inscriptos en esta materia.
                    </p>
                  ) : (
                    <select
                      required
                      value={form.studentId}
                      onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                      className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      style={{ colorScheme: "dark" }}
                    >
                      <option value="" className="bg-background">
                        Seleccionar alumno...
                      </option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id} className="bg-background">
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                    Fecha *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                      Tipo
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      style={{ colorScheme: "dark" }}
                    >
                      <option value="PRESENCIAL" className="bg-background">Presencial</option>
                      <option value="VIRTUAL" className="bg-background">Virtual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                      Estado
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      style={{ colorScheme: "dark" }}
                    >
                      <option value="PENDING" className="bg-background">Pendiente</option>
                      <option value="COMPLETED" className="bg-background">Completado</option>
                      <option value="ABSENT" className="bg-background">Ausente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    placeholder="Observaciones del encuentro..."
                    className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || students.length === 0}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {submitting ? "Registrando..." : "Registrar Encuentro"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
