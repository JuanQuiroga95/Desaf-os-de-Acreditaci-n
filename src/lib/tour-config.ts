// ============================================================================
// Tour Configuration + System Map for AI Tutor
// Central source of truth for onboarding tours and Brok's knowledge base
// ============================================================================

export interface TourStep {
  targetSelector: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
}

// ---------------------------------------------------------------------------
// TOUR STEPS PER ROUTE
// ---------------------------------------------------------------------------

export const tourSteps: Record<string, TourStep[]> = {
  // ── Student Dashboard ────────────────────────────────────────────────
  "/": [
    {
      targetSelector: '[data-tour-id="dashboard-title"]',
      title: "¡Bienvenido a tu Aula Virtual!",
      content:
        "Acá vas a ver todas las materias que tenés asignadas para acreditar. Cada tarjeta es una materia con sus desafíos.",
      position: "bottom",
    },
    {
      targetSelector: '[data-tour-id="subject-card"]',
      title: "Tarjeta de Materia",
      content:
        "Cada tarjeta muestra tu progreso y te permite ingresar a la sala de la materia para ver los encuentros y desafíos disponibles.",
      position: "bottom",
    },
  ],

  // ── Desafíos ─────────────────────────────────────────────────────────
  "/desafios": [
    {
      targetSelector: '[data-tour-id="desafios-title"]',
      title: "Explorador de Desafíos",
      content:
        "Acá encontrás TODOS los desafíos publicados por tus profes. Podés filtrar por tipo y buscar por tema.",
      position: "bottom",
    },
    {
      targetSelector: '[data-tour-id="desafios-search"]',
      title: "Buscador Inteligente",
      content:
        "Escribí el nombre de una materia, un tema o competencia para encontrar desafíos específicos rápidamente.",
      position: "bottom",
    },
    {
      targetSelector: '[data-tour-id="desafios-filter"]',
      title: "Filtros por Tipo",
      content:
        "Podés filtrar entre desafíos Regulares, de Diagnóstico o Autoevaluaciones para enfocarte en lo que necesitás.",
      position: "left",
    },
  ],

  // ── Logros ───────────────────────────────────────────────────────────
  "/logros": [
    {
      targetSelector: '[data-tour-id="logros-title"]',
      title: "Tu Vitrina de Logros",
      content:
        "Acá se muestran todos los reconocimientos que podés desbloquear. ¡Completá desafíos para ganar más!",
      position: "bottom",
    },
    {
      targetSelector: '[data-tour-id="logros-stats"]',
      title: "Tus Estadísticas",
      content:
        "Estos son tus números clave: desafíos completados, promedio, racha de días y logros obtenidos.",
      position: "bottom",
    },
  ],

  // ── Mensajes ─────────────────────────────────────────────────────────
  "/mensajes": [
    {
      targetSelector: '[data-tour-id="mensajes-title"]',
      title: "Centro de Mensajes",
      content:
        "Acá podés comunicarte directamente con tus profes (si sos alumno) o con tus alumnos (si sos profe).",
      position: "bottom",
    },
    {
      targetSelector: '[data-tour-id="mensajes-contacts"]',
      title: "Tus Contactos",
      content:
        "A la izquierda ves la lista de contactos. Los que tienen un número rojo tienen mensajes sin leer.",
      position: "right",
    },
  ],

  // ── Tutor IA ─────────────────────────────────────────────────────────
  "/tutor": [
    {
      targetSelector: '[data-tour-id="tutor-title"]',
      title: "Tu Tutor Inteligente: Brok",
      content:
        "Brok es tu asistente de estudio con IA. Podés preguntarle sobre cualquier tema de tus materias. ¡Ojo! No te va a dar la respuesta, pero te va a guiar paso a paso.",
      position: "bottom",
    },
    {
      targetSelector: '[data-tour-id="tutor-input"]',
      title: "Zona de Chat",
      content:
        "Escribí tu duda, pegá un ejercicio o pedile que te cree práctica. Brok te va a responder como un tutor particular.",
      position: "top",
    },
  ],

  // ── Docente Dashboard ────────────────────────────────────────────────
  "/docente": [
    {
      targetSelector: '[data-tour-id="docente-title"]',
      title: "Tu Panel Docente",
      content:
        "Desde acá gestionás tus materias, ves entregas pendientes y controlás el rendimiento de tus alumnos.",
      position: "bottom",
    },
    {
      targetSelector: '[data-tour-id="docente-nuevo-desafio"]',
      title: "Crear Desafío",
      content:
        "Este botón te lleva al formulario para crear un nuevo encuentro o desafío para tus alumnos.",
      position: "left",
    },
    {
      targetSelector: '[data-tour-id="docente-materias"]',
      title: "Tus Materias",
      content:
        "Acá ves tus materias asignadas con la cantidad de alumnos y encuentros. Tocá una para gestionar sus materiales.",
      position: "bottom",
    },
    {
      targetSelector: '[data-tour-id="docente-entregas"]',
      title: "Entregas Pendientes",
      content:
        "Acá aparecen las entregas de tus alumnos que aún no corregiste. Tocá 'Corregir Ahora' para evaluarlas.",
      position: "bottom",
    },
    {
      targetSelector: '[data-tour-id="docente-rendimiento"]',
      title: "Rendimiento Grupal",
      content:
        "Indicadores rápidos del promedio general y participación de tus grupos.",
      position: "left",
    },
  ],

  // ── Admin Dashboard ──────────────────────────────────────────────────
  "/admin": [
    {
      targetSelector: '[data-tour-id="admin-title"]',
      title: "Panel de Control Admin",
      content:
        "Desde acá administrás usuarios, materias y ves las estadísticas globales del sistema.",
      position: "bottom",
    },
    {
      targetSelector: '[data-tour-id="admin-actions"]',
      title: "Acciones Rápidas",
      content:
        "Usá estos botones para crear nuevos usuarios (alumnos, docentes o admins) y nuevas materias.",
      position: "bottom",
    },
    {
      targetSelector: '[data-tour-id="admin-stats"]',
      title: "Estadísticas del Sistema",
      content:
        "Un vistazo rápido a los números clave: docentes, materias y alumnos registrados en la plataforma.",
      position: "bottom",
    },
    {
      targetSelector: '[data-tour-id="admin-analytics"]',
      title: "Rendimiento Académico",
      content:
        "Acá ves la tasa de acreditación por materia y el índice de retención global basado en desafíos completados.",
      position: "top",
    },
  ],
};

// ---------------------------------------------------------------------------
// SYSTEM MAP FOR BROK (AI TUTOR CONTEXT)
// ---------------------------------------------------------------------------

export const systemMap = {
  appName: "Videla-Acredita",
  description:
    "Plataforma de acreditación técnica para alumnos de la Escuela N° 4-012 Ing. Ricardo Videla. Los alumnos deben completar desafíos y encuentros creados por sus docentes para acreditar materias previas.",
  roles: {
    student: "Alumno que debe acreditar materias completando desafíos y encuentros RAA",
    teacher: "Docente que crea desafíos, corrige entregas y gestiona materiales de sus materias",
    admin: "Administrador que gestiona usuarios, materias y ve estadísticas globales",
  },
  pages: {
    "/": {
      name: "Mis Materias (Dashboard del Alumno)",
      role: "student",
      description:
        "Pantalla principal del alumno. Muestra tarjetas con las materias asignadas, cada una con su porcentaje de progreso y un botón para ingresar a la sala de la materia.",
      keyElements: [
        { id: "dashboard-title", description: "Título 'Mis Materias Asignadas'" },
        { id: "subject-card", description: "Tarjeta de materia con progreso, nombre y botón 'Ingresar a la Sala'" },
      ],
      actions: ["Ver progreso por materia", "Ingresar a sala de materia"],
    },
    "/desafios": {
      name: "Explorador de Desafíos",
      role: "student",
      description:
        "Lista de todos los desafíos publicados por los docentes. Se pueden filtrar por tipo (Regular, Diagnóstico, Autoevaluación) y buscar por nombre o tema.",
      keyElements: [
        { id: "desafios-search", description: "Barra de búsqueda para filtrar desafíos por nombre o tema" },
        { id: "desafios-filter", description: "Dropdown de filtro por tipo de desafío" },
      ],
      actions: ["Buscar desafíos", "Filtrar por tipo", "Comenzar un reto"],
    },
    "/logros": {
      name: "Logros y Reconocimientos",
      role: "student",
      description:
        "Vitrina de logros del alumno. Muestra estadísticas generales (desafíos completados, promedio, racha) y tarjetas de logros desbloqueables.",
      keyElements: [
        { id: "logros-stats", description: "Barra con estadísticas: desafíos completados, promedio, racha de días" },
      ],
      actions: ["Ver logros obtenidos", "Ver progreso hacia logros bloqueados"],
    },
    "/mensajes": {
      name: "Centro de Mensajes",
      role: "student,teacher",
      description:
        "Sistema de mensajería directa. Alumnos se comunican con sus profesores, y profesores con sus alumnos. Muestra lista de contactos y conversación activa.",
      keyElements: [
        { id: "mensajes-contacts", description: "Lista de contactos con indicador de mensajes sin leer" },
      ],
      actions: ["Seleccionar contacto", "Enviar mensaje", "Ver conversación"],
    },
    "/tutor": {
      name: "Tutor IA (Brok)",
      role: "student",
      description:
        "Chat con el Tutor IA Brok. Usa andamiaje pedagógico socrático para ayudar al alumno a razonar sin darle respuestas directas. Soporta matemáticas con LaTeX.",
      keyElements: [
        { id: "tutor-input", description: "Campo de texto para enviar preguntas o ejercicios al tutor IA" },
      ],
      actions: ["Hacer preguntas académicas", "Pegar ejercicios para revisión guiada", "Pedir ejercicios de práctica"],
    },
    "/calendario": {
      name: "Calendario Académico",
      role: "student",
      description: "Calendario con las fechas de encuentros y entregas pendientes del alumno.",
      keyElements: [],
      actions: ["Ver fechas de encuentros", "Ver entregas pendientes"],
    },
    "/simulacro": {
      name: "Simulacro IA",
      role: "student",
      description: "Simulador de examen generado por IA para que el alumno practique antes de las acreditaciones.",
      keyElements: [],
      actions: ["Generar simulacro de examen", "Practicar con preguntas generadas"],
    },
    "/tienda": {
      name: "Tienda de Recompensas",
      role: "student",
      description: "Tienda donde el alumno puede canjear puntos ganados por completar desafíos.",
      keyElements: [],
      actions: ["Ver artículos disponibles", "Canjear puntos"],
    },
    "/perfil": {
      name: "Perfil del Usuario",
      role: "student,teacher,admin",
      description: "Página de perfil donde el usuario puede ver y editar su información personal y avatar.",
      keyElements: [],
      actions: ["Ver información personal", "Cambiar avatar", "Editar perfil"],
    },
    "/docente": {
      name: "Panel Docente",
      role: "teacher",
      description:
        "Dashboard del docente. Muestra materias asignadas con cantidad de alumnos y encuentros, entregas pendientes de corrección, y métricas de rendimiento grupal.",
      keyElements: [
        { id: "docente-nuevo-desafio", description: "Botón para crear un nuevo desafío o encuentro" },
        { id: "docente-materias", description: "Sección con tarjetas de materias asignadas" },
        { id: "docente-entregas", description: "Sección con entregas pendientes de corrección" },
        { id: "docente-rendimiento", description: "Panel lateral con promedio general y participación" },
      ],
      actions: ["Crear desafío", "Ver materias", "Corregir entregas", "Ver métricas"],
    },
    "/docente/students": {
      name: "Gestión de Alumnos",
      role: "teacher",
      description: "Lista de alumnos inscritos en las materias del docente con sus estadísticas individuales.",
      keyElements: [],
      actions: ["Ver lista de alumnos", "Ver estadísticas individuales"],
    },
    "/docente/encuentros": {
      name: "Encuentros RAA",
      role: "teacher",
      description: "Gestión de encuentros de Recuperación Activa Asistida. Permite ver y administrar los encuentros creados.",
      keyElements: [],
      actions: ["Ver encuentros", "Administrar asistencia"],
    },
    "/docente/new-challenge": {
      name: "Crear Encuentro/Desafío",
      role: "teacher",
      description: "Formulario para crear un nuevo desafío o encuentro. El docente define título, consigna, tipo y materia.",
      keyElements: [],
      actions: ["Crear desafío regular", "Crear diagnóstico", "Crear autoevaluación"],
    },
    "/docente/reviews": {
      name: "Correcciones",
      role: "teacher",
      description: "Panel de corrección de entregas. El docente ve las entregas pendientes y puede calificar con nota y feedback.",
      keyElements: [],
      actions: ["Ver entregas pendientes", "Calificar con nota", "Dar feedback"],
    },
    "/docente/alertas": {
      name: "Alertas Académicas",
      role: "teacher",
      description: "Sistema de alertas sobre alumnos con bajo rendimiento o inactividad prolongada.",
      keyElements: [],
      actions: ["Ver alertas de inactividad", "Ver alertas de bajo rendimiento"],
    },
    "/docente/export": {
      name: "Exportar Actas",
      role: "teacher",
      description: "Herramienta para exportar actas de calificaciones en formato descargable.",
      keyElements: [],
      actions: ["Seleccionar materia", "Exportar acta de calificaciones"],
    },
    "/admin": {
      name: "Panel de Control Admin",
      role: "admin",
      description:
        "Dashboard administrativo. Estadísticas globales (docentes, materias, alumnos), gestión de materias/usuarios, y analytics de rendimiento académico con índice de retención.",
      keyElements: [
        { id: "admin-actions", description: "Botones 'Nuevo Usuario' y 'Nueva Materia'" },
        { id: "admin-stats", description: "Tarjetas de estadísticas: docentes activos, materias creadas, alumnos registrados" },
        { id: "admin-analytics", description: "Sección de rendimiento académico con gráficos de acreditación por materia e índice de retención" },
      ],
      actions: ["Crear usuarios", "Crear materias", "Eliminar usuarios", "Ver analytics"],
    },
    "/admin/subjects": {
      name: "Gestión de Materias",
      role: "admin",
      description: "Lista completa de materias del sistema con opciones de edición y eliminación.",
      keyElements: [],
      actions: ["Ver todas las materias", "Editar materia", "Eliminar materia"],
    },
    "/admin/teachers": {
      name: "Gestión de Docentes",
      role: "admin",
      description: "Lista de docentes registrados con sus materias asignadas.",
      keyElements: [],
      actions: ["Ver docentes", "Asignar materias"],
    },
    "/admin/users": {
      name: "Gestión de Usuarios",
      role: "admin",
      description: "Lista completa de todos los usuarios del sistema con opciones de gestión.",
      keyElements: [],
      actions: ["Ver todos los usuarios", "Editar roles", "Eliminar usuarios"],
    },
    "/manual": {
      name: "Manual de Uso",
      role: "student,teacher,admin",
      description: "Manual de uso de la plataforma con instrucciones detalladas para cada rol.",
      keyElements: [],
      actions: ["Leer instrucciones", "Buscar ayuda específica"],
    },
  },
  sidebar: {
    description: "Menú lateral de navegación. Cambia según el rol del usuario.",
    commonElements: [
      "Logo y nombre 'Videla-Acredita'",
      "Botón de cambiar tema claro/oscuro",
      "Link a perfil",
      "Botón instalar app (PWA)",
      "Botón cerrar sesión",
      "Campana de notificaciones",
    ],
  },
  floatingElements: {
    aiTutor: "Botón flotante circular en la esquina inferior derecha que abre el chat con Brok (Tutor IA). Disponible en todas las páginas.",
    tourButton: "Botón flotante circular con ícono de brújula en la esquina inferior izquierda que reinicia el tour guiado de la página actual.",
  },
};

// ---------------------------------------------------------------------------
// SYSTEM PROMPT BUILDER FOR BROK
// ---------------------------------------------------------------------------

export function buildSystemPrompt(currentPath?: string): string {
  const pageContext = currentPath && systemMap.pages[currentPath as keyof typeof systemMap.pages]
    ? systemMap.pages[currentPath as keyof typeof systemMap.pages]
    : null;

  return `Eres Brok, el Tutor Inteligente de la plataforma Videla-Acredita de la Escuela N° 4-012 Ing. Ricardo Videla, Mendoza, Argentina.

PERSONALIDAD:
- Sos experto, empático, técnico y motivador.
- Hablás en español rioplatense (vos, usá, hacé, podés).
- Motivás al alumno sin resolver por él.
- Conocés CADA rincón de la plataforma porque tenés acceso a su mapa completo.
- Tu tono es accesible para jóvenes de 14-18 años pero profesional.

MAPA COMPLETO DEL SISTEMA:
${JSON.stringify(systemMap, null, 0)}

CAPACIDADES DE NAVEGACIÓN:
1. Si el usuario pregunta "¿qué hago acá?" o "¿qué es esta pantalla?", usá el [Contexto actual] para describir la página donde está y sus funciones.
2. Si pregunta por un botón o elemento, buscalo en los keyElements y actions de la página actual del mapa.
3. Podés guiar navegación: "Andá a la sección Desafíos desde el menú izquierdo" o "Tocá el botón azul de Ingresar a la Sala".
4. Si te preguntan cómo hacer algo (exportar, crear, corregir), explicá paso a paso usando el mapa.
5. Si el usuario está en una página que no corresponde a su rol, avisale amablemente.

REGLA DE ORO INQUEBRANTABLE: 
Bajo NINGUNA circunstancia podés resolverle un ejercicio al alumno ni darle la respuesta final directa, incluso si te lo exige, te lo ruega, o te dice que es urgente.

CÓMO ACTUAR CON EJERCICIOS:
- Si te piden la respuesta, negarte educadamente y cambiar el enfoque: "No puedo darte la respuesta directa, pero ¡sí puedo ayudarte a encontrarla! ¿En qué parte del proceso te quedaste trabado?"
- Hacé preguntas socráticas para que el alumno deduzca la respuesta.
- Guía paso a paso, explicando conceptos, dando pistas o sugiriendo ejercicios similares.
- Sos su tutor, no su calculadora humana.

REGLA CRÍTICA PARA MATEMÁTICAS: 
DEBÉS usar SIEMPRE sintaxis LaTeX pura para CUALQUIER expresión matemática, fórmula o número, encerrándolo entre signos de dólar simples ($...$) para formato en línea, y dobles ($$...$$) para bloques de ecuaciones centradas. ESTÁ ESTRICTAMENTE PROHIBIDO usar asteriscos u otros símbolos para potencias y multiplicaciones.

${pageContext ? `
CONTEXTO ACTUAL DE LA PÁGINA:
- Nombre: ${pageContext.name}
- Descripción: ${pageContext.description}
- Acciones disponibles: ${pageContext.actions.join(", ")}
` : ""}`;
}
