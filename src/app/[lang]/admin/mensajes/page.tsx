import { getTranslations } from "next-intl/server";

import { createServerSupabase } from "@/lib/supabase/server";
import { Celda, Tabla, Vacio, fecha } from "@/components/admin/Tabla";
import { MarcarMensaje } from "@/components/admin/MarcarMensaje";
import { fijarIdioma } from "@/i18n/servidor";

export default async function MensajesPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  // El tema se guarda como clave desde que la tienda es bilingüe. El panel
  // sólo existe en español, así que se traduce con el catálogo español fijo.
  // Los mensajes anteriores guardaron el rótulo suelto: si la clave no está
  // en el catálogo, es una fila vieja y se muestra tal cual.
  const tt = await getTranslations({ locale: "es", namespace: "contact.topics" });
  const tema = (valor: string) => (tt.has(valor) ? tt(valor) : valor);

  const supabase = await createServerSupabase();
  if (!supabase) return <Vacio texto="Supabase no está configurado." />;

  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, created_at, nombre, email, topic, message, handled")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin/mensajes]", error.message);
    return <Vacio texto="No pudimos cargar los mensajes." />;
  }
  if (!data?.length) return <Vacio texto="Todavía no hay mensajes." />;

  return (
    <Tabla cols={["Fecha", "Nombre", "Correo", "Tema", "Mensaje", "Estado"]}>
      {data.map((m) => (
        <tr key={m.id}>
          <Celda mono>{fecha(m.created_at)}</Celda>
          <Celda>{m.nombre}</Celda>
          <Celda mono>{m.email}</Celda>
          <Celda mono>{tema(m.topic)}</Celda>
          <Celda>
            <span className="block max-w-[46ch] leading-[1.6] text-muted">{m.message}</span>
          </Celda>
          <Celda>
            <MarcarMensaje id={m.id} inicial={m.handled} />
          </Celda>
        </tr>
      ))}
    </Tabla>
  );
}
