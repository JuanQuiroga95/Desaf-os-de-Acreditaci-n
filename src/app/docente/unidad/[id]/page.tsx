"use client";

import React, { useEffect, useState, use, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, Trash2, FileText, Video, Dumbbell,
  MessageSquare, ClipboardList, BookMarked, Upload, Link2, Save, Loader2,
  Pencil, Check, X as XIcon, RotateCcw
} from "lucide-react";
import { getMaterialsBySubject, createMaterial, deleteMaterial, updateMaterial } from "@/app/actions/material";
import { deleteChallenge, createChallenge, updateChallenge, getAllUsers } from "@/app/actions/admin";
import { createEncounter, deleteEncounter, updateEncounterStatus } from "@/app/actions/encounters";
import { getUnitById, getMaterialsByUnit, getChallengesByUnit, getEncountersByUnit } from "@/app/actions/units";
import { updateSubjectName, resetChallengeSubmissions } from "@/app/actions/teacher";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { upload } from "@vercel/blob/client";
import { Sparkles, Zap, Eye, EyeOff, Users2, Calendar, CheckCircle2 } from "lucide-react";

type Tab = "THEORY" | "VIDEO" | "EXERCISE" | "PROMPT" | "RUBRIC" | "TP_TEMPLATE" | "CHALLENGES" | "ENCOUNTER";

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { key: "ENCOUNTER", label: "Encuentros", icon: Users2, color: "text-indigo-400" },
  { key: "CHALLENGES", label: "Desafíos", icon: Zap, color: "text-amber-400" },
  { key: "THEORY", label: "Teoría", icon: FileText, color: "text-blue-400" },
  { key: "VIDEO", label: "Videos", icon: Video, color: "text-red-400" },
  { key: "EXERCISE", label: "Ejercicios", icon: Dumbbell, color: "text-green-400" },
  { key: "PROMPT", label: "Prompts IA", icon: MessageSquare, color: "text-purple-400" },
  { key: "TP_TEMPLATE", label: "Plantilla TP", icon: ClipboardList, color: "text-orange-400" },
  { key: "RUBRIC", label: "Rúbrica", icon: BookMarked, color: "text-yellow-400" },
];

const LEVELS = ["BASICO", "INTERMEDIO", "AVANZADO"];

export default function DocenteUnidadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: unitId } = use(params);
  const [subjectId, setSubjectId] = useState<string>("");
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [unit, setUnit] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("THEORY");
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isConverting, setIsConverting] = useState<string | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [isSavingChallenge, setIsSavingChallenge] = useState(false);
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    level: "BASICO",
    videoMode: "url" as "url" | "file",
    theoryMode: "text" as "text" | "file",
    file: null as File | null,
    studentId: "",
    date: "",
  });

  useEffect(() => {
    if (user?.role === "teacher") loadData();
  }, [user, unitId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mats, challs, unitRes, encRes, usersRes] = await Promise.all([

        getMaterialsByUnit(unitId),
        getChallengesByUnit(unitId),
        getUnitById(unitId),
        getEncountersByUnit(unitId),
        getAllUsers(),
      ]);
      if (mats.success) setMaterials(mats.materials || []);
      if (challs.success) setChallenges(challs.challenges || []);
      if (encRes.success) setEncounters(encRes.encounters || []);
      setStudents(usersRes.filter((u: any) => u.role === "STUDENT"));
      if (unitRes.success && unitRes.unit) {
        setUnit(unitRes.unit);
        setSubject(unitRes.unit.subject);
        setSubjectId(unitRes.unit.subjectId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName === subject?.name) { setEditingName(false); return; }
    setIsSavingName(true);
    const res = await updateSubjectName(subjectId, newName.trim());
    if (res.success) {
      setSubject((s: any) => ({ ...s, name: newName.trim() }));
      showToast("Nombre actualizado", "success");
    } else {
      showToast("Error al guardar el nombre", "error");
    }
    setIsSavingName(false);
    setEditingName(false);
  };

  const resetForm = () => {
    setForm({ title: "", content: "", level: "BASICO", videoMode: "url", theoryMode: "text", file: null, studentId: "", date: "" });
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast("Agregá un título", "error"); return; }

    setIsSaving(true);
    try {
      
      if (activeTab === "ENCOUNTER") {
        if (!form.studentId || !form.date) { showToast("Faltan datos", "error"); setIsSaving(false); return; }
        const res = await createEncounter({
          subjectId, unitId, studentId: form.studentId, date: form.date, notes: form.content, status: "PENDING", type: "VIRTUAL", teacherId: user.id
        });
        if (res.success) { showToast("Encuentro creado", "success"); resetForm(); loadData(); }
        else { showToast("Error al crear", "error"); }
        setIsSaving(false);
        return;
      }
      let fileUrl: string | undefined;

      const needsFileUpload =
        (activeTab === "VIDEO" && form.videoMode === "file" && form.file) ||
        (activeTab === "THEORY" && form.theoryMode === "file" && form.file);

      if (needsFileUpload && form.file) {
        try {
          const blob = await upload(form.file.name, form.file, {
            access: "public",
            handleUploadUrl: "/api/upload",
          });
          fileUrl = blob.url;
        } catch (error: any) {
          console.error("Error detallado de subida:", error);
          showToast(error.message || "Error al subir archivo a Vercel Blob", "error");
          setIsSaving(false);
          return;
        }
      }

      const content = activeTab === "VIDEO" && form.videoMode === "url" ? form.content : form.content;

      const res = await createMaterial({
        subjectId,
        unitId,
        type: activeTab,
        title: form.title,
        content,
        level: activeTab === "EXERCISE" ? form.level : undefined,
        fileUrl,
      });

      if (res.success) {
        showToast("Material guardado", "success");
        resetForm();
        loadData();
      } else {
        showToast("Error al guardar", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este material?")) return;
    const res = await deleteMaterial(id, subjectId);
    if (res.success) { showToast("Eliminado", "success"); loadData(); }
    else showToast("Error al eliminar", "error");
  };

  const handleDeleteChallenge = async (id: string) => {
    if (!confirm("¿Eliminar este encuentro? Se perderán las respuestas de los alumnos.")) return;
    const res = await deleteChallenge(id, subjectId);
    if (res.success) { showToast("Encuentro eliminado", "success"); loadData(); }
    else showToast("Error al eliminar", "error");
  };

  const handleResetChallenge = async (id: string) => {
    if (!confirm("¿Reiniciar este encuentro? Se borrarán todas las respuestas y notas de los alumnos para este desafío específico.")) return;
    const res = await resetChallengeSubmissions(id);
    if (res.success) { showToast("Encuentro reiniciado", "success"); }
    else showToast("Error al reiniciar", "error");
  };

  const handleSaveChallenge = async () => {
    if (!editingChallenge) return;
    setIsSavingChallenge(true);
    try {
      const res = await updateChallenge(editingChallenge.id, subjectId, {
        title: editingChallenge.title,
        objective: editingChallenge.objective,
        content: editingChallenge.content,
      });
      if (res.success) {
        showToast("Encuentro actualizado", "success");
        setEditingChallenge(null);
        loadData();
      } else {
        showToast("Error al actualizar", "error");
      }
    } finally {
      setIsSavingChallenge(false);
    }
  };

  const handleUpdateQuestion = (qId: string, field: string, value: string) => {
    setEditingChallenge((prev: any) => ({
      ...prev,
      content: {
        ...prev.content,
        questions: prev.content.questions.map((q: any) => 
          q.id === qId ? { ...q, [field]: value } : q
        )
      }
    }));
  };

  const handleSaveMaterial = async () => {
    if (!editingMaterial) return;
    setIsSavingMaterial(true);
    try {
      const res = await updateMaterial(editingMaterial.id, subjectId, {
        title: editingMaterial.title,
        content: editingMaterial.content,
        level: editingMaterial.level,
      });
      if (res.success) {
        showToast("Material actualizado", "success");
        setEditingMaterial(null);
        loadData();
      } else {
        showToast("Error al actualizar", "error");
      }
    } finally {
      setIsSavingMaterial(false);
    }
  };

  const handleToggleVisibility = async (material: any) => {
    const res = await updateMaterial(material.id, subjectId, {
      visible: !material.visible,
    });
    if (res.success) {
      showToast(material.visible ? "Material oculto para alumnos" : "Material visible para alumnos", "success");
      loadData();
    } else {
      showToast("Error al cambiar visibilidad", "error");
    }
  };

  const handleConvertToChallenge = async (material: any) => {
    if (!material.fileUrl) return;
    setIsConverting(material.id);
    showToast("Extrayendo contenido con IA...", "success");

    try {
      // 1. Extract with IA using URL directly
      const aiRes = await fetch("/api/extract-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: material.fileUrl }),
      });

      if (!aiRes.ok) {
        let errorMsg = "Error en el servidor (" + aiRes.status + ")";
        try {
          const contentType = aiRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await aiRes.json();
            errorMsg = errorData.error || errorMsg;
          } else {
            errorMsg = "El servidor devolvió un error (HTML). Verifica la configuración de Vercel.";
          }
        } catch (e) {
          console.error("Failed to parse error response", e);
        }
        throw new Error(errorMsg);
      }

      const data = await aiRes.json();

      // 3. Create Challenge
      const challRes = await createChallenge(
        subjectId,
        data.title || material.title,
        data.objective || "Sin objetivo",
        {
          theory: data.theory || "",
          questions: data.questions || []
        },
        "REGULAR",
        material.fileUrl, unitId
      );

      if (challRes.success) {
        showToast("¡Encuentro generado con éxito!", "success");
        setActiveTab("CHALLENGES");
        loadData();
      } else {
        showToast("Error al crear encuentro", "error");
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "No se pudo generar el encuentro", "error");
    } finally {
      setIsConverting(null);
    }
  };

  
  const handleDeleteEncounter = async (id: string) => {
    if (!confirm("¿Eliminar este encuentro?")) return;
    const res = await deleteEncounter(id);
    if (res.success) { showToast("Encuentro eliminado", "success"); loadData(); }
    else showToast("Error al eliminar", "error");
  };

  const handleUpdateEncounterStatus = async (id: string, status: string) => {
    const res = await updateEncounterStatus(id, status);
    if (res.success) { showToast("Estado actualizado", "success"); loadData(); }
    else showToast("Error al actualizar", "error");
  };

  const tabMaterials = materials.filter((m) => m.type === activeTab);
  const activeTabDef = TABS.find((t) => t.key === activeTab)!;

  if (authLoading || isLoading)
    return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-widest text-primary">Cargando Materiales...</div>;
  if (!user || user.role !== "teacher") { router.push("/login"); return null; }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12">
        <Link href="/docente/unidades" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
          <ArrowLeft size={14} /> Volver a Unidades
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
                Materiales:
              </h1>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                    className="text-3xl font-black tracking-tighter uppercase italic bg-secondary/30 border border-primary/50 rounded-xl px-3 py-1 outline-none focus:ring-2 focus:ring-primary/50 text-primary"
                  />
                  <button onClick={handleSaveName} disabled={isSavingName} className="p-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all">
                    {isSavingName ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  </button>
                  <button onClick={() => setEditingName(false)} className="p-2 rounded-xl bg-secondary border border-border hover:bg-border transition-all">
                    <XIcon size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setNewName(subject?.name || ""); setEditingName(true); }}
                  className="flex items-center gap-2 group"
                >
                  <span className="text-5xl font-black tracking-tighter uppercase italic text-primary">{subject?.name || "..."}</span>
                  <Pencil size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </button>
              )}
            </div>
            <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em] mt-2">
              Guía digital del módulo · {materials.length + challenges.length} recursos cargados
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {TABS.map((tab) => {
          const count = tab.key === "CHALLENGES" ? challenges.length : tab.key === "ENCOUNTER" ? encounters.length : materials.filter((m) => m.type === tab.key).length;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setShowForm(false); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon size={14} className={activeTab === tab.key ? "text-white" : tab.color} />
              {tab.label}
              {count > 0 && (
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${activeTab === tab.key ? "bg-white/20" : "bg-secondary"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Materials list */}
        <div className="lg:col-span-8 space-y-4">
          {/* Hint card for exercises */}
          {activeTab === "EXERCISE" && tabMaterials.length > 0 && (
            <div className="flex gap-3 flex-wrap mb-2">
              {LEVELS.map((lvl) => {
                const c = tabMaterials.filter((m) => m.level === lvl).length;
                return (
                  <span key={lvl} className="px-4 py-2 rounded-xl bg-secondary border border-border text-[9px] font-black uppercase tracking-widest">
                    {lvl}: {c} ejercicio{c !== 1 ? "s" : ""}
                  </span>
                );
              })}
            </div>
          )}

          {(activeTab === "CHALLENGES" ? challenges.length === 0 : activeTab === "ENCOUNTER" ? encounters.length === 0 : tabMaterials.length === 0) && !showForm && (
            <div className="p-16 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-secondary/5">
              <activeTabDef.icon className={`mx-auto mb-4 opacity-20 ${activeTabDef.color}`} size={48} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">
                No hay {activeTabDef.label.toLowerCase()} cargados aún.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 mx-auto bg-primary text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
              >
                <Plus size={14} /> Agregar primero
              </button>
            </div>
          )}

          <AnimatePresence>
            {
            activeTab === "ENCOUNTER" ? (
              encounters.map((enc: any) => (
                <motion.div key={enc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-[2rem] p-6 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-lg">{enc.student.name}</h4>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(enc.date).toLocaleDateString()}</span>
                        <span>{enc.type}</span>
                        {enc.notes && <span>· {enc.notes}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-[10px] rounded-lg border font-black uppercase ${
                        enc.status === "COMPLETED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                        enc.status === "ABSENT" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      }`}>{enc.status}</span>
                      <button onClick={() => handleUpdateEncounterStatus(enc.id, "COMPLETED")} className="p-2 hover:bg-green-500/20 rounded-xl text-green-500 border border-border"><CheckCircle2 size={16}/></button>
                      <button onClick={() => handleDeleteEncounter(enc.id)} className="p-2 hover:bg-red-500/20 rounded-xl text-red-500 border border-border"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : activeTab === "CHALLENGES" ? (
              challenges.map((chall) => (
                <motion.div
                  key={chall.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-[2rem] p-6 hover:border-primary/30 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border bg-amber-500/10 text-amber-400 border-amber-500/20`}>
                          {chall.type}
                        </span>
                        <h4 className="font-black text-base">{chall.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{chall.objective}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingChallenge(chall)}
                        className="p-2 rounded-xl text-primary hover:bg-primary hover:text-white transition-all border border-primary/20 shrink-0 group"
                        title="Ver / Editar encuentro"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleResetChallenge(chall.id)}
                        className="p-2 rounded-xl text-amber-500 hover:bg-amber-500 hover:text-white transition-all border border-amber-500/20 shrink-0 group"
                        title="Reiniciar respuestas de alumnos"
                      >
                        <RotateCcw size={14} className="group-hover:rotate-180 transition-transform" />
                      </button>
                      <button
                        onClick={() => handleDeleteChallenge(chall.id)}
                        className="p-2 rounded-xl text-muted-foreground hover:bg-red-500 hover:text-white transition-all border border-border shrink-0"
                        title="Eliminar encuentro"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              tabMaterials.map((mat) => (
                <motion.div
                  key={mat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-card border border-border rounded-[2rem] p-6 hover:border-primary/30 transition-all shadow-sm ${mat.visible === false ? "opacity-60 grayscale-[0.5]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {mat.visible === false && (
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                            Oculto
                          </span>
                        )}
                        {mat.level && (
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                            mat.level === "BASICO" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                            mat.level === "INTERMEDIO" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                            "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}>
                            {mat.level}
                          </span>
                        )}
                        <h4 className="font-black text-base">{mat.title}</h4>
                      </div>

                      {mat.type === "VIDEO" ? (
                        mat.fileUrl ? (
                          <video src={mat.fileUrl} controls preload="metadata" playsInline className="w-full max-w-lg rounded-xl mt-2 border border-border" />
                        ) : mat.content ? (
                          <a href={mat.content} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary text-sm font-bold hover:underline mt-2">
                            <Link2 size={14} /> {mat.content}
                          </a>
                        ) : null
                      ) : mat.type === "THEORY" && mat.fileUrl ? (
                        <div className="flex items-center gap-4 mt-2">
                          <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary text-sm font-bold hover:underline">
                            <FileText size={14} /> Abrir / Descargar archivo
                          </a>
                          <button
                            onClick={() => handleConvertToChallenge(mat)}
                            disabled={isConverting === mat.id}
                            className="flex items-center gap-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50"
                          >
                            {isConverting === mat.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            {isConverting === mat.id ? "Generando..." : "Convertir en Encuentro"}
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mt-1 max-h-32 overflow-y-auto">
                          {mat.content}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleVisibility(mat)}
                        className={`p-2 rounded-xl transition-all border shrink-0 ${
                          mat.visible !== false 
                            ? "text-blue-500 border-blue-500/20 hover:bg-blue-500 hover:text-white shadow-sm" 
                            : "text-muted-foreground border-border hover:bg-secondary"
                        }`}
                        title={mat.visible !== false ? "Ocultar para alumnos" : "Mostrar para alumnos"}
                      >
                        {mat.visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button
                        onClick={() => setEditingMaterial(mat)}
                        className="p-2 rounded-xl text-primary hover:bg-primary hover:text-white transition-all border border-primary/20 shrink-0 group"
                        title="Editar material"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(mat.id)}
                        className="p-2 rounded-xl text-muted-foreground hover:bg-red-500 hover:text-white transition-all border border-border shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-card border border-primary/30 rounded-[2rem] p-8 shadow-lg"
              >
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                  <Plus size={14} /> Nuevo {activeTabDef.label}
                </h4>

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {activeTab === "ENCOUNTER" && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Alumno</label>
                        <select required value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50">
                          <option value="">Seleccionar...</option>
                          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Fecha</label>
                        <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50" style={{colorScheme: 'dark'}} />
                      </div>
                    </div>
                  )}

                  {activeTab !== "ENCOUNTER" && (<div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Título</label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder={
                        activeTab === "ENCOUNTER" ? "Notas del encuentro (opcional)" :
                        activeTab === "THEORY" ? "Ej: Fracciones y operaciones básicas" :
                        activeTab === "VIDEO" ? "Ej: Video explicativo — Racionales" :
                        activeTab === "EXERCISE" ? "Ej: Suma y resta de fracciones" :
                        activeTab === "PROMPT" ? "Ej: Explicación inicial" :
                        activeTab === "TP_TEMPLATE" ? "Plantilla Trabajo Práctico Final" :
                        "Rúbrica de evaluación"
                      }
                    />
                  </div>)}

                  {activeTab === "EXERCISE" && (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nivel</label>
                      <div className="flex gap-3">
                        {LEVELS.map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setForm({ ...form, level: lvl })}
                            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex-1 ${
                              form.level === lvl
                                ? lvl === "BASICO" ? "bg-green-500 text-white border-green-500" :
                                  lvl === "INTERMEDIO" ? "bg-yellow-500 text-black border-yellow-500" :
                                  "bg-red-500 text-white border-red-500"
                                : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "VIDEO" ? (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, videoMode: "url" })}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.videoMode === "url" ? "bg-primary text-white border-primary" : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary"}`}
                        >
                          <Link2 size={12} /> Link URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, videoMode: "file" })}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.videoMode === "file" ? "bg-primary text-white border-primary" : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary"}`}
                        >
                          <Upload size={12} /> Subir Archivo
                        </button>
                      </div>

                      {form.videoMode === "url" ? (
                        <input
                          value={form.content}
                          onChange={(e) => setForm({ ...form, content: e.target.value })}
                          className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="https://youtube.com/watch?v=... o Google Drive"
                        />
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-all"
                        >
                          <Upload className="mx-auto mb-3 text-muted-foreground" size={24} />
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {form.file ? form.file.name : "Hacé click para seleccionar un video (MP4, WebM)"}
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                          />
                        </div>
                      )}
                    </div>
                  ) : activeTab === "THEORY" ? (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, theoryMode: "text", file: null })}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.theoryMode === "text" ? "bg-primary text-white border-primary" : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary"}`}
                        >
                          <FileText size={12} /> Escribir Texto
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, theoryMode: "file", content: "" })}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.theoryMode === "file" ? "bg-primary text-white border-primary" : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary"}`}
                        >
                          <Upload size={12} /> Subir PDF / DOC
                        </button>
                      </div>

                      {form.theoryMode === "text" ? (
                        <textarea
                          required
                          value={form.content}
                          onChange={(e) => setForm({ ...form, content: e.target.value })}
                          className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none h-36 focus:ring-2 focus:ring-primary/50 resize-none leading-relaxed"
                          placeholder="Escribí la teoría, conceptos clave y ejemplos resueltos..."
                        />
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-all"
                        >
                          <Upload className="mx-auto mb-3 text-muted-foreground" size={24} />
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {form.file ? form.file.name : "Hacé click para seleccionar PDF, DOC o DOCX"}
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            className="hidden"
                            onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                        {activeTab === "EXERCISE" ? "Enunciado del ejercicio" :
                         activeTab === "PROMPT" ? "Texto del prompt" :
                         activeTab === "TP_TEMPLATE" ? "Instrucciones del TP" :
                         "Criterios de evaluación"}
                      </label>
                      <textarea
                        required
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none h-36 focus:ring-2 focus:ring-primary/50 resize-none leading-relaxed"
                        placeholder={
                          activeTab === "EXERCISE" ? "Enunciado completo del ejercicio con datos..." :
                          activeTab === "PROMPT" ? "Ej: Explicame qué es un número racional como si tuviera 14 años." :
                          activeTab === "TP_TEMPLATE" ? "Instrucciones, criterios de presentación, estructura esperada..." :
                          "Dimensiones de evaluación y criterios de acreditación..."
                        }
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-4 bg-secondary border border-border rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-border transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl flex items-center justify-center gap-3 disabled:opacity-60 hover:scale-[1.02] transition-all"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {isSaving ? "Guardando..." : "Guardar Material"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-2xl shadow-primary/20"
            >
              <Plus size={18} />
              Agregar {activeTabDef.label}
            </button>
          )}

          <div className="bg-secondary/20 border border-border rounded-[2.5rem] p-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">Resumen de materiales</h3>
            <div className="space-y-3">
              {TABS.map((tab) => {
                const count = tab.key === "CHALLENGES" ? challenges.length : materials.filter((m) => m.type === tab.key).length;
                const Icon = tab.icon;
                return (
                  <div key={tab.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={tab.color} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{tab.label}</span>
                    </div>
                    <span className={`text-sm font-black ${count > 0 ? "text-primary" : "text-muted-foreground"}`}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Guía de la Propuesta</h3>
            <div className="space-y-3 text-[10px] text-muted-foreground font-medium leading-relaxed">
              <p>📚 <strong>Teoría:</strong> Conceptos clave y ejemplos resueltos</p>
              <p>🎥 <strong>Videos:</strong> Máx. 4, hasta 8 min cada uno</p>
              <p>✏️ <strong>Ejercicios:</strong> Por nivel: básico → intermedio → avanzado</p>
              <p>🤖 <strong>Prompts IA:</strong> Para uso supervisado en clase</p>
              <p>📋 <strong>Plantilla TP:</strong> Criterios visibles desde el día 1</p>
              <p>📊 <strong>Rúbrica:</strong> Disponible desde el primer encuentro</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Edit Challenge Modal */}
      <AnimatePresence>
        {editingChallenge && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-card border border-border w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-border flex justify-between items-center bg-amber-500/10 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-black">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase italic text-xl">Editar Encuentro</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Ajustar contenido generado o manual</p>
                  </div>
                </div>
                <button onClick={() => setEditingChallenge(null)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Título del Encuentro</label>
                    <input 
                      value={editingChallenge.title}
                      onChange={(e) => setEditingChallenge({...editingChallenge, title: e.target.value})}
                      className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Objetivo Pedagógico</label>
                    <input 
                      value={editingChallenge.objective}
                      onChange={(e) => setEditingChallenge({...editingChallenge, objective: e.target.value})}
                      className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Contenido Teórico de Apoyo</label>
                  <textarea 
                    value={editingChallenge.content?.theory || ""}
                    onChange={(e) => setEditingChallenge({
                      ...editingChallenge, 
                      content: { ...editingChallenge.content, theory: e.target.value }
                    })}
                    className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none h-32 resize-none"
                  />
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] border-b border-border pb-2">Cuestionario</h4>
                  {editingChallenge.content?.questions?.map((q: any, index: number) => (
                    <div key={q.id} className="p-6 bg-secondary/20 rounded-2xl border border-border space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-primary uppercase">Pregunta {index + 1}</span>
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-muted-foreground mb-1 block">Enunciado</label>
                        <textarea 
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(q.id, "question", e.target.value)}
                          className="w-full bg-background border border-border rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 h-20 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-muted-foreground mb-1 block">Respuesta / Resolución Esperada</label>
                        <textarea 
                          value={q.answer}
                          onChange={(e) => handleUpdateQuestion(q.id, "answer", e.target.value)}
                          className="w-full bg-background border border-border rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50 h-20 resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 border-t border-border bg-secondary/10 flex gap-4">
                <button 
                  onClick={() => setEditingChallenge(null)}
                  className="flex-1 py-4 bg-secondary border border-border rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-border transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveChallenge}
                  disabled={isSavingChallenge}
                  className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  {isSavingChallenge ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSavingChallenge ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Material Modal */}
      <AnimatePresence>
        {editingMaterial && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-card border border-border w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black">
                    <Pencil size={24} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase italic text-xl">Editar {editingMaterial.type}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Modificar contenido del recurso</p>
                  </div>
                </div>
                <button onClick={() => setEditingMaterial(null)} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Título</label>
                  <input 
                    value={editingMaterial.title}
                    onChange={(e) => setEditingMaterial({...editingMaterial, title: e.target.value})}
                    className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {editingMaterial.type === "EXERCISE" && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nivel</label>
                    <div className="flex gap-3">
                      {LEVELS.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setEditingMaterial({ ...editingMaterial, level: lvl })}
                          className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex-1 ${
                            editingMaterial.level === lvl
                              ? lvl === "BASICO" ? "bg-green-500 text-white border-green-500" :
                                lvl === "INTERMEDIO" ? "bg-yellow-500 text-black border-yellow-500" :
                                "bg-red-500 text-white border-red-500"
                              : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Only show content textarea if it's not a file-only material or it's theory/exercise */}
                {(!editingMaterial.fileUrl || editingMaterial.type === "THEORY" || editingMaterial.type === "EXERCISE" || editingMaterial.type === "PROMPT") && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Contenido / Descripción</label>
                    <textarea 
                      value={editingMaterial.content || ""}
                      onChange={(e) => setEditingMaterial({...editingMaterial, content: e.target.value})}
                      className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none h-48 resize-none leading-relaxed"
                    />
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-border bg-secondary/10 flex gap-4">
                <button 
                  onClick={() => setEditingMaterial(null)}
                  className="flex-1 py-4 bg-secondary border border-border rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-border transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveMaterial}
                  disabled={isSavingMaterial}
                  className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  {isSavingMaterial ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSavingMaterial ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
