export type Product = {
  id: string;
  cat: string;
  name: string;
  sub: string;
  price: number;
  shot: string;
  desc: string;
  out?: boolean;
};

export const CATEGORIES = ["Todo", "Metodología", "Indumentaria", "Equipamiento", "Accesorios"] as const;

/** Catálogo semilla. Es también el fallback si Supabase no está configurado. */
export const PRODUCTS: Product[] = [
  { id: "p1", cat: "Metodología", name: "Cuaderno de sesión", sub: "120 sesiones planificables", price: 480, shot: "Producto 4:5 · cuaderno cerrado sobre mesa", desc: "Cuaderno de trabajo con la estructura de sesión utilizada en cantera: objetivo, tarea, carga, correcciones y evaluación individual. Papel de 100 g, cosido, resistente al trabajo de campo." },
  { id: "p2", cat: "Metodología", name: "Cantera primero", sub: "Método de formación · 288 páginas", price: 650, shot: "Producto 4:5 · libro de tapa dura", desc: "Veintisiete años de trabajo formativo ordenados en un método: cómo detectar, cómo medir y cómo sostener a un jugador joven en tres países distintos." },
  { id: "p3", cat: "Indumentaria", name: "Chamarra de cuerpo técnico", sub: "Edición limitada, unisex", price: 1890, shot: "Producto 4:5 · chamarra colgada", desc: "Tejido técnico repelente al agua, corte recto y escudo bordado en el pecho. Tirada única de 300 piezas.", out: true },
  { id: "p4", cat: "Indumentaria", name: "Playera de entrenamiento", sub: "Tejido transpirable", price: 590, shot: "Producto 4:5 · playera doblada", desc: "Playera de entrenamiento con tejido de secado rápido y logotipo serigrafiado. Tallas de niño a adulto XXL." },
  { id: "p5", cat: "Indumentaria", name: "Sudadera de campo", sub: "Algodón peinado 380 g", price: 1240, shot: "Producto 4:5 · sudadera sobre fondo neutro", desc: "Sudadera de peso completo para trabajo en frío, con capucha forrada y bolsillo frontal." },
  { id: "p6", cat: "Equipamiento", name: "Set de conos y escalera", sub: "Kit de coordinación", price: 890, shot: "Producto 4:5 · kit desplegado", desc: "Doce conos, escalera de coordinación de cuatro metros y guía impresa con doce circuitos progresivos." },
  { id: "p7", cat: "Equipamiento", name: "Balón de trabajo", sub: "Talla 5, cosido a máquina", price: 720, shot: "Producto 4:5 · balón sobre césped", desc: "Balón de entrenamiento de uso intensivo, con vejiga de látex y cámara reforzada." },
  { id: "p8", cat: "Accesorios", name: "Gorra de cuerpo técnico", sub: "Ajuste trasero metálico", price: 420, shot: "Producto 4:5 · gorra de perfil", desc: "Gorra estructurada de seis paneles con bordado frontal y visera precurvada." },
];

export const PRODUCT_THUMBS = ["Detalle 1", "Detalle 2", "En uso"];
