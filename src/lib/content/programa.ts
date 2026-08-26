export const PROGRAMA_INTRO = [
  { n: "01", title: "Qué evaluamos", body: "Quince atributos técnicos, físicos y mentales, más el contexto familiar y académico del jugador." },
  { n: "02", title: "Cuánto tarda", body: "Diez minutos llenar el formulario. Respuesta con dictamen en 15 días hábiles." },
  { n: "03", title: "Menores de edad", body: "Toda postulación de menores de 18 años requiere consentimiento firmado del tutor legal." },
];

export const RUBRIC: [string, string][] = [
  ["Velocidad", "Aceleración en los primeros cinco metros y velocidad punta con balón."],
  ["Fuerza", "Capacidad de imponerse en el duelo y sostener el cuerpo bajo contacto."],
  ["Precisión de pase", "Calidad del envío corto y largo bajo presión, con las dos piernas."],
  ["Golpeo", "Potencia y dirección en remate, centro y balón parado."],
  ["Atletismo", "Coordinación, salto, cambio de dirección y resistencia repetida."],
  ["IQ de juego", "Lectura del espacio, toma de decisión y anticipación sin balón."],
  ["Defensa", "Presión, coberturas, marca individual y recuperación tras pérdida."],
  ["Mecánica", "Técnica base: control, conducción, perfil de recepción y postura."],
  ["Poder ofensivo", "Capacidad de generar y definir situaciones de gol."],
  ["Consistencia", "Rendimiento sostenido a lo largo de una temporada completa."],
  ["Liderazgo", "Influencia sobre el grupo dentro y fuera del campo."],
  ["Capacidad de aprender", "Velocidad para incorporar una corrección y repetirla."],
  ["Pasión", "Vínculo real con el juego más allá del contrato y la vitrina."],
  ["Fortaleza mental", "Respuesta al error, a la suplencia y a la crítica pública."],
  ["Ética de trabajo", "Lo que hace el jugador cuando nadie lo está evaluando."],
];

export type FieldType = "text" | "email" | "tel" | "date" | "number" | "select" | "radio" | "area" | "check";

export type ApplyField = {
  key: string;
  label: string;
  type: FieldType;
  ph?: string;
  wide?: boolean;
  options?: string[];
  hint?: string;
  required?: boolean;
};

export type ApplyStep = { short: string; title: string; fields: ApplyField[] };

export const APPLY_STEPS: ApplyStep[] = [
  {
    short: "Identidad",
    title: "Identidad y contacto",
    fields: [
      { key: "nombre", label: "Nombre completo", type: "text", ph: "Nombre y apellidos", wide: true, required: true },
      { key: "nac", label: "Fecha de nacimiento", type: "date", required: true },
      { key: "pais", label: "País de residencia", type: "select", options: ["México", "Argentina", "Estados Unidos", "España", "Otro"] },
      { key: "nacionalidad", label: "Nacionalidad", type: "text", ph: "Ej. mexicana" },
      { key: "estado", label: "Estado o provincia", type: "text", ph: "Ej. Jalisco" },
      { key: "ciudad", label: "Ciudad", type: "text", ph: "Ej. Guadalajara" },
      { key: "email", label: "Correo electrónico", type: "email", ph: "tucorreo@dominio.com", required: true },
      { key: "tel", label: "Teléfono con lada", type: "tel", ph: "+52 55 0000 0000" },
    ],
  },
  {
    short: "Perfil",
    title: "Perfil deportivo",
    fields: [
      { key: "estatura", label: "Estatura (cm)", type: "number", ph: "175" },
      { key: "peso", label: "Peso (kg)", type: "number", ph: "68" },
      { key: "pos1", label: "Posición principal", type: "select", options: ["Portero", "Lateral", "Central", "Mediocentro", "Interior", "Extremo", "Delantero"] },
      { key: "pos2", label: "Posición secundaria", type: "select", options: ["Ninguna", "Lateral", "Central", "Mediocentro", "Extremo", "Delantero"] },
      { key: "pie", label: "Pie dominante", type: "radio", options: ["Derecho", "Izquierdo", "Ambos"] },
      { key: "equipo", label: "Equipo actual", type: "text", ph: "Nombre del club" },
      { key: "liga", label: "Liga o categoría", type: "text", ph: "Ej. Liga TDP Sub-20" },
      { key: "anios", label: "Años practicando", type: "number", ph: "8" },
      { key: "nivel", label: "Nivel más alto alcanzado", type: "select", options: ["Liga local", "Liga estatal", "Liga nacional juvenil", "Cantera profesional", "Selección estatal", "Selección nacional"] },
      { key: "dt", label: "Entrenador actual y contacto", type: "text", ph: "Nombre y teléfono", wide: true },
    ],
  },
  {
    short: "Video",
    title: "Rendimiento y video",
    fields: [
      { key: "video", label: "URL del video de highlights", type: "text", ph: "YouTube, Vimeo o Drive público", wide: true, hint: "Cinco a ocho minutos de juego real, no solo goles.", required: true },
      { key: "premios", label: "Premios y reconocimientos", type: "area", ph: "Torneos, distinciones individuales, convocatorias", wide: true },
      { key: "stats", label: "Estadísticas recientes", type: "area", ph: "Partidos, minutos, goles, asistencias de la última temporada", wide: true },
      { key: "fortalezas", label: "Tus tres fortalezas", type: "text", ph: "Ej. cambio de ritmo, pase filtrado, presión tras pérdida", wide: true },
      { key: "links", label: "Enlaces adicionales", type: "text", ph: "Perfil en plataformas de scouting, redes", wide: true },
    ],
  },
  {
    short: "Medibles",
    title: "Medibles y disponibilidad",
    fields: [
      { key: "vel", label: "Velocidad 30 m (s)", type: "number", ph: "4.1", hint: "Opcional" },
      { key: "salto", label: "Salto vertical (cm)", type: "number", ph: "52", hint: "Opcional" },
      { key: "yoyo", label: "Test de resistencia (nivel)", type: "text", ph: "Ej. Yo-Yo 19.5", hint: "Opcional" },
      { key: "fuerza", label: "Sentadilla máxima (kg)", type: "number", ph: "95", hint: "Opcional" },
      { key: "viaje", label: "Disponibilidad para viajar", type: "radio", options: ["Sí", "Con apoyo", "No"] },
      { key: "reubic", label: "Disponibilidad para reubicarse", type: "radio", options: ["Sí", "A evaluar", "No"] },
      { key: "desde", label: "Disponible desde", type: "date" },
      { key: "hasta", label: "Disponible hasta", type: "date" },
    ],
  },
  {
    short: "Consentimientos",
    title: "Consentimientos",
    fields: [
      { key: "tutor", label: "Nombre del tutor (si eres menor)", type: "text", ph: "Nombre completo del padre, madre o tutor", wide: true },
      { key: "tutorTel", label: "Contacto del tutor", type: "tel", ph: "+52 55 0000 0000" },
      { key: "parentesco", label: "Parentesco", type: "select", options: ["Padre", "Madre", "Tutor legal", "No aplica"] },
      { key: "okPriv", label: "", type: "check", ph: "He leído y acepto el aviso de privacidad y el tratamiento de los datos deportivos aquí incluidos.", wide: true },
      { key: "okVerdad", label: "", type: "check", ph: "Declaro que la información y el video enviados son verídicos y de mi autoría o de mi tutor.", wide: true },
    ],
  },
];
