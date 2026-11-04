"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, UserPlus, Users, X } from "lucide-react";
import {
  createStudentsForTeacher,
  type NewStudentResult,
  type NewStudentRow,
} from "@/app/actions/teacher-students";

type Subject = { id: string; name: string };

/** Lee líneas tipo "Nombre Apellido, correo" (también acepta ; o tabulación, como al pegar de Excel). */
function parseList(text: string): NewStudentRow[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[,;\t]/).map((p) => p.trim()).filter(Boolean);
      const emailIdx = parts.findIndex((p) => p.includes("@"));
      const email = emailIdx >= 0 ? parts[emailIdx] : "";
      const rest = parts.filter((_, i) => i !== emailIdx);
      return { name: rest[0] ?? "", email, password: rest[1] };
    });
}

const STATUS_LABEL: Record<NewStudentResult["status"], string> = {
  created: "Cuenta creada e inscripto",
  enrolled: "Ya tenía cuenta: inscripto",
  already: "Ya estaba inscripto",
  error: "No se cargó",
};

export default function AddStudentsModal({
  subjects,
  onClose,
  onDone,
}: {
  subjects: Subject[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [mode, setMode] = useState<"one" | "list">("one");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [listText, setListText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<NewStudentResult[] | null>(null);

  const parsed = useMemo(() => parseList(listText), [listText]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!subjectId) return setError("Elegí la materia.");
    const rows = mode === "one" ? [{ name, email }] : parsed;
    if (!rows.length) return setError("Pegá al menos un estudiante.");

    setSaving(true);
    try {
      const res = await createStudentsForTeacher(subjectId, rows, password);
      if (!res.success) return setError(res.error || "No se pudo guardar.");
      setResults(res.results);
      if (res.results.some((r) => r.status !== "error")) onDone();
      if (mode === "one" && res.results[0]?.status !== "error") {
        setName("");
        setEmail("");
      }
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
        aria-labelledby="add-students-title"
        className="bg-card border border-border rounded-[2rem] w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 id="add-students-title" className="text-2xl font-black uppercase italic tracking-tight">
            Cargar <span className="text-primary">estudiantes</span>
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {subjects.length === 0 ? (
          <p className="font-bold text-muted-foreground">
            Todavía no tenés materias asignadas. Pedile al administrador que te asigne una para poder cargar estudiantes.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/40 rounded-2xl">
              {([
                ["one", "De a uno", UserPlus],
                ["list", "Pegar lista", Users],
              ] as const).map(([value, text, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setMode(value);
                    setResults(null);
                    setError("");
                  }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    mode === value ? "bg-primary text-white shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={16} /> {text}
                </button>
              ))}
            </div>

            <div>
              <label className={label} htmlFor="as-subject">Materia</label>
              <select id="as-subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={input}>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {mode === "one" ? (
              <>
                <div>
                  <label className={label} htmlFor="as-name">Nombre y apellido</label>
                  <input id="as-name" required value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="Ej: Martina Gómez" />
                </div>
                <div>
                  <label className={label} htmlFor="as-email">Correo</label>
                  <input id="as-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="martina@ejemplo.com" />
                </div>
              </>
            ) : (
              <div>
                <label className={label} htmlFor="as-list">Un estudiante por línea: nombre, correo</label>
                <textarea
                  id="as-list"
                  value={listText}
                  onChange={(e) => setListText(e.target.value)}
                  rows={7}
                  className={`${input} font-mono text-sm`}
                  placeholder={"Martina Gómez, martina@ejemplo.com\nLucas Pérez, lucas@ejemplo.com"}
                />
                <p className="text-xs font-bold text-muted-foreground mt-2">
                  Podés copiar y pegar dos columnas desde Excel. {parsed.length > 0 && `Detectados: ${parsed.length}.`}
                </p>
              </div>
            )}

            <div>
              <label className={label} htmlFor="as-pass">Contraseña inicial</label>
              <input
                id="as-pass"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={input}
                placeholder="Mínimo 6 caracteres"
                autoComplete="off"
              />
              <p className="text-xs font-bold text-muted-foreground mt-2">
                {mode === "list" ? "Se usa para todas las cuentas nuevas. " : ""}
                Pasásela al estudiante; después la puede cambiar desde su perfil. Si ya tenía cuenta, se mantiene la suya.
              </p>
            </div>

            {error && (
              <p className="flex items-center gap-2 text-red-500 font-bold text-sm" role="alert">
                <AlertCircle size={16} /> {error}
              </p>
            )}

            {results && (
              <ul className="space-y-2 max-h-48 overflow-y-auto" aria-live="polite">
                {results.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-bold">
                    {r.status === "error" ? (
                      <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                    )}
                    <span>
                      {r.name || r.email || "(línea vacía)"} — {STATUS_LABEL[r.status]}
                      {r.message ? `: ${r.message}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {mode === "one" ? "Cargar estudiante" : `Cargar ${parsed.length || ""} estudiantes`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
