export type Milestone = {
  year: string;
  title: string;
  body: string;
  photo: string;
  caption: string;
};

export const TIMELINE: Milestone[] = [
  {
    year: "1998",
    title: "Primeros pasos en Buenos Aires",
    body: "Inicia como entrenador de categorías formativas en el fútbol argentino, con foco en el trabajo individual del jugador joven.",
    photo: "Foto de archivo · cancha de barrio, Buenos Aires",
    caption: "Origen · fútbol formativo argentino",
  },
  {
    year: "2001",
    title: "Coordinador de fuerzas básicas en Morelia",
    body: "Llega a México invitado a estructurar la cantera de Monarcas Morelia. De ahí sale, entre otros, un lateral que sería multicampeón en la Liga MX.",
    photo: "Foto 16:10 · sesión de fuerzas básicas, Morelia",
    caption: "Primer proyecto en México",
  },
  {
    year: "2007",
    title: "Boca Juniors",
    body: "Regresa a Argentina para dirigir el trabajo formativo de uno de los clubes más grandes del continente, con una escala y una presión distintas.",
    photo: "Foto 16:10 · complejo de entrenamiento",
    caption: "Cuatro años en la cantera xeneize",
  },
  {
    year: "2011",
    title: "CSKA Moscú",
    body: "Salto a Europa del Este para reorganizar el área juvenil: detección de jugadores en contextos culturales y climáticos completamente ajenos.",
    photo: "Foto 16:10 · sesión invernal, Moscú",
    caption: "Detección fuera de la zona de confort",
  },
  {
    year: "2015",
    title: "Banquillos en Sudamérica",
    body: "Etapas como técnico en Gimnasia y Esgrima y San Luis de Quillota: la traducción del formador al entrenador de resultados semanales.",
    photo: "Foto 16:10 · banquillo en día de partido",
    caption: "Primera línea, resultado inmediato",
  },
  {
    year: "2018",
    title: "Cantera de Pumas",
    body: "Toma la dirección de fuerzas básicas del club universitario y ordena una estructura que alimenta al primer equipo con jugadores propios.",
    photo: "Foto 16:10 · cantera universitaria",
    caption: "La cantera como política deportiva",
  },
  {
    year: "2020",
    title: "Director técnico del primer equipo",
    body: "Asume de forma interina y permanece dos años y medio: 102 partidos, una final de liga y quince canteranos debutando en primera división.",
    photo: "Foto 16:10 · noche de final",
    caption: "Interinato que duró dos años y medio",
  },
  {
    year: "2023",
    title: "Selecciones nacionales menores",
    body: "Encabeza el proyecto de detección y desarrollo juvenil de la federación mexicana, incluida la búsqueda de jugadores con doble nacionalidad formados en el extranjero.",
    photo: "Foto 16:10 · concentración de selección menor",
    caption: "Actualidad · escala nacional",
  },
];

export type GalleryItem = {
  span: string;
  ratio: string;
  label: string;
  tag: string;
  ref: string;
};

export const GALLERY: GalleryItem[] = [
  {
    span: "span 2",
    ratio: "4/3",
    label: "Foto principal · sesión de campo al amanecer",
    tag: "Entrenamiento",
    ref: "AL-001",
  },
  {
    span: "span 1",
    ratio: "3/4",
    label: "Retrato vertical · pizarra táctica",
    tag: "Metodología",
    ref: "AL-002",
  },
  {
    span: "span 1",
    ratio: "3/4",
    label: "Detalle · charla con jugador juvenil",
    tag: "Formación",
    ref: "AL-003",
  },
  { span: "span 1", ratio: "1/1", label: "Foto cuadrada · vestidor", tag: "Vestidor", ref: "AL-004" },
  {
    span: "span 1",
    ratio: "1/1",
    label: "Foto cuadrada · visoría regional",
    tag: "Visorías",
    ref: "AL-005",
  },
  {
    span: "span 4",
    ratio: "21/9",
    label: "Panorámica · estadio lleno, noche de partido",
    tag: "Día de partido",
    ref: "AL-006",
  },
];
