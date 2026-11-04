"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pencil, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * Título de sección que cada docente puede renombrar a su gusto.
 * Se guarda solo en su navegador y para su usuario: no cambia lo que ven
 * otros docentes ni los estudiantes.
 */

const EVENT = "teacher-titles-change";
const storageKey = (userId: string) => `teacher-titles:${userId}`;

function readTitles(userId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeTitle(userId: string, key: string, value: string | null) {
  try {
    const titles = readTitles(userId);
    if (value) titles[key] = value;
    else delete titles[key];
    localStorage.setItem(storageKey(userId), JSON.stringify(titles));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* sin almacenamiento disponible: el cambio dura hasta recargar */
  }
}

/** Devuelve el título personalizado (o el original) para usar fuera del encabezado, p. ej. en el menú. */
export function useTeacherTitle(key: string, fallback: string) {
  const { user } = useAuth();
  const [title, setTitle] = useState(fallback);
  useEffect(() => {
    if (!user?.id) return;
    const sync = () => setTitle(readTitles(user.id)[key] || fallback);
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [user?.id, key, fallback]);
  return title;
}

/** Resalta la última palabra con el color principal, como el resto de los títulos. */
function TwoTone({ text }: { text: string }) {
  const i = text.trim().lastIndexOf(" ");
  if (i < 0) return <span className="text-primary">{text}</span>;
  return (
    <>
      {text.slice(0, i)} <span className="text-primary">{text.slice(i + 1)}</span>
    </>
  );
}

type Props = {
  /** Identificador estable de la sección, p. ej. "students". */
  titleKey: string;
  defaultTitle: string;
  className?: string;
  "data-tour-id"?: string;
};

export default function EditableTitle({ titleKey, defaultTitle, className, ...rest }: Props) {
  const { user } = useAuth();
  const title = useTeacherTitle(titleKey, defaultTitle);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const canEdit = user?.role === "teacher";

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const save = () => {
    const value = draft.trim().replace(/\s+/g, " ").slice(0, 60);
    if (user?.id) writeTitle(user.id, titleKey, value && value !== defaultTitle ? value : null);
    setEditing(false);
  };

  const headingClass = className ?? "text-5xl font-black tracking-tighter uppercase italic leading-none";

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="flex items-center gap-3 flex-wrap"
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
          maxLength={60}
          aria-label="Nuevo título de la sección"
          className={`${headingClass} bg-transparent border-b-2 border-primary outline-none min-w-0 w-full max-w-2xl`}
        />
        <button
          type="submit"
          className="p-3 rounded-xl bg-primary text-white hover:opacity-90"
          title="Guardar título"
        >
          <Check size={18} />
        </button>
        {title !== defaultTitle && (
          <button
            type="button"
            onClick={() => {
              if (user?.id) writeTitle(user.id, titleKey, null);
              setEditing(false);
            }}
            className="p-3 rounded-xl bg-secondary text-muted-foreground hover:text-foreground"
            title={`Volver a "${defaultTitle}"`}
          >
            <RotateCcw size={18} />
          </button>
        )}
      </form>
    );
  }

  return (
    <h1 className={`${headingClass} group/title flex items-center gap-3`} {...rest}>
      <span>
        <TwoTone text={title} />
      </span>
      {canEdit && (
        <button
          type="button"
          onClick={() => {
            setDraft(title);
            setEditing(true);
          }}
          className="opacity-30 group-hover/title:opacity-100 focus:opacity-100 transition-opacity p-2 rounded-xl hover:bg-secondary text-muted-foreground not-italic"
          title="Cambiar el título de esta sección (solo para vos)"
          aria-label="Cambiar el título de esta sección"
        >
          <Pencil size={18} />
        </button>
      )}
    </h1>
  );
}
