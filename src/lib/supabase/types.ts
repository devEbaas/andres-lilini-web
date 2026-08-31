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
  user_id?: string | null;
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
  user_id: string | null;
};

/** Estados de una postulación. Los fija un CHECK en la base. */
export type ApplicationStatus =
  | "recibida"
  | "en_revision"
  | "preseleccionada"
  | "aceptada"
  | "descartada";

/** Roles de la aplicación. Los fija un enum en la base. */
export type AppRole = "cliente" | "admin";

export type ProfileRow = {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Lo único que el propio usuario puede escribir de su perfil. El resto de
 * columnas ni siquiera tienen GRANT para `authenticated`.
 */
export type ProfileUpdate = {
  nombre?: string;
  apellido?: string;
  telefono?: string | null;
};

/**
 * Tabla de autorización. La app no la lee nunca: el rol llega dentro del JWT,
 * puesto por `custom_access_token_hook`. Sólo la service role la escribe.
 */
export type UserRoleRow = {
  user_id: string;
  role: AppRole;
  is_active: boolean;
  created_at: string;
};

export type AdminAuditInsert = {
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  target_table?: string | null;
  target_id?: string | null;
  meta?: Json;
};

export type AdminAuditRow = {
  id: number;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  meta: Json;
  created_at: string;
};

type Table<Row, Insert = Row, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      products: Table<ProductRow & { created_at: string }, ProductRow>;
      applications: Table<
        ApplicationInsert & { id: string; created_at: string; status: ApplicationStatus },
        ApplicationInsert,
        // El panel sólo cambia el estado; el resto de la fila es del postulante.
        { status?: ApplicationStatus }
      >;
      convocatoria_entries: Table<
        ConvocatoriaInsert & { id: string; created_at: string },
        ConvocatoriaInsert
      >;
      contact_messages: Table<
        ContactInsert & { id: string; created_at: string; handled: boolean },
        ContactInsert,
        { handled?: boolean }
      >;
      newsletter_subscribers: Table<
        { id: string; email: string; created_at: string },
        { email: string }
      >;
      orders: Table<OrderRow, OrderInsert>;
      profiles: Table<ProfileRow, ProfileUpdate & { id: string }>;
      user_roles: Table<UserRoleRow, Omit<UserRoleRow, "created_at">>;
      admin_audit: Table<AdminAuditRow, AdminAuditInsert>;
    };
    Views: Record<never, never>;
    Functions: {
      vincular_pedidos_huerfanos: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: { app_role: AppRole };
    CompositeTypes: Record<never, never>;
  };
};
