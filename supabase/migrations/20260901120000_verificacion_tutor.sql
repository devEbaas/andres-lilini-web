-- ─────────────────────────────────────────────────────────────
-- Andrés Lillini — verificación del tutor por correo
-- ─────────────────────────────────────────────────────────────
-- Hasta ahora el consentimiento del tutor era declarativo: el
-- formulario exigía sus datos y una casilla, pero nadie comprobaba
-- que quien la marcaba fuera el tutor y no el propio menor.
--
-- La nueva LFPDPPP pide que el consentimiento sea demostrable, y una
-- casilla marcada por el interesado no demuestra nada. Esto cierra
-- el hueco: se manda un enlace al correo del tutor y sólo su clic
-- convierte la postulación en verificada.
--
-- Mismo criterio que el expediente: en la base vive el SHA-256 del
-- token, nunca el token.

alter table public.applications
  add column if not exists tutor_token_hash    text,
  add column if not exists tutor_token_expira  timestamptz,
  add column if not exists tutor_verificado_at timestamptz;

create index if not exists applications_tutor_token_idx
  on public.applications (tutor_token_hash)
  where tutor_token_hash is not null;

-- Para el panel: los expedientes de menores sin verificar son los que
-- necesitan seguimiento.
create index if not exists applications_tutor_pendiente_idx
  on public.applications (created_at desc)
  where es_menor and tutor_verificado_at is null;

-- El correo del tutor pasa a ser necesario para poder verificar, pero
-- NO se añade un CHECK: las postulaciones de menores anteriores a esta
-- migración se guardaron cuando el correo era opcional, y un CHECK las
-- invalidaría de golpe. La regla la impone la Server Action para los
-- envíos nuevos; las viejas se quedan como estaban, sin verificar.
comment on column public.applications.tutor_email is
  'Obligatorio para menores desde 20260901120000. Las filas anteriores pueden tenerlo nulo.';
