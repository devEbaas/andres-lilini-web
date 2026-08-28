/**
 * Tipos de la base. Se pueden regenerar con:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ProductRow = {
  id: string;
  cat: string;
  name: string;
  sub: string;
  price: number;
  shot: string;
  description: string;
  sold_out: boolean;
  sort: number;
};

export type ApplicationInsert = {
  folio: string;
  nombre: string;
  email: string;
  video_url: string | null;
  payload: Json;
};

export type ConvocatoriaInsert = {
  folio: string;
  nombre: string;
  email: string;
  link: string | null;
  propuesta: string;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
};

export type ContactInsert = {
  nombre: string;
  email: string;
  topic: string;
  message: string;
};

/** Estados por los que pasa un pedido. Los fija un CHECK en la base. */
export type OrderStatus = "pendiente" | "iniciado" | "pagado" | "expirado";

/**
 * Las columnas de Stripe van opcionales: la fila nace sin sesión y el webhook
 * las rellena después. Al ser parte del Insert, también las cubre el Update.
 */
export type OrderInsert = {
  subtotal: number;
  shipping: number;
  total: number;
  items: Json;
  status?: OrderStatus;
  stripe_session_id?: string | null;
  stripe_payment_intent?: string | null;
  email?: string | null;
  shipping_address?: Json | null;
  paid_at?: string | null;
};

export type OrderRow = {
  id: string;
  created_at: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: Json;
  status: OrderStatus;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  email: string | null;
  shipping_address: Json | null;
  paid_at: string | null;
};

type Table<Row, Insert = Row> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      products: Table<ProductRow & { created_at: string }, ProductRow>;
      applications: Table<
        ApplicationInsert & { id: string; created_at: string; status: string },
        ApplicationInsert
      >;
      convocatoria_entries: Table<
        ConvocatoriaInsert & { id: string; created_at: string },
        ConvocatoriaInsert
      >;
      contact_messages: Table<
        ContactInsert & { id: string; created_at: string; handled: boolean },
        ContactInsert
      >;
      newsletter_subscribers: Table<
        { id: string; email: string; created_at: string },
        { email: string }
      >;
      orders: Table<OrderRow, OrderInsert>;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
