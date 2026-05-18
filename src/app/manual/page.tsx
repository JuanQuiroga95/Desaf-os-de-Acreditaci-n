"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  BookOpen, ChevronDown, ChevronUp, Zap, Trophy, MessageSquare,
  CalendarDays, Brain, User, LayoutDashboard, Search, Upload,
  PlusCircle, ClipboardList, AlertTriangle, Download, Users2,
  GraduationCap, BookMarked, Settings, Shield, Lightbulb,
  CheckCircle2, ArrowRight, Info, Star, FileText, Video,
  Award, TrendingUp, Flame, Lock, Play, Send, Sparkles,
  Users, BarChart2, UserPlus, Clock, MapPin, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  text: string;
}

interface Tip {
  text: string;
  type?: "info" | "warn" | "success";
}

interface Section {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  steps: Step[];
  tips?: Tip[];
}

// ─── CONTENIDO POR ROL ───────────────────────────────────────────────

const studentSections: Section[] = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Mis Materias",
    subtitle: "Tu punto de partida cada vez que entrás al sistema",
    color: "text-blue-500",
    steps: [
      { text: "Al iniciar sesión llegás directo a tu panel de materias. Cada tarjeta muestra una materia en la que estás inscripto." },
      { text: "La barra de progreso de cada materia refleja cuántos desafíos completaste sobre el total disponible." },
      { text: "Hacé click en una materia para entrar a su página, donde encontrás los materiales y desafíos del docente." },
      { text: "Si no ves ninguna materia, pedile al administrador que te inscriba en las materias correspondientes." },
    ],
    tips: [
      { text: "La barra lateral muestra tu progreso global como alumno.", type: "info" },
    ],
  },
  {
    id: "materiales",
    icon: BookOpen,
    title: "Materiales de Estudio",
    subtitle: "Accedé a toda la teoría, videos y ejercicios de tus materias",
    color: "text-green-500",
    steps: [
      { text: "Dentro de cada materia, los materiales están organizados por tipo: Teoría, Videos, Ejercicios, Prompts IA, Plantillas TP y Rúbricas." },
      { text: "Los materiales de Teoría pueden tener PDFs adjuntos. Hacé click en el botón de descarga para verlos." },
      { text: "En materiales de Teoría vas a ver el botón 'Ficha IA' (ícono ✨). Hacé click para que la IA genere automáticamente un resumen del tema con puntos clave y preguntas de repaso." },
      { text: "Los videos se reproducen directamente en la página si están subidos como archivo, o se abren en una nueva pestaña si son un enlace externo." },
      { text: "Los materiales con el ícono de copiado son Prompts IA: textos que podés copiar y pegar directamente en el Tutor para trabajar con ese tema." },
    ],
    tips: [
      { text: "Usá 'Ficha IA' antes de resolver un desafío para repasar el tema rápidamente.", type: "success" },
    ],
  },
  {
    id: "desafios",
    icon: Zap,
    title: "Desafíos",
    subtitle: "Resolvé los retos que propone tu docente para acreditar",
    color: "text-yellow-500",
    steps: [
      { text: "En la página de cada materia encontrás los desafíos disponibles ordenados por tipo: Diagnóstico → Regular → Autoevaluación." },
      { text: "Hacé click en 'Iniciar Desafío' para abrir el modal. Leé el objetivo y el contenido teórico antes de responder." },
      { text: "Según el tipo de pregunta, vas a escribir texto libre, elegir Verdadero/Falso o seleccionar una opción múltiple." },
      { text: "Si el desafío es un TP, podés subir un archivo (foto del trabajo en papel, PDF, etc.) con el botón de adjuntar." },
      { text: "Una vez que enviás, el estado pasa a 'Enviado'. El docente lo revisa y te asigna nota y feedback." },
      { text: "Los desafíos de Autoevaluación se corrigen automáticamente y ves tu nota al instante." },
      { text: "En el Explorador de Desafíos (/desafios) podés buscar por nombre, filtrar por tipo y ver tu estado en cada reto." },
    ],
    tips: [
      { text: "Si el tutor IA está disponible en el desafío, podés usarlo para orientarte — pero nunca te va a dar la respuesta directa.", type: "info" },
      { text: "Los desafíos de tipo Diagnóstico no tienen tutor IA disponible para mantener la objetividad.", type: "warn" },
    ],
  },
  {
    id: "tutor",
    icon: MessageSquare,
    title: "Tutor IA",
    subtitle: "Tu asistente pedagógico disponible las 24 horas",
    color: "text-purple-500",
    steps: [
      { text: "El botón del Tutor IA aparece en la esquina inferior derecha de la pantalla en todo momento (ícono de chat)." },
      { text: "También tenés una página dedicada en /tutor con más espacio para trabajar." },
      { text: "Podés pegarle directamente un ejercicio o texto y pedirle que te lo explique paso a paso." },
      { text: "Usá los botones de acceso rápido: 'Corregir ejercicio', 'Explicar concepto', 'Crear práctica', 'Idea Principal'." },
      { text: "El tutor usa LaTeX para las fórmulas matemáticas: las vas a ver bien formateadas en pantalla." },
      { text: "El tutor NO te da las respuestas directas — te guía con andamiaje para que vos llegues a la solución." },
    ],
    tips: [
      { text: "Cuanto más contexto le des (pegá el enunciado completo), mejor va a ser la ayuda.", type: "success" },
      { text: "El historial del chat se borra al cerrar la pestaña. Si necesitás guardar algo, copialo antes.", type: "warn" },
    ],
  },
  {
    id: "logros",
    icon: Trophy,
    title: "Logros",
    subtitle: "Reconocimientos reales basados en tu desempeño",
    color: "text-orange-500",
    steps: [
      { text: "Entrá a /logros desde el menú lateral para ver tus 7 logros posibles." },
      { text: "Cada logro tiene una barra de progreso que muestra cuánto te falta para desbloquearlo." },
      { text: "Los 4 stats de arriba (desafíos completados, promedio, racha de días, logros) se calculan en tiempo real desde la base de datos." },
      { text: "La 'Racha de días' cuenta cuántos días consecutivos enviaste al menos una respuesta. ¡No la rompas!" },
    ],
    tips: [
      { text: "Para desbloquear 'Alumno Destacado' necesitás un promedio mayor a 7 con al menos 3 notas cargadas.", type: "info" },
    ],
  },
  {
    id: "calendario",
    icon: CalendarDays,
    title: "Calendario de Mesas",
    subtitle: "Fechas de examen de tus materias inscriptas",
    color: "text-red-500",
    steps: [
      { text: "Entrá a /calendario desde el menú lateral para ver las fechas de mesa de tus materias." },
      { text: "Las fechas están agrupadas por mes y ordenadas cronológicamente." },
      { text: "El badge de color indica urgencia: Rojo = menos de 7 días, Amarillo = 7 a 14 días, Verde = más de 14 días." },
      { text: "Las fechas que ya pasaron se muestran en gris con el estado 'Finalizada'." },
      { text: "Si no ves ninguna fecha, significa que el docente o administrador aún no las cargó." },
    ],
    tips: [
      { text: "Las fechas las carga el administrador desde el panel de materias. Si no están, consultá con tu institución.", type: "info" },
    ],
  },
  {
    id: "simulacro",
    icon: Brain,
    title: "Simulacro de Examen IA",
    subtitle: "Practicá la mesa antes de la fecha real",
    color: "text-pink-500",
    steps: [
      { text: "Entrá a /simulacro desde el menú lateral." },
      { text: "Elegí la materia para la cual querés practicar del selector desplegable." },
      { text: "Hacé click en 'Iniciar Simulacro' para comenzar. La IA va a hacerte 5 preguntas como si fuera un examen oral." },
      { text: "Respondé cada pregunta en el cuadro de texto y enviá con el botón o presionando Enter." },
      { text: "La barra de progreso arriba muestra en qué pregunta vas (1/5, 2/5, etc.)." },
      { text: "Cuando terminás las 5 preguntas, la IA analiza todas tus respuestas y te da una devolución final con nota estimada, fortalezas y aspectos a reforzar." },
      { text: "Podés volver a intentarlo las veces que quieras con el botón 'Volver a intentar'." },
    ],
    tips: [
      { text: "Usá el simulacro 2 o 3 días antes de la mesa para identificar qué temas te quedan débiles.", type: "success" },
    ],
  },
  {
    id: "perfil",
    icon: User,
    title: "Mi Perfil",
    subtitle: "Gestioná tus datos personales",
    color: "text-muted-foreground",
    steps: [
      { text: "Accedé a tu perfil desde el link 'Mi Perfil' en la parte inferior del menú lateral." },
      { text: "Podés cambiar tu nombre y correo electrónico desde el formulario de datos personales." },
      { text: "Para cambiar la contraseña, ingresá tu contraseña actual y luego la nueva dos veces para confirmar." },
      { text: "Los cambios se guardan inmediatamente al hacer click en el botón correspondiente." },
    ],
  },
];

const teacherSections: Section[] = [
  {
    id: "panel",
    icon: LayoutDashboard,
    title: "Panel Principal del Docente",
    subtitle: "Visión general de tus clases y pendientes",
    color: "text-blue-500",
    steps: [
      { text: "Al ingresar como docente llegás al panel en /docente. Muestra tus materias con cantidad de alumnos y desafíos." },
      { text: "La sección 'Entregas Pendientes' muestra en tiempo real los trabajos enviados por alumnos que aún no calificaste." },
      { text: "Hacé click en cualquier materia para ir directamente a su gestión de materiales." },
    ],
  },
  {
    id: "materiales",
    icon: Upload,
    title: "Gestión de Materiales",
    subtitle: "Subí y organizá el contenido de tus materias",
    color: "text-green-500",
    steps: [
      { text: "Desde tu panel, hacé click en el ícono de materiales de una materia para ir a /docente/materiales/[id]." },
      { text: "Podés agregar 6 tipos de materiales: Teoría (texto/PDF/DOC), Video (archivo o URL), Ejercicios por nivel, Prompts IA, Plantilla TP y Rúbrica." },
      { text: "Para subir un archivo de Teoría: elegí tipo 'Teoría', completá el título, pegá el contenido de texto (o déjalo vacío) y subí el PDF con el botón de adjuntar." },
      { text: "Para videos: podés subir el archivo de video directamente o pegar una URL de YouTube/Drive." },
      { text: "Usá el switch de visibilidad (ojo) para mostrar u ocultar materiales a los alumnos sin tener que borrarlos." },
      { text: "El orden de los materiales se puede definir con el campo 'Orden' — número menor aparece primero." },
    ],
    tips: [
      { text: "Los Prompts IA son textos que el alumno puede copiar y pegarle al Tutor para trabajar ese tema guiado.", type: "info" },
      { text: "Subí la Rúbrica de evaluación para que los alumnos conozcan los criterios antes de responder.", type: "success" },
    ],
  },
  {
    id: "desafios",
    icon: PlusCircle,
    title: "Crear Desafíos",
    subtitle: "Diseñá los retos de acreditación para tus alumnos",
    color: "text-yellow-500",
    steps: [
      { text: "Desde el menú lateral, entrá a 'Crear Encuentro' (/docente/new-challenge)." },
      { text: "Elegí la materia asociada, escribí el título y el objetivo pedagógico del desafío." },
      { text: "Seleccioná el tipo: Módulo de Aprendizaje (con Tutor IA disponible), Diagnóstico (sin IA) o Autoevaluación (autocorrección automática)." },
      { text: "Escribí el contenido teórico/contexto del desafío y agregá las preguntas. Cada pregunta puede ser: Texto libre, Verdadero/Falso u Opciones múltiples." },
      { text: "Para importar desde un PDF: hacé click en 'Importar desde PDF (IA)', subí el archivo y la IA va a extraer automáticamente el título, objetivo y preguntas." },
      { text: "Revisá el contenido extraído en el modal de previsualización antes de aceptarlo — podés editarlo." },
      { text: "Hacé click en 'Publicar Desafío en el Aula' para que sea visible para los alumnos." },
    ],
    tips: [
      { text: "En Autoevaluación, la respuesta esperada de cada pregunta debe ser exacta — la IA la compara con lo que escribe el alumno.", type: "warn" },
      { text: "Los desafíos de Diagnóstico sirven para evaluar el nivel inicial sin que el alumno tenga ayuda.", type: "info" },
    ],
  },
  {
    id: "correcciones",
    icon: ClipboardList,
    title: "Centro de Correcciones",
    subtitle: "Calificá y devolvé feedback a los alumnos",
    color: "text-purple-500",
    steps: [
      { text: "Entrá a /docente/reviews desde el menú 'Correcciones'. Ves todas las entregas pendientes de calificar." },
      { text: "Filtrá por nombre de alumno o título de desafío con la barra de búsqueda." },
      { text: "Hacé click en 'Corregir' para abrir el modal con las respuestas del alumno." },
      { text: "Leé las respuestas del alumno junto con las respuestas esperadas del desafío." },
      { text: "Opcional: hacé click en 'Sugerencia IA' (ícono ✨) para que la IA analice las respuestas según la rúbrica y sugiera una nota con justificación." },
      { text: "Hacé click en 'Aplicar Sugerencia' para pre-rellenar los campos con lo que propone la IA, o escribí tu propia nota (1-10) y feedback pedagógico." },
      { text: "Confirmá con 'Confirmar Calificación' para enviar la nota al alumno." },
    ],
    tips: [
      { text: "La nota y el feedback quedan visibles para el alumno en su historial de intentos dentro del desafío.", type: "info" },
      { text: "La Sugerencia IA es orientativa — siempre tenés la última palabra en la calificación.", type: "success" },
    ],
  },
  {
    id: "alumnos",
    icon: GraduationCap,
    title: "Legajo de Alumnos",
    subtitle: "Seguimiento individual de cada estudiante",
    color: "text-blue-400",
    steps: [
      { text: "Desde el menú 'Alumnos' (/docente/students) ves la lista completa de alumnos inscriptos en tus materias." },
      { text: "Buscá por nombre o email con la barra de búsqueda." },
      { text: "Hacé click en el nombre de un alumno para ver su legajo completo." },
      { text: "El legajo muestra: materias inscriptas, desafíos completados con notas y feedback, y el historial de encuentros RAA registrados." },
    ],
  },
  {
    id: "alertas",
    icon: AlertTriangle,
    title: "Alertas de Riesgo",
    subtitle: "Detectá alumnos que necesitan atención prioritaria",
    color: "text-red-500",
    steps: [
      { text: "Entrá a /docente/alertas desde el menú lateral." },
      { text: "El sistema analiza automáticamente: días sin actividad, porcentaje de desafíos completados y promedio de notas." },
      { text: "Cada alumno tiene un nivel de riesgo: ALTO (rojo), MEDIO (naranja) o BAJO (amarillo)." },
      { text: "Las tarjetas muestran exactamente por qué el alumno está en riesgo: 'Sin actividad hace X días', 'Solo completó 20%', etc." },
      { text: "Filtrá por nivel de riesgo con los botones superiores para priorizar." },
      { text: "Hacé click en 'Ver Legajo' para ir directamente al perfil del alumno y tomar acción." },
    ],
    tips: [
      { text: "Revisá las alertas regularmente, especialmente en la semana previa a las fechas de mesa.", type: "success" },
    ],
  },
  {
    id: "encuentros",
    icon: Users2,
    title: "Encuentros RAA",
    subtitle: "Registrá los encuentros del régimen de Recuperación Activa",
    color: "text-teal-500",
    steps: [
      { text: "Entrá a /docente/encuentros desde el menú lateral." },
      { text: "Seleccioná la materia en los botones de la parte superior para ver sus encuentros." },
      { text: "Para registrar un nuevo encuentro, hacé click en 'Nuevo Encuentro'." },
      { text: "Completá: alumno (de los inscriptos en la materia), fecha, tipo (Presencial/Virtual), estado inicial y notas opcionales." },
      { text: "Desde la lista podés cambiar el estado rápidamente: ✓ Completado, ✗ Ausente, o volver a Pendiente." },
      { text: "Los encuentros quedan registrados en el legajo de cada alumno para un seguimiento completo." },
    ],
    tips: [
      { text: "Registrá los encuentros el mismo día para mantener el seguimiento al día.", type: "info" },
    ],
  },
  {
    id: "export",
    icon: Download,
    title: "Exportar Actas DGE",
    subtitle: "Generá planillas de seguimiento en formato compatible",
    color: "text-indigo-500",
    steps: [
      { text: "Entrá a /docente/export desde el menú 'Exportar Actas'." },
      { text: "Seleccioná la materia del desplegable. Aparece una preview de los datos de todos los alumnos inscriptos." },
      { text: "La tabla muestra: nombre, desafíos completados, promedio, nota máxima y estado (ACREDITADO / EN PROCESO / SIN ACTIVIDAD)." },
      { text: "Hacé click en 'Descargar Acta CSV' para generar el archivo." },
      { text: "El CSV incluye encabezado con nombre de la escuela, docente y fecha de emisión — compatible con planillas DGE." },
      { text: "Abrí el archivo en Excel o Google Sheets para editarlo o imprimirlo." },
    ],
    tips: [
      { text: "Un alumno figura como ACREDITADO cuando su promedio general es mayor o igual a 6.", type: "info" },
    ],
  },
];

const adminSections: Section[] = [
  {
    id: "panel",
    icon: BarChart2,
    title: "Panel de Control",
    subtitle: "Visión global del estado académico del ciclo",
    color: "text-blue-500",
    steps: [
      { text: "El panel admin en /admin muestra en tiempo real: docentes activos, materias creadas y alumnos registrados." },
      { text: "La sección 'Rendimiento Académico' muestra la tasa de acreditación por materia y el índice de retención global, calculados desde la base de datos." },
      { text: "Desde aquí podés crear usuarios y materias con los botones del encabezado." },
    ],
  },
  {
    id: "usuarios",
    icon: UserPlus,
    title: "Gestión de Usuarios",
    subtitle: "Creá y administrá todos los usuarios del sistema",
    color: "text-green-500",
    steps: [
      { text: "Hacé click en 'Nuevo Usuario' (botón gris del encabezado) para abrir el modal de creación." },
      { text: "Completá: nombre completo, correo electrónico, contraseña temporal y rol (Alumno, Docente o Administrador)." },
      { text: "La contraseña queda hasheada automáticamente — el usuario puede cambiarla desde su perfil." },
      { text: "Para eliminar un usuario, hacé click en el ícono de X rojo en su fila. Esta acción es irreversible." },
      { text: "La lista de usuarios recientes en el panel muestra los últimos 5. Para ver todos, andá a /admin/teachers." },
    ],
    tips: [
      { text: "No podés eliminarte a vos mismo desde el panel — medida de seguridad.", type: "warn" },
      { text: "Compartí la contraseña temporal con el usuario de forma segura y pedile que la cambie en el primer ingreso.", type: "info" },
    ],
  },
  {
    id: "materias",
    icon: BookMarked,
    title: "Gestión de Materias",
    subtitle: "Creá materias y asigná docentes titulares",
    color: "text-yellow-500",
    steps: [
      { text: "Hacé click en 'Nueva Materia' (botón primario del encabezado) para abrir el modal." },
      { text: "Completá el nombre, la descripción y seleccioná el docente titular del desplegable." },
      { text: "La materia queda disponible para que el docente suba materiales y desafíos." },
      { text: "Desde /admin/subjects podés ver todas las materias con opciones de edición, inscripciones y gestión de fechas." },
    ],
  },
  {
    id: "inscripciones",
    icon: Users,
    title: "Inscripción de Alumnos",
    subtitle: "Asigná alumnos a sus materias correspondientes",
    color: "text-purple-500",
    steps: [
      { text: "Andá a /admin/subjects (link 'Materias' del menú lateral)." },
      { text: "En la fila de cada materia, hacé click en 'Gestionar Inscripciones'." },
      { text: "El modal muestra los alumnos disponibles. Hacé click en el nombre para inscribirlo; aparece con un check verde." },
      { text: "Para desinscribir un alumno, hacé click nuevamente en su nombre." },
      { text: "Los alumnos inscriptos ven automáticamente la materia en su dashboard con los materiales y desafíos del docente." },
    ],
    tips: [
      { text: "Un alumno sin inscripciones ve todas las materias. Con al menos una inscripción, solo ve las suyas.", type: "info" },
    ],
  },
  {
    id: "fechas",
    icon: CalendarDays,
    title: "Fechas de Mesa de Examen",
    subtitle: "Cargá las fechas de examen para que los alumnos las vean en el calendario",
    color: "text-red-500",
    steps: [
      { text: "Andá a /admin/subjects y buscá la materia a la que querés agregar fechas." },
      { text: "Hacé click en el botón 'Fechas de Mesa' (ícono de calendario) en la fila de esa materia." },
      { text: "En el modal, completá: fecha, hora (opcional), aula (opcional) y observaciones (opcional)." },
      { text: "Hacé click en 'Agregar Fecha' para guardarla. Aparece listada en el modal." },
      { text: "Para eliminar una fecha, hacé click en el ícono de papelera junto a ella." },
      { text: "Las fechas quedan visibles para todos los alumnos inscriptos en esa materia en su página /calendario." },
    ],
    tips: [
      { text: "Cargá las fechas con al menos 2 semanas de anticipación para que los alumnos puedan prepararse.", type: "success" },
    ],
  },
  {
    id: "config",
    icon: Settings,
    title: "Configuración del Sistema",
    subtitle: "Ajustá los datos del perfil administrador",
    color: "text-muted-foreground",
    steps: [
      { text: "Accedé a /admin/settings desde el menú 'Configuración'." },
      { text: "En la pestaña 'Perfil de Administrador' podés actualizar tu nombre y correo institucional." },
      { text: "Los cambios se guardan inmediatamente y actualizan la sesión activa." },
    ],
  },
];

// ─── COMPONENTE SECCIÓN ───────────────────────────────────────────────

function SectionCard({ section, index }: { section: Section; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const Icon = section.icon;

  const tipColors = {
    info: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    warn: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    success: "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-8 hover:bg-secondary/20 transition-colors text-left"
      >
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-[1.25rem] bg-secondary flex items-center justify-center ${section.color}`}>
            <Icon size={26} />
          </div>
          <div>
            <h3 className="font-black text-lg uppercase tracking-tight leading-none mb-1">{section.title}</h3>
            <p className="text-[11px] text-muted-foreground font-medium">{section.subtitle}</p>
          </div>
        </div>
        <div className={`w-9 h-9 rounded-full border border-border flex items-center justify-center shrink-0 transition-all ${open ? "bg-primary text-white border-primary" : "bg-secondary text-muted-foreground"}`}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 space-y-6 border-t border-border pt-6">
              <ol className="space-y-3">
                {section.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[11px] mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-foreground/90 font-medium pt-0.5">{step.text}</p>
                  </li>
                ))}
              </ol>

              {section.tips && section.tips.length > 0 && (
                <div className="space-y-2 pt-2">
                  {section.tips.map((tip, i) => (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium ${tipColors[tip.type || "info"]}`}>
                      <Lightbulb size={16} className="shrink-0 mt-0.5" />
                      <span>{tip.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────

const roleConfig = {
  student: {
    label: "Alumno",
    title: "Manual del Alumno",
    subtitle: "Todo lo que podés hacer en Videla-Acredita",
    icon: GraduationCap,
    color: "text-blue-500",
    sections: studentSections,
    accent: "from-blue-500/10 to-transparent",
  },
  teacher: {
    label: "Docente",
    title: "Manual del Docente",
    subtitle: "Herramientas pedagógicas y de seguimiento RAA",
    icon: BookOpen,
    color: "text-green-500",
    sections: teacherSections,
    accent: "from-green-500/10 to-transparent",
  },
  admin: {
    label: "Administrador",
    title: "Manual del Administrador",
    subtitle: "Gestión completa del sistema educativo",
    icon: Shield,
    color: "text-purple-500",
    sections: adminSections,
    accent: "from-purple-500/10 to-transparent",
  },
};

export default function ManualPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-primary">
        Cargando Manual...
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const role = user.role as "student" | "teacher" | "admin";
  const config = roleConfig[role] ?? roleConfig.student;
  const TitleIcon = config.icon;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <header className="mb-14 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${config.accent} rounded-[3rem] -z-10`} />
        <div className="p-2">
          <div className={`flex items-center gap-3 mb-4 ${config.color}`}>
            <TitleIcon size={22} />
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">
              {config.label} · Escuela N° 4-012 Ing. Ricardo Videla
            </span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none mb-3">
            {config.title.split(" ").slice(0, 2).join(" ")}{" "}
            <span className="text-primary">
              {config.title.split(" ").slice(2).join(" ")}
            </span>
          </h1>
          <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.3em]">
            {config.subtitle}
          </p>
        </div>
      </header>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-card border border-border rounded-[2rem] p-5 text-center">
          <p className="text-3xl font-black">{config.sections.length}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Secciones</p>
        </div>
        <div className="bg-card border border-border rounded-[2rem] p-5 text-center">
          <p className="text-3xl font-black">{config.sections.reduce((a, s) => a + s.steps.length, 0)}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Pasos explicados</p>
        </div>
        <div className="bg-card border border-border rounded-[2rem] p-5 text-center">
          <p className="text-3xl font-black">{config.sections.filter(s => s.tips && s.tips.length > 0).length}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Secciones con tips</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {config.sections.map((section, i) => (
          <SectionCard key={section.id} section={section} index={i} />
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-12 p-8 bg-secondary/20 border border-border rounded-[2.5rem] flex items-start gap-4">
        <Info size={20} className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">¿Encontraste un problema?</p>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Si algo no funciona como se describe en este manual, consultá con el administrador del sistema.
            Este manual se actualiza automáticamente con cada nueva versión de la plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}
