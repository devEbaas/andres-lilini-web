export type DocSection = { h: string; p: string };
export type Doc = {
  slug: string;
  label: string;
  meta: string;
  title: string;
  lead: string;
  body?: DocSection[];
  kind: "prose" | "faq";
};

export const DOCS: Doc[] = [
  {
    slug: "prensa",
    label: "Prensa",
    meta: "Sala de prensa",
    title: "Materiales para prensa",
    lead: "Biografía verificable, datos de trayectoria y procedimiento para solicitar una entrevista.",
    kind: "prose",
    body: [
      { h: "Biografía corta", p: "Andrés Lillini (Argentina, 1975) es entrenador y formador de futbolistas. Ha dirigido áreas de cantera en México, Argentina y Rusia, fue director técnico de un primer equipo en la Liga MX durante dos años y medio y actualmente encabeza el trabajo de selecciones nacionales menores en México." },
      { h: "Datos verificables", p: "102 partidos dirigidos en primera división mexicana; una final de liga; quince debutantes de cantera durante su gestión; etapas formativas en Morelia, Boca Juniors, CSKA Moscú y Pumas." },
      { h: "Materiales disponibles", p: "Retratos en alta resolución con crédito obligatorio, dos fotografías de campo, logotipo del programa en versión clara y oscura, y una ficha de trayectoria en PDF." },
      { h: "Solicitud de entrevistas", p: "Escriba desde el formulario de contacto eligiendo el tema Prensa y medios. Indique medio, formato, duración estimada y fecha límite; se responde en 24 horas hábiles." },
    ],
  },
  {
    slug: "faq",
    label: "Preguntas frecuentes",
    meta: "Ayuda",
    title: "Preguntas frecuentes",
    lead: "Programa, tienda, envíos, convocatoria y privacidad.",
    kind: "faq",
  },
  {
    slug: "patrocinios",
    label: "Patrocinios",
    meta: "Alianzas",
    title: "Patrocinios y alianzas",
    lead: "Cómo colaborar con un proyecto que trabaja con jugadores de 12 a 21 años.",
    kind: "prose",
    body: [
      { h: "Qué se ofrece", p: "Presencia en visorías, contenido documental del proceso formativo y acceso a una audiencia concentrada en familias, clubes y prensa deportiva de habla hispana." },
      { h: "Formatos de colaboración", p: "Patrocinio de becas nominales, dotación de material deportivo, apoyo logístico en visorías regionales y coproducción de contenido educativo para entrenadores." },
      { h: "Lo que no se hace", p: "No se comercializan datos de menores, no se colocan marcas de apuestas ni bebidas alcohólicas en materiales dirigidos a jugadores, y no se venden promesas de fichaje." },
      { h: "Siguiente paso", p: "Escriba desde contacto con el tema Patrocinios. Se envía el dossier con alcances, cifras auditadas y calendario de actividades del ciclo." },
    ],
  },
  {
    slug: "privacidad",
    label: "Privacidad",
    meta: "Legal",
    title: "Aviso de privacidad",
    lead: "Qué datos se recaban, con qué finalidad y cómo ejercer los derechos correspondientes.",
    kind: "prose",
    body: [
      { h: "Responsable", p: "El responsable del tratamiento de los datos personales recabados a través de este sitio es la oficina de Andrés Lillini, con domicilio en Ciudad de México." },
      { h: "Datos que se recaban", p: "Datos de identificación y contacto, datos deportivos aportados voluntariamente en el formulario del programa, y datos de facturación y envío en el caso de compras." },
      { h: "Menores de edad", p: "Toda postulación de una persona menor de 18 años requiere el consentimiento expreso de su padre, madre o tutor legal, incluidos nombre completo, parentesco y medio de contacto verificable." },
      { h: "Finalidades", p: "Evaluar postulaciones deportivas, gestionar pedidos, responder solicitudes de contacto y, con autorización expresa, enviar el boletín. No se venden ni ceden datos a terceros con fines publicitarios." },
      { h: "Derechos", p: "Puede solicitar acceso, rectificación, cancelación u oposición al tratamiento de sus datos escribiendo desde el formulario de contacto con el tema General. La solicitud se atiende en un máximo de veinte días hábiles." },
    ],
  },
  {
    slug: "terminos",
    label: "Términos",
    meta: "Legal",
    title: "Términos y condiciones",
    lead: "Condiciones de uso del sitio, de la tienda y del programa de atletas.",
    kind: "prose",
    body: [
      { h: "Uso del sitio", p: "El contenido de este sitio es informativo. La postulación al programa no garantiza evaluación presencial, selección, contrato ni representación deportiva de ningún tipo." },
      { h: "Compras y pagos", p: "Los precios se muestran en pesos mexicanos con impuestos incluidos. El pago se procesa en una pasarela externa; no se almacenan datos de tarjeta en servidores propios." },
      { h: "Envíos y devoluciones", p: "Envío estándar de tres a cinco días hábiles en territorio nacional. Se aceptan devoluciones dentro de treinta días naturales, con producto sin uso y en su empaque original." },
      { h: "Propiedad intelectual", p: "Los materiales metodológicos, textos y marcas del programa son propiedad de su titular y no pueden reproducirse con fines comerciales sin autorización escrita." },
    ],
  },
  {
    slug: "bases",
    label: "Bases de la convocatoria",
    meta: "Legal",
    title: "Bases de la convocatoria",
    lead: "Reglas completas de la Beca de formación 2027.",
    kind: "prose",
    body: [
      { h: "Quién puede participar", p: "Jugadores de 12 a 21 años residentes en México, sin contrato profesional vigente al cierre de la convocatoria. La participación es gratuita." },
      { h: "Cómo participar", p: "Complete el formulario de participación y adjunte un archivo de hasta 25 MB en formato PDF, JPG, PNG o MP4. Cada participante puede enviar una sola propuesta." },
      { h: "Criterios de selección", p: "Un jurado de tres evaluadores del programa califica potencial deportivo, contexto y compromiso académico. La decisión es inapelable y se comunica por correo electrónico." },
      { h: "Premio", p: "Diez plazas con seguimiento metodológico durante un año, equipamiento completo, dos concentraciones presenciales y acompañamiento académico. La beca es personal e intransferible." },
      { h: "Calendario", p: "La convocatoria cierra el 30 de noviembre de 2026. La lista corta se publica el 15 de diciembre de 2026 y los resultados finales el 20 de enero de 2027." },
    ],
  },
];

export const DOC_SLUGS = DOCS.map((d) => d.slug);
export const getDoc = (slug: string) => DOCS.find((d) => d.slug === slug);

export const FAQ: { q: string; a: string }[] = [
  { q: "¿Qué edad se requiere para postular al programa?", a: "Se evalúan jugadores de 12 a 21 años. Los menores de 18 requieren el consentimiento de su padre, madre o tutor legal como parte del formulario." },
  { q: "¿Cuánto cuesta postular?", a: "Nada. La postulación y la evaluación inicial son gratuitas. Si el jugador avanza a sesión presencial, se informa con antelación qué gastos cubre el programa." },
  { q: "¿Qué debe mostrar el video de juego?", a: "Cinco a ocho minutos de juego real, no solo goles: acciones sin balón, duelos y decisiones bajo presión. Un video de teléfono bien encuadrado es suficiente." },
  { q: "¿Cuánto tarda un pedido de la tienda?", a: "Tres a cinco días hábiles en territorio nacional una vez confirmado el pago. Se envía guía de rastreo por correo electrónico." },
  { q: "¿Se puede devolver un producto?", a: "Sí, dentro de 30 días naturales, sin uso y en su empaque original. El costo de la guía de retorno corre por cuenta del proyecto si el error fue propio." },
  { q: "¿Se puede enviar más de una propuesta a la convocatoria?", a: "No. Cada participante puede enviar una sola propuesta; en caso de duplicidad se considera válida la primera." },
  { q: "¿Qué se hace con los datos de un menor de edad?", a: "Se usan exclusivamente para la evaluación deportiva, se conservan cifrados durante el ciclo de la convocatoria y se eliminan a solicitud del tutor en cualquier momento." },
];

export const DOCS_UPDATED = "25 de agosto de 2026";
