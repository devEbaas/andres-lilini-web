-- El acuse de una solicitud ARCO sale en el idioma con el que se pidió, y el
-- panel necesita saberlo: la verificación de identidad es un correo escrito a
-- mano después, con plazos legales de por medio. Se quedó fuera de
-- `20260901160000_locale_por_fila.sql` porque el plan no la listaba.
alter table public.arco_requests add column if not exists locale text not null default 'es';

alter table public.arco_requests drop constraint if exists arco_requests_locale_check;
alter table public.arco_requests add constraint arco_requests_locale_check
  check (locale in ('es', 'en'));
