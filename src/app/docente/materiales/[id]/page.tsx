"use client";

import React, { useEffect, useState, use, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, Trash2, FileText, Video, Dumbbell,
  MessageSquare, ClipboardList, BookMarked, Upload, Link2, Save, Loader2
} from "lucide-react";
import { getMaterialsBySubject, createMaterial, deleteMaterial } from "@/app/actions/material";
import { getAllSubjects } from "@/app/actions/admin";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { upload } from "@vercel/blob/client";

type Tab = "THEORY" | "VIDEO" | "EXERCISE" | "PROMPT" | "RUBRIC" | "TP_TEMPLATE";

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { key: "THEORY", label: "Teoría", icon: FileText, color: "text-blue-400" },
  { key: "VIDEO", label: "Videos", icon: Video, color: "text-red-400" },
  { key: "EXERCISE", label: "Ejercicios", icon: Dumbbell, color: "text-green-400" },
  { key: "PROMPT", label: "Prompts IA", icon: MessageSquare, color: "text-purple-400" },
  { key: "TP_TEMPLATE", label: "Plantilla TP", icon: ClipboardList, color: "text-orange-400" },
  { key: "RUBRIC", label: "Rúbrica", icon: BookMarked, color: "text-yellow-400" },
];

const LEVELS = ["BASICO", "INTERMEDIO", "AVANZADO"];

export default function DocenteMaterialesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: subjectId } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [subject, setSubject] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("THEORY");
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    level: "BASICO",
    videoMode: "url" as "url" | "file",
    file: null as File | null,
  });

  useEffect(() => {
    if (user?.role === "teacher") loadData();
  }, [user, subjectId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mats, subs] = await Promise.all([
        getMaterialsBySubject(subjectId),
        getAllSubjects(),
      ]);
      if (mats.success) setMaterials(mats.materials || []);
      const found = (subs as any[]).find((s: any) => s.id === subjectId);
      setSubject(found || null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: "", content: "", level: "BASICO", videoMode: "url", file: null });
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast("Agregá un título", "error"); return; }

    setIsSaving(true);
    try {
      let fileUrl: string | undefined;

      if (activeTab === "VIDEO" && form.videoMode === "file" && form.file) {
        const blob = await upload(form.file.name, form.file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        fileUrl = blob.url;
      }

      const content = activeTab === "VIDEO" && form.videoMode === "url" ? form.content : form.content;

      const res = await createMaterial({
        subjectId,
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

  const tabMaterials = materials.filter((m) => m.type === activeTab);
  const activeTabDef = TABS.find((t) => t.key === activeTab)!;

  if (authLoading || isLoading)
    return <div className="p-20 text-center font-bold animate-pulse uppercase tracking-widest text-primary">Cargando Materiales...</div>;
  if (!user || user.role !== "teacher") { router.push("/login"); return null; }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12">
        <Link href="/docente" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
          <ArrowLeft size={14} /> Volver al Panel
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
              Materiales: <span className="text-primary">{subject?.name || "..."}</span>
            </h1>
            <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.4em] mt-2">
              Guía digital del módulo · {materials.length} recursos cargados
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {TABS.map((tab) => {
          const count = materials.filter((m) => m.type === tab.key).length;
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

          {tabMaterials.length === 0 && !showForm && (
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
            {tabMaterials.map((mat) => (
              <motion.div
                key={mat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-[2rem] p-6 hover:border-primary/30 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
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
                        <video src={mat.fileUrl} controls className="w-full max-w-lg rounded-xl mt-2 border border-border" />
                      ) : mat.content ? (
                        <a href={mat.content} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary text-sm font-bold hover:underline mt-2">
                          <Link2 size={14} /> {mat.content}
                        </a>
                      ) : null
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mt-1 max-h-32 overflow-y-auto">
                        {mat.content}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(mat.id)}
                    className="p-2 rounded-xl text-muted-foreground hover:bg-red-500 hover:text-white transition-all border border-border shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
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
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Título</label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-secondary/30 border border-border rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder={
                        activeTab === "THEORY" ? "Ej: Fracciones y operaciones básicas" :
                        activeTab === "VIDEO" ? "Ej: Video explicativo — Racionales" :
                        activeTab === "EXERCISE" ? "Ej: Suma y resta de fracciones" :
                        activeTab === "PROMPT" ? "Ej: Explicación inicial" :
                        activeTab === "TP_TEMPLATE" ? "Plantilla Trabajo Práctico Final" :
                        "Rúbrica de evaluación"
                      }
                    />
                  </div>

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
                  ) : (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                        {activeTab === "THEORY" ? "Contenido teórico" :
                         activeTab === "EXERCISE" ? "Enunciado del ejercicio" :
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
                          activeTab === "THEORY" ? "Escribí la teoría, conceptos clave y ejemplos resueltos..." :
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
                const count = materials.filter((m) => m.type === tab.key).length;
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
    </div>
  );
}
