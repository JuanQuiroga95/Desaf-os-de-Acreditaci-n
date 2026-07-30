"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  X,
  FileText,
  Video,
  Dumbbell,
  Users2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Upload,
  Link2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { getTeacherSubjects, getSubjectStudents } from "@/app/actions/teacher";
import { getUnitsBySubject, createUnit, deleteUnit } from "@/app/actions/units";
import { createMaterial, deleteMaterial } from "@/app/actions/material";
import { createEncounter, deleteEncounter, updateEncounterStatus } from "@/app/actions/encounters";
import { createChallenge, deleteChallenge } from "@/app/actions/admin";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@supabase/supabase-js";

export default function UnidadesPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center animate-pulse text-primary font-black">Cargando...</div>}>
      <UnidadesContent />
    </Suspense>
  );
}

function UnidadesContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const initialSubjectId = searchParams.get("subjectId");

  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || "");
  const [units, setUnits] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI states
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState<{ unitId: string; type: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Forms
  const [unitForm, setUnitForm] = useState({ name: "", description: "" });
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editUnitName, setEditUnitName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const [itemForm, setItemForm] = useState({
    title: "", content: "", level: "BASICO", type: "VIRTUAL", date: new Date().toISOString().split("T")[0],
    studentId: "", status: "PENDING", videoMode: "url" as "url" | "file", file: null as File | null,
    images: [] as File[]
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.role === "teacher" && user?.id) loadSubjects();
  }, [user]);

  useEffect(() => {
    if (selectedSubjectId) {
      loadUnits();
      loadStudents();
    } else {
      setUnits([]);
      setStudents([]);
    }
  }, [selectedSubjectId]);

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      const res = await getTeacherSubjects(user!.id);
      if (res.success) {
        setSubjects(res.subjects);
        if (res.subjects.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(res.subjects[0].id);
        }
      }
    } finally { setIsLoading(false); }
  };

  const loadUnits = async () => {
    if (!selectedSubjectId) return;
    const res = await getUnitsBySubject(selectedSubjectId);
    if (res.success) setUnits(res.units);
  };

  const loadStudents = async () => {
    if (!selectedSubjectId) return;
    const res = await getSubjectStudents(selectedSubjectId);
    if (res.success) setStudents(res.students);
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.name || !selectedSubjectId) return;
    setIsSubmitting(true);
    try {
      const order = units.length;
      const res = await createUnit({ ...unitForm, order, subjectId: selectedSubjectId });
      if (res.success) {
        setShowUnitModal(false);
        setUnitForm({ name: "", description: "" });
        loadUnits();
        showToast("Unidad creada", "success");
      }
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm("¿Eliminar esta unidad y TODO su contenido?")) return;
    await deleteUnit(id, selectedSubjectId);
    loadUnits();
  };

  const handleUpdateUnitName = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editUnitName.trim() || !selectedSubjectId) return;
    e.stopPropagation();
    setIsSavingName(true);
    try {
      const { updateUnit } = await import("@/app/actions/units");
      const res = await updateUnit(id, selectedSubjectId, { name: editUnitName.trim() });
      if (res.success) {
        showToast("Nombre de unidad actualizado", "success");
        setEditingUnitId(null);
        loadUnits();
      } else {
        showToast("Error al actualizar el nombre", "error");
      }
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("¿Eliminar este material?")) return;
    await deleteMaterial(id, selectedSubjectId);
    loadUnits();
  };
  
  const handleDeleteChallenge = async (id: string) => {
    if (!confirm("¿Eliminar este ejercicio?")) return;
    await deleteChallenge(id, selectedSubjectId);
    loadUnits();
  };

  const handleDeleteEncounter = async (id: string) => {
    if (!confirm("¿Eliminar este encuentro?")) return;
    await deleteEncounter(id);
    loadUnits();
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showItemModal || !selectedSubjectId) return;
    setIsSubmitting(true);
    
    try {
      const { unitId, type } = showItemModal;
      let fileUrl: string | undefined;
      const imageUrls: string[] = [];

      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      // Upload main file if needed (Video/Theory)
      if (itemForm.file) {
        const fileExt = itemForm.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error } = await supabase.storage.from('materiales').upload(fileName, itemForm.file);
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage.from('materiales').getPublicUrl(fileName);
        fileUrl = publicUrlData.publicUrl;
      }
      
      // Upload multiple images if needed (Exercise/Encounter)
      for (const img of itemForm.images) {
        const fileExt = img.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error } = await supabase.storage.from('materiales').upload(fileName, img);
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage.from('materiales').getPublicUrl(fileName);
        imageUrls.push(publicUrlData.publicUrl);
      }

      if (type === "THEORY" || type === "VIDEO" || type === "TP_TEMPLATE") {
        const content = type === "VIDEO" && itemForm.videoMode === "url" ? itemForm.content : itemForm.content;
        await createMaterial({
          subjectId: selectedSubjectId, type: type as any, title: itemForm.title, content, fileUrl, unitId
        });
      } else if (type === "EXERCISE") {
        await createChallenge(
          selectedSubjectId, itemForm.title, itemForm.content, {}, "REGULAR", undefined, unitId, imageUrls
        );
      } else if (type === "ENCOUNTER") {
        await createEncounter({
          date: itemForm.date, type: itemForm.type, status: itemForm.status, notes: itemForm.content,
          subjectId: selectedSubjectId, studentId: itemForm.studentId, teacherId: user!.id, unitId, images: imageUrls
        });
      }

      setShowItemModal(null);
      setItemForm({ title: "", content: "", level: "BASICO", type: "VIRTUAL", date: new Date().toISOString().split("T")[0], studentId: "", status: "PENDING", videoMode: "url", file: null, images: [] });
      loadUnits();
      showToast("Elemento agregado con éxito", "success");
    } catch (error) {
      showToast("Error al agregar elemento", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">Cargando Unidades...</div>;
  if (!user || user.role !== "teacher") return <div className="p-20 text-center">Acceso Denegado</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12">
        <Link href="/docente" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
          <ArrowLeft size={14} /> Volver al Panel Docente
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Unidades <span className="text-primary">Temáticas</span></h1>
            <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em] mt-2">Gestión de Contenidos y Encuentros</p>
          </div>
          {selectedSubjectId && (
            <button onClick={() => setShowUnitModal(true)} className="bg-primary text-primary-foreground px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-primary/30">
              <Plus size={18} /> Nueva Unidad
            </button>
          )}
        </div>
      </header>

      {/* Subject Selector */}
      <div className="mb-8">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Materia</label>
        {subjects.length === 0 ? (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No tenés materias asignadas.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {subjects.map((sub) => (
              <button
                key={sub.id} onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                  selectedSubjectId === sub.id ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSubjectId && (
        <div className="space-y-6">
          {units.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-[2.5rem]">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No hay unidades creadas.</p>
            </div>
          ) : (
            units.map((unit) => (
              <div key={unit.id} className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
                <div 
                  className="p-6 bg-secondary/10 flex items-center justify-between cursor-pointer hover:bg-secondary/20 transition-all group"
                  onClick={() => router.push(`/docente/unidad/${unit.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 group-hover:scale-110 transition-transform">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1" onClick={(e) => {
                      if (editingUnitId === unit.id) e.stopPropagation();
                    }}>
                      {editingUnitId === unit.id ? (
                        <form onSubmit={(e) => handleUpdateUnitName(e, unit.id)} className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={editUnitName}
                            onChange={(e) => setEditUnitName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setEditingUnitId(null);
                                e.stopPropagation();
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="font-black text-2xl tracking-tight bg-background border border-primary/50 rounded-lg px-2 py-1 outline-none text-foreground"
                          />
                          <button
                            type="submit"
                            disabled={isSavingName}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                          >
                            {isSavingName ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingUnitId(null);
                            }}
                            className="p-2 bg-secondary text-muted-foreground rounded-lg hover:bg-secondary/80"
                          >
                            <X size={16} />
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-2 group/title">
                          <h2 className="font-black text-2xl tracking-tight">{unit.name}</h2>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditUnitName(unit.name);
                              setEditingUnitId(unit.id);
                            }}
                            className="text-muted-foreground opacity-0 group-hover/title:opacity-100 hover:text-primary transition-all p-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                          </button>
                        </div>
                      )}
                      {unit.description && <p className="text-sm text-muted-foreground mt-1">{unit.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit.id); }}
                      className="p-3 rounded-xl text-muted-foreground hover:bg-red-500 hover:text-white transition-all border border-border bg-background shadow-sm hover:shadow-red-500/20"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                      className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:scale-105 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                      Ver Unidad <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Nueva Unidad */}
      <AnimatePresence>
        {showUnitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black uppercase italic tracking-tighter text-xl">Nueva Unidad</h3>
                <button onClick={() => setShowUnitModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateUnit} className="space-y-4">
                <input required value={unitForm.name} onChange={e => setUnitForm({...unitForm, name: e.target.value})} placeholder="Nombre (Ej: Unidad 1: Fracciones)" className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50" />
                <textarea value={unitForm.description} onChange={e => setUnitForm({...unitForm, description: e.target.value})} placeholder="Descripción breve" className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none resize-none" rows={3} />
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px]">{isSubmitting ? "Creando..." : "Crear Unidad"}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Nuevo Elemento */}
      <AnimatePresence>
        {showItemModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black uppercase italic tracking-tighter text-xl">
                  {showItemModal.type === "THEORY" ? "Nueva Teoría" : showItemModal.type === "VIDEO" ? "Nuevo Video" : showItemModal.type === "EXERCISE" ? "Nuevo Ejercicio" : showItemModal.type === "TP_TEMPLATE" ? "Nuevo Trabajo Práctico" : "Nuevo Encuentro"}
                </h3>
                <button onClick={() => setShowItemModal(null)}><X size={20} /></button>
              </div>
              
              <form onSubmit={handleCreateItem} className="space-y-4">
                {showItemModal.type !== "ENCOUNTER" && (
                  <input required value={itemForm.title} onChange={e => setItemForm({...itemForm, title: e.target.value})} placeholder="Título" className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none" />
                )}

                {showItemModal.type === "ENCOUNTER" && (
                  <>
                    <select required value={itemForm.studentId} onChange={e => setItemForm({...itemForm, studentId: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none">
                      <option value="">Seleccionar alumno...</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <input required type="date" value={itemForm.date} onChange={e => setItemForm({...itemForm, date: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none" style={{ colorScheme: "dark" }} />
                  </>
                )}

                {(showItemModal.type === "EXERCISE" || showItemModal.type === "THEORY" || showItemModal.type === "ENCOUNTER" || showItemModal.type === "TP_TEMPLATE") && (
                  <textarea value={itemForm.content} onChange={e => setItemForm({...itemForm, content: e.target.value})} placeholder={showItemModal.type === "ENCOUNTER" ? "Notas (opcional)" : "Contenido / Enunciado / Instrucciones"} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none resize-none" rows={4} />
                )}

                {(showItemModal.type === "VIDEO" || showItemModal.type === "TP_TEMPLATE") && (
                  <div className="space-y-4">
                    {showItemModal.type === "VIDEO" ? (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setItemForm({...itemForm, videoMode: "url"})} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${itemForm.videoMode === "url" ? "bg-primary text-white" : "border-border"}`}>Link</button>
                        <button type="button" onClick={() => setItemForm({...itemForm, videoMode: "file"})} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${itemForm.videoMode === "file" ? "bg-primary text-white" : "border-border"}`}>Archivo</button>
                      </div>
                    ) : null}
                    {itemForm.videoMode === "url" && showItemModal.type === "VIDEO" ? (
                      <input required value={itemForm.content} onChange={e => setItemForm({...itemForm, content: e.target.value})} placeholder="URL del video (Ej: YouTube)" className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none" />
                    ) : (
                      <div className="w-full border-2 border-dashed border-border rounded-xl p-4 text-center">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Archivo {showItemModal.type === "TP_TEMPLATE" ? "(Opcional)" : "(Opcional para Teoría, Obligatorio para Video si eligió archivo)"}</p>
                        <input type="file" accept={showItemModal.type === "VIDEO" ? "video/*" : showItemModal.type === "TP_TEMPLATE" ? undefined : ".pdf,.doc,.docx"} onChange={e => setItemForm({...itemForm, file: e.target.files?.[0] || null})} className="w-full text-[10px]" />
                      </div>
                    )}
                  </div>
                )}

                {(showItemModal.type === "EXERCISE" || showItemModal.type === "ENCOUNTER") && (
                  <div className="p-4 border border-border rounded-xl bg-secondary/10">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2"><ImageIcon size={14}/> Adjuntar Imágenes (opcional)</label>
                    <input type="file" multiple accept="image/*" onChange={e => setItemForm({...itemForm, images: Array.from(e.target.files || [])})} className="w-full text-xs" />
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px]">{isSubmitting ? "Guardando..." : "Guardar"}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
