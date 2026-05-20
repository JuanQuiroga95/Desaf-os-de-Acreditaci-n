"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Download, ArrowLeft, FileText, ChevronDown, Table2, RefreshCw } from "lucide-react";
import { getTeacherSubjects, getSubjectGradesPreview } from "@/app/actions/teacher";
import Link from "next/link";

export default function ExportPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (user?.role === "teacher") {
      loadSubjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedSubjectId && user?.id) {
      loadPreview();
    } else {
      setPreviewRows([]);
      setSubjectName("");
    }
  }, [selectedSubjectId]);

  const loadSubjects = async () => {
    try {
      setIsLoadingSubjects(true);
      const res = await getTeacherSubjects(user!.id);
      if (res.success) {
        setSubjects(res.subjects);
      }
    } catch (error) {
      console.error("Error cargando materias:", error);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const loadPreview = async () => {
    try {
      setIsLoadingPreview(true);
      const res = await getSubjectGradesPreview(selectedSubjectId, user!.id);
      if (res.success) {
        setPreviewRows(res.rows || []);
        setSubjectName(res.subjectName || "");
      }
    } catch (error) {
      console.error("Error cargando preview:", error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedSubjectId || !user?.id) return;
    try {
      setIsDownloading(true);
      const res = await fetch("/api/export-grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subjectId: selectedSubjectId }),
      });

      if (!res.ok) throw new Error("Error al exportar");

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = disposition.match(/filename="(.+?)"/);
      const filename = filenameMatch ? filenameMatch[1] : "acta.csv";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando acta:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (authLoading || isLoadingSubjects) return (
    <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">
      Cargando...
    </div>
  );
  if (!user || user.role !== "teacher") return (
    <div className="p-20 text-center font-black uppercase tracking-widest text-primary">Acceso Denegado</div>
  );

  const statusColors: Record<string, string> = {
    "ACREDITADO": "text-green-500",
    "EN PROCESO": "text-orange-500",
    "SIN ACTIVIDAD": "text-muted-foreground",
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12">
        <Link href="/docente" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-4 hover:underline">
          <ArrowLeft size={14} /> Volver al Panel
        </Link>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
          Exportar <span className="text-primary">Actas</span>
        </h1>
        <p className="text-muted-foreground font-bold text-sm mt-2">
          Formato compatible con planillas DGE Mendoza
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left panel: selector + actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-[2.5rem] p-8">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
              <FileText size={14} className="text-primary" />
              Configurar Acta
            </h2>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                Seleccionar Materia
              </label>
              <div className="relative">
                <select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-5 py-4 font-bold text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/50 pr-12"
                >
                  <option value="">-- Elegir materia --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {selectedSubjectId && (
              <button
                onClick={handleDownload}
                disabled={isDownloading || previewRows.length === 0}
                className="w-full mt-8 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                {isDownloading ? "Generando..." : "Descargar Acta CSV"}
              </button>
            )}
          </div>

          {/* Info card */}
          <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Sobre el formato</h3>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              El archivo CSV generado incluye encabezado identificatorio de la escuela, nombre del docente, fecha de emisión
              y el detalle completo de cada alumno: desafíos completados, promedios y estado de acreditación.
              Compatible con Microsoft Excel y planillas DGE Mendoza.
            </p>
          </div>
        </div>

        {/* Right panel: preview */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-border bg-secondary/10 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Table2 size={14} className="text-primary" />
                Vista Previa
                {subjectName && (
                  <span className="text-primary ml-2">{subjectName}</span>
                )}
              </h2>
              {previewRows.length > 0 && (
                <span className="text-[10px] font-black text-muted-foreground uppercase bg-secondary px-4 py-2 rounded-full border border-border">
                  {previewRows.length} alumnos
                </span>
              )}
            </div>

            {!selectedSubjectId && (
              <div className="p-20 text-center">
                <Table2 size={40} className="mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  Seleccioná una materia para ver la vista previa
                </p>
              </div>
            )}

            {selectedSubjectId && isLoadingPreview && (
              <div className="p-20 text-center">
                <RefreshCw size={32} className="mx-auto mb-4 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                  Cargando datos...
                </p>
              </div>
            )}

            {!isLoadingPreview && previewRows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20">
                      {["Alumno", "Desafíos", "Promedio", "Nota Máx.", "Estado", "Última Actividad"].map(h => (
                        <th key={h} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewRows.map((row, i) => (
                      <tr key={i} className="hover:bg-secondary/10 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-black text-sm">{row.nombre}</p>
                          <p className="text-[10px] text-muted-foreground">{row.email}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-center">
                          {row.desafiosCompletados}/{row.totalDesafios}
                        </td>
                        <td className="px-6 py-4 font-black text-center text-lg">
                          {row.promedioNotas}
                        </td>
                        <td className="px-6 py-4 font-bold text-center">
                          {row.notaMaxima}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${statusColors[row.estado] || ""}`}>
                            {row.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-bold text-muted-foreground">
                          {row.fechaUltimaActividad}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!isLoadingPreview && selectedSubjectId && previewRows.length === 0 && (
              <div className="p-16 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  No hay alumnos inscriptos en esta materia
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
