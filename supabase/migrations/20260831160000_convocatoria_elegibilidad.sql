-- ─────────────────────────────────────────────────────────────
-- Andrés Lillini — elegibilidad y perfil en la convocatoria
-- ─────────────────────────────────────────────────────────────
-- Las bases piden «jugadores de 12 a 21 años residentes en México,
-- sin contrato profesional vigente», y hasta ahora el formulario no
-- recogía ninguno de los tres datos: los requisitos publicados no se
-- podían aplicar.
--
-- Los tres criterios del jurado —potencial deportivo, contexto y
-- compromiso académico— tampoco tenían dónde apoyarse más allá de un
-- texto libre. Esto cubre el primero.
--
-- Nullable a propósito: las participaciones ya registradas no tienen
-- estos datos y no se inventan. La obligatoriedad la impone la Server
-- Action para los envíos nuevos.

alter table public.convocatoria_entries
  add column if not exists nacimiento   date,
  add column if not exists pais         text,
  add column if not exists estado       text,
  add column if not exists categoria    text,
  add column if not exists posicion     text,
  add column if not exists pie          text,
  add column if not exists club         text,
  add column if not exists liga         text,
  -- Declaraciones del participante. `false` es el valor seguro para las
  -- filas viejas: ni declararon nada ni autorizaron nada.
  add column if not exists sin_contrato boolean not null default false,
  add column if not exists ok_imagen    boolean not null default false;

-- Los conjuntos de valores viven también en `src/lib/content/fundacion.ts`.
-- Es la misma regla escrita dos veces: si cambia una, cambia la otra.
alter table public.convocatoria_entries drop constraint if exists convocatoria_categoria_check;
alter table public.convocatoria_entries add constraint convocatoria_categoria_check
  check (categoria is null or categoria in ('Sub-13', 'Sub-15', 'Sub-17', 'Sub-20', 'Libre'));

alter table public.convocatoria_entries drop constraint if exists convocatoria_posicion_check;
alter table public.convocatoria_entries add constraint convocatoria_posicion_check
  check (posicion is null or posicion in
    ('Portero', 'Lateral', 'Central', 'Mediocentro', 'Interior', 'Extremo', 'Delantero'));

alter table public.convocatoria_entries drop constraint if exists convocatoria_pie_check;
alter table public.convocatoria_entries add constraint convocatoria_pie_check
  check (pie is null or pie in ('Derecho', 'Izquierdo', 'Ambos'));

-- Guarda contra fechas imposibles. El rango 12–21 NO se comprueba aquí:
-- depende de la fecha de cierre y cambiaría de significado cada año, así
-- que es regla de aplicación, no de esquema.
alter table public.convocatoria_entries drop constraint if exists convocatoria_nacimiento_check;
alter table public.convocatoria_entries add constraint convocatoria_nacimiento_check
  check (nacimiento is null or (nacimiento > '1950-01-01' and nacimiento < current_date));

create index if not exists convocatoria_categoria_idx
  on public.convocatoria_entries (categoria);
