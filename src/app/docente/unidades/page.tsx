"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
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
import { upload } from "@vercel/blob/client";

export default function UnidadesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
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
        if (res.subjects.length > 0) setSelectedSubjectId(res.subjects[0].id);
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

      // Upload main file if needed (Video/Theory)
      if (itemForm.file) {
        const blob = await upload(itemForm.file.name, itemForm.file, { access: "public", handleUploadUrl: "/api/upload" });
        fileUrl = blob.url;
      }
      
      // Upload multiple images if needed (Exercise/Encounter)
      for (const img of itemForm.images) {
        const blob = await upload(img.name, img, { access: "public", handleUploadUrl: "/api/upload" });
        imageUrls.push(blob.url);
      }

      if (type === "THEORY" || type === "VIDEO") {
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
                  className="p-6 bg-secondary/10 flex items-center justify-between cursor-pointer hover:bg-secondary/20 transition-all"
                  onClick={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}
                >
                  <div className="flex items-center gap-4">
                    {expandedUnit === unit.id ? <ChevronDown className="text-primary" /> : <ChevronRight className="text-primary" />}
                    <div>
                      <h2 className="font-black text-xl">{unit.name}</h2>
                      {unit.description && <p className="text-sm text-muted-foreground">{unit.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit.id); }}
                      className="p-2 rounded-xl text-muted-foreground hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedUnit === unit.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="border-t border-border overflow-hidden">
                      <div className="p-6 space-y-6">
                        
                        {/* Materiales Section */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <FileText size={14} /> Materiales (Teoría / Videos)
                            </h3>
                            <div className="flex gap-2">
                              <button onClick={() => setShowItemModal({ unitId: unit.id, type: "THEORY" })} className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">+ Teoría</button>
                              <button onClick={() => setShowItemModal({ unitId: unit.id, type: "VIDEO" })} className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">+ Video</button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {unit.materials.map((m: any) => (
                              <div key={m.id} className="p-4 border border-border rounded-2xl bg-secondary/5 flex justify-between">
                                <div>
                                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${m.type === 'VIDEO' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>{m.type}</span>
                                  <h4 className="font-bold mt-1">{m.title}</h4>
                                </div>
                                <button onClick={() => handleDeleteMaterial(m.id)} className="text-muted-foreground hover:text-red-500"><Trash2 size={14}/></button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Ejercicios Section */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <Dumbbell size={14} /> Ejercicios
                            </h3>
                            <button onClick={() => setShowItemModal({ unitId: unit.id, type: "EXERCISE" })} className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">+ Ejercicio</button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {unit.challenges.map((c: any) => (
                              <div key={c.id} className="p-4 border border-border rounded-2xl bg-secondary/5 flex justify-between">
                                <div>
                                  <h4 className="font-bold">{c.title}</h4>
                                  <span className="text-xs text-muted-foreground">{c.images?.length || 0} imágenes adjuntas</span>
                                </div>
                                <button onClick={() => handleDeleteChallenge(c.id)} className="text-muted-foreground hover:text-red-500"><Trash2 size={14}/></button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Encuentros Section */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <Users2 size={14} /> Encuentros
                            </h3>
                            <button onClick={() => setShowItemModal({ unitId: unit.id, type: "ENCOUNTER" })} className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">+ Encuentro</button>
                          </div>
                          <div className="space-y-3">
                            {unit.encounters.map((enc: any) => (
                              <div key={enc.id} className="p-4 border border-border rounded-2xl bg-secondary/5 flex justify-between items-center">
                                <div>
                                  <h4 className="font-bold">{enc.student.name}</h4>
                                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(enc.date).toLocaleDateString()}</span>
                                    <span>{enc.type}</span>
                                    <span>{enc.images?.length || 0} imágenes</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 text-[9px] rounded-lg border font-bold uppercase ${
                                    enc.status === "COMPLETED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                    enc.status === "ABSENT" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                    "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                  }`}>{enc.status}</span>
                                  <button onClick={() => updateEncounterStatus(enc.id, "COMPLETED")} className="p-1.5 hover:bg-green-500/20 rounded-md text-green-500"><CheckCircle2 size={14}/></button>
                                  <button onClick={() => handleDeleteEncounter(enc.id)} className="p-1.5 hover:bg-red-500/20 rounded-md text-red-500"><Trash2 size={14}/></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  {showItemModal.type === "THEORY" ? "Nueva Teoría" : showItemModal.type === "VIDEO" ? "Nuevo Video" : showItemModal.type === "EXERCISE" ? "Nuevo Ejercicio" : "Nuevo Encuentro"}
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

                {(showItemModal.type === "EXERCISE" || showItemModal.type === "THEORY" || showItemModal.type === "ENCOUNTER") && (
                  <textarea value={itemForm.content} onChange={e => setItemForm({...itemForm, content: e.target.value})} placeholder={showItemModal.type === "ENCOUNTER" ? "Notas (opcional)" : "Contenido / Enunciado"} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none resize-none" rows={4} />
                )}

                {showItemModal.type === "VIDEO" && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setItemForm({...itemForm, videoMode: "url"})} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${itemForm.videoMode === "url" ? "bg-primary text-white" : "border-border"}`}>Link</button>
                      <button type="button" onClick={() => setItemForm({...itemForm, videoMode: "file"})} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${itemForm.videoMode === "file" ? "bg-primary text-white" : "border-border"}`}>Archivo</button>
                    </div>
                    {itemForm.videoMode === "url" ? (
                      <input required value={itemForm.content} onChange={e => setItemForm({...itemForm, content: e.target.value})} placeholder="URL del video (Ej: YouTube)" className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none" />
                    ) : (
                      <div className="w-full border-2 border-dashed border-border rounded-xl p-4 text-center">
                        <input type="file" accept="video/*" onChange={e => setItemForm({...itemForm, file: e.target.files?.[0] || null})} className="w-full text-[10px]" />
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
