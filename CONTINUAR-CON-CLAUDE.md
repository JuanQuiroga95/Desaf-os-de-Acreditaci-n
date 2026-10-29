# Continuidad: experiencia de aprendizaje interactivo

## Objetivo acordado
Renovar la plataforma de acreditación con una presentación más atractiva y actividades que ayuden a aprender. Referencia conceptual: https://auramat.innovaducate.com/. Crear diseño y contenidos propios. Empezar con una experiencia de porcentajes y luego extender a otras materias.

## Primera entrega
- Inicio del alumno renovado, conservando materias y progreso obtenidos de getStudentDashboard.
- Práctica libre de porcentajes en /explorar/porcentajes: explicación, simulador de descuentos y tres retos con pistas, devolución y reintentos.
- La práctica no registra notas, no otorga acreditación y se reinicia al salir/recargar. No confundirla con los desafíos evaluados del docente.
- No se agregan videos ficticios ni se copian recursos de Auramat.

## Segunda entrega (2026-10-29)
- Verificado en navegador (escritorio 1366 px y móvil 390 px, temas claro/oscuro, movimiento reducido) con sesión real de alumno contra una base local de pruebas: progreso 0, progreso completo, error de carga y reintento. No se probó el estado "sin materias" (requiere una base sin materias).
- Correcciones: el foco de teclado se perdía al cambiar de etapa, al acertar y al pasar de reto en Misión descuentos (ahora va al título o al botón siguiente); el deslizador anuncia valor, pago y ahorro (aria-valuetext); etapas legibles en móvil; "Empezar con" cuando el progreso es 0; la barra lateral mostraba un 0% fijo y ahora muestra el progreso real (o nada mientras carga); student.ts, extract-pdf y roleplay-chat fallaban al importarse sin GROQ_API_KEY (ahora usan `|| ""` como las demás rutas); la materia del alumno enviaba al navegador el registro completo de los docentes, con email y hash de contraseña (ahora solo id y nombre) y mostraba "Docente: Desconocido"; el encabezado de materia desbordaba en móvil.
- Actividades en unidades (paso 4): catálogo en src/lib/activities.ts; modelos UnitActivity (actividad publicada en una unidad, con `visible`) y ActivityAttempt (cada respuesta: itemId, answer, correct). Acciones en src/app/actions/activities.ts: el docente de la materia (o admin) publica/oculta y ve resultados; el alumno con acceso a la materia (mismo criterio de inscripción que getStudentDashboard) responde y el servidor valida que la opción exista y calcula si es correcta. No hay notas, monedas ni puntos. Ocultar conserva los intentos.
- UI: panel "Actividades interactivas" en /docente/unidad/[id] (por reto: resueltos, errores y cuántos eligieron el ahorro en vez del precio final; por alumno: resueltos, intentos y dónde le costó); tarjeta "Actividades para practicar" en la unidad de /subjects/[id]; ruta /actividades/[id] que reutiliza PercentageLab en modo registrado. /explorar/porcentajes sigue siendo práctica libre sin registro.
- Probado: publicar, ocultar (404 para el alumno, intentos conservados), volver a publicar, progreso guardado ("Ya resolviste 2 de 3"), y llamadas directas por POST a las acciones con valores alterados, alumno sin inscripción, docente respondiendo y alumno publicando o leyendo estadísticas: todas rechazadas.
- `npx next build` (sin db push) completo. ESLint sin errores en archivos nuevos. `tsc` sigue con los errores previos listados abajo; ninguno en archivos nuevos.
- **Base de datos:** el esquema agrega dos tablas y relaciones (cambio aditivo). Solo se aplicó a una base PGlite local en el scratchpad; `.env` apunta a Neon y no se usó. Ojo: en Vercel, vercel.json reemplaza el script `build` por `prisma generate && next build` (sin db push), así que el despliegue NO crea estas tablas. Antes de desplegar este código a producción hay que crear UnitActivity y ActivityAttempt en esa base (por ejemplo `npx prisma db push` revisando el plan); si no, /subjects/[id] falla porque getSubjectChallenges consulta `units.activities`.

## Tercera entrega: apartado Juegos (2026-10-29)
- Basado en lo que cargaron los docentes de Matemática 1 en producción (Encuentro A: variables, media, mediana, moda; lectura de solo consulta). Nota: en los materiales EXERCISE de producción se perdieron las letras "s" al extraer el texto del PDF; las versiones como desafío están bien.
- Nuevo juego "Detectives de datos" (src/components/learning/DataDetectives.tsx): clasificar 6 variables (cualitativa, discreta, continua) y encontrar moda, mediana y media con datos que se pueden ordenar en pantalla y un gráfico de puntos. Detecta errores típicos (frecuencia en lugar de valor, mediana sin ordenar, suma sin dividir, contar o medir).
- Catálogo generalizado (src/lib/activities.ts): cada actividad tiene `kind`, opciones como texto y errores frecuentes con código; el panel docente los muestra. Sin cambios de esquema: ActivityAttempt.answer ya era texto y los intentos anteriores siguen evaluándose igual.
- Piezas comunes extraídas en src/components/learning/shared.tsx (marco, etapas, corrección local o en servidor, devolución y foco). PercentageLab las usa.
- Apartado /juegos (barra lateral del alumno y sección "Juegos para practicar" en el inicio) y práctica libre en /explorar/estadistica. /actividades/[id] elige el juego según `kind`.

## Instrucciones para continuar
1. Leer AGENTS.md y las guías pertinentes de node_modules/next/dist/docs/ antes de programar. Revisar git diff para conservar el trabajo existente.
2. Probar el inicio con una sesión de alumno, materias vacías, error de carga, progreso cero y progreso completo. Revisar móvil y los temas claro/oscuro.
3. Probar el recorrido de porcentajes con teclado: controles, respuestas incorrectas, pistas, respuestas correctas, resumen y reinicio. Respetar movimiento reducido.
4. (Hecho en la segunda entrega; el paso 8 también, para esta actividad.) Integrar actividades a las unidades docentes: primero revisar schema.prisma, acciones de autenticación y autorización, y componentes de materia. Diseñar persistencia por alumno y actividad, con validación en servidor y sin aceptar notas calculadas por el cliente.
5. Añadir una biblioteca filtrable por materia, tema y tipo aprovechando materiales existentes. Mantener estados vacíos y manejo de errores.
6. Producir una segunda experiencia (fracciones o comprensión lectora) y recién entonces extraer componentes comunes que realmente compartan ambas.
7. Agregar videos propios o autorizados, con subtítulos/transcripción, sin reproducción automática. La primera entrega contiene una explicación interactiva, no un video producido.
8. Mostrar al docente intentos y dificultades únicamente cuando exista persistencia real. No inventar métricas, rachas, puntos ni progreso.

## Restricciones técnicas
- No ejecutar npm run build sin revisar package.json: actualmente ejecuta prisma db push --accept-data-loss. Para compilar usar npx prisma generate y npx next build sin sincronizar la base.
- No modificar la base de producción ni publicar automáticamente.
- Conservar roles, navegación, tutor, desafíos, materiales y atributos data-tour-id.
- El status locked que devuelve getStudentDashboard se asigna a materias con progreso cero; no representa una restricción real de acceso. No bloquearlas en la interfaz.
- No introducir otra librería de animación: ya existe framer-motion, y CSS basta para transiciones sencillas.

## Validación realizada
- ESLint de los tres archivos TSX modificados/nuevos: aprobado.
- Prisma Client generado sin modificar la base.
- `npx next build`: compiló el código; se detuvo al recopilar datos de /api/roleplay-chat por falta de GROQ_API_KEY. No inventar una clave para dar por validado el despliegue.
- `npx tsc --noEmit`: detectó errores en archivos existentes (acciones chat/store/student, pantallas docentes, Sidebar, AITutor y scripts de scratch). Revisarlos como trabajo separado; la configuración existente de Next omite la validación de tipos al compilar.
- `npm ci` falló porque el lockfile no coincidía con package.json. Se ejecutó `npm install --include=dev`, actualizando package-lock.json para reflejar Supabase en lugar de la dependencia anterior de Vercel Blob. No se añadieron dependencias de producto nuevas.
- Pendiente: prueba visual y funcional en navegador, en particular la sesión autenticada del alumno. No dar por probada una sesión si no se ejecutó.
- Cambios locales, sin publicación ni migración de base de datos.
