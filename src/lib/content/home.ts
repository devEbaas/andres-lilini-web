export type Metric = { v: number; s: string; label: string };

export const METRICS: Metric[] = [
  { v: 1400, s: "+", label: "Jugadores evaluados en cantera" },
  { v: 62, s: "+", label: "Debutaron en primera división" },
  { v: 27, s: "", label: "Años formando futbolistas" },
  { v: 102, s: "", label: "Partidos dirigidos en Liga MX" },
  { v: 4, s: "", label: "Países con proyecto propio" },
];

export const CREDENTIALS = [
  "Formador desde 1998",
  "27 años en canteras",
  "Selecciones menores MX",
];

export type Milestone = {
  year: string;
  title: string;
  body: string;
  /** Encuadre previsto; se muestra en el marcador mientras no haya `image`. */
  photo: string;
  /** Ruta en /public cuando la fotografía ya está entregada. */
  image?: string;
  caption: string;
};

export const TIMELINE: Milestone[] = [
  {
    year: "1998",
    title: "Primeros pasos en Buenos Aires",
    body: "Empieza como entrenador de categorías formativas en el fútbol argentino, con foco en el trabajo individual del jugador joven.",
    photo: "Foto de archivo · cancha de barrio, Buenos Aires",
    image: "/images/cancha-barrio.jpeg",
    caption: "Origen · fútbol formativo argentino",
  },
  {
    year: "2001",
    title: "Coordinador de fuerzas básicas en Morelia",
    body: "Llega a México invitado a estructurar la cantera de Monarcas Morelia. De ahí sale, entre otros, un lateral que sería multicampeón en la Liga MX.",
    photo: "Foto 16:10 · sesión de fuerzas básicas, Morelia",
    image: "/images/morelia.jpg",
    caption: "Primer proyecto en México",
  },
  {
    year: "2007",
    title: "Boca Juniors",
    body: "Regresa a Argentina para dirigir el trabajo formativo de uno de los clubes más grandes del continente, con una escala y una presión distintas.",
    photo: "Foto 16:10 · complejo de entrenamiento",
    image: "/images/boca.webp",
    caption: "Cuatro años en la cantera xeneize",
  },
  {
    year: "2011",
    title: "CSKA Moscú",
    body: "Salto a Europa del Este para reorganizar el área juvenil: aprende a rastrear jugadores en contextos culturales y climáticos completamente ajenos.",
    photo: "Foto 16:10 · sesión invernal, Moscú",
    image: "/images/cska.jpeg",
    caption: "Detección fuera de la zona de confort",
  },
  {
    year: "2015",
    title: "Banquillos en Sudamérica",
    body: "Etapas como técnico en Gimnasia y Esgrima y San Luis de Quillota: la traducción del formador al entrenador de resultados semanales.",
    photo: "Foto 16:10 · banquillo en día de partido",
    image: "/images/sudamerica.jpeg",
    caption: "Primera línea, resultado inmediato",
  },
  {
    year: "2018",
    title: "Cantera de Pumas",
    body: "Toma la dirección de fuerzas básicas del club universitario y arma una estructura que alimenta al primer equipo con jugadores propios.",
    photo: "Foto 16:10 · cantera universitaria",
    image: "/images/pumas.jpg",
    caption: "Cantera como política deportiva",
  },
  {
    year: "2020",
    title: "Director técnico del primer equipo",
    body: "Asume de forma interina y se queda dos años y medio: 102 partidos, una final de liga y quince canteranos debutando en primera división.",
    photo: "Foto 16:10 · noche de final",
    image: "/images/director-pumas.jpg",
    caption: "Interinato que duró dos años y medio",
  },
  {
    year: "2023",
    title: "Selecciones nacionales menores",
    body: "Encabeza el proyecto de detección y desarrollo juvenil de la federación mexicana, incluida la búsqueda de jugadores con doble nacionalidad formados en el extranjero.",
    photo: "Foto 16:10 · concentración de selección menor",
    image: "/images/mexico.png",
    caption: "Actualidad · escala nacional",
  },
];

export type GalleryItem = {
  span: string;
  ratio: string;
  label: string;
  tag: string;
};

export const GALLERY: GalleryItem[] = [
  { span: "span 2", ratio: "4/3", label: "Foto principal · sesión de campo al amanecer", tag: "Entrenamiento" },
  { span: "span 1", ratio: "3/4", label: "Retrato vertical · pizarra táctica", tag: "Metodología" },
  { span: "span 1", ratio: "3/4", label: "Detalle · charla con jugador juvenil", tag: "Formación" },
  { span: "span 1", ratio: "1/1", label: "Foto cuadrada · vestidor", tag: "Vestidor" },
  { span: "span 1", ratio: "1/1", label: "Foto cuadrada · visoría regional", tag: "Visorías" },
  { span: "span 4", ratio: "21/9", label: "Panorámica · estadio lleno, noche de partido", tag: "Día de partido" },
];

export const PILLARS = [
  { n: "01", title: "Detectar", body: "Ver al jugador donde nadie mira: ligas municipales, torneos escolares, canteras sin estructura." },
  { n: "02", title: "Desarrollar", body: "Plan individual medible por trimestre, con carga física, técnica y acompañamiento académico." },
  { n: "03", title: "Sostener", body: "El debut no es la meta. Seguimiento de contrato, familia y salud mental durante los primeros tres años." },
];
