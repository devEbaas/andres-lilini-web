-- ─────────────────────────────────────────────────────────────
-- Catálogo bilingüe
--
-- Con ocho productos y cuatro campos de texto, columnas paralelas salen más
-- baratas que una tabla de traducciones y no obligan a un join en la ruta que
-- más se sirve. Si el catálogo pasa de ~30 productos o entra un tercer idioma,
-- toca migrar a `product_translations (product_id, locale, …)`.
-- ─────────────────────────────────────────────────────────────

alter table public.products
  add column if not exists cat_key        text,
  add column if not exists name_en        text not null default '',
  add column if not exists sub_en         text not null default '',
  add column if not exists shot_en        text not null default '',
  add column if not exists description_en text not null default '';

-- `cat` era a la vez valor de filtro y etiqueta visible. La clave estable se
-- queda en la base; el rótulo pasa a `store.cats` en los mensajes.
--
-- Antes de convertir nada, comprobamos que no haya categorías fuera del mapa.
-- Un `else` genérico las metería a todas en la misma clave sin avisar, y el
-- producto aparecería bajo un filtro que no le toca. Preferimos que la
-- migración se caiga y alguien decida.
do $$
declare desconocidas text;
begin
  select string_agg(distinct cat, ', ') into desconocidas
  from public.products
  where cat is not null
    and cat not in ('Metodología', 'Indumentaria', 'Equipamiento', 'Accesorios');

  if desconocidas is not null then
    raise exception
      'Categorías sin equivalencia en cat_key: %. Añádelas al CASE de abajo, al CHECK, a CAT_KEYS y a store.cats antes de aplicar.',
      desconocidas;
  end if;
end $$;

update public.products
set cat_key = case cat
  when 'Metodología'  then 'metodologia'
  when 'Indumentaria' then 'indumentaria'
  when 'Equipamiento' then 'equipamiento'
  when 'Accesorios'   then 'accesorios'
end
where cat_key is null;

alter table public.products alter column cat_key set not null;

alter table public.products drop constraint if exists products_cat_key_check;
alter table public.products add constraint products_cat_key_check
  check (cat_key in ('metodologia', 'indumentaria', 'equipamiento', 'accesorios'));

-- `cat` se conserva un ciclo por si hay que revertir, pero deja de ser
-- obligatoria: un producto nuevo ya no tiene que cargar el rótulo duplicado.
-- La aplicación no la lee. Se puede eliminar en una migración posterior.
alter table public.products alter column cat drop not null;

comment on column public.products.cat is
  'Obsoleta desde el catálogo bilingüe: sustituida por cat_key. No la lee nadie.';

-- Traducciones del catálogo semilla. Espeja `PRODUCTS_SEED` de
-- `src/lib/content/tienda.ts`, que es el respaldo cuando Supabase no está
-- conectado: si cambias una, cambia la otra.
update public.products as p set
  name_en        = v.name_en,
  sub_en         = v.sub_en,
  shot_en        = v.shot_en,
  description_en = v.description_en
from (values
  ('p1',
   'Session notebook',
   '120 plannable sessions',
   'Product · closed notebook on a table',
   'Working notebook with the session structure we use in the academy: objective, task, load, corrections and individual assessment. 100 gsm paper, sewn binding, survives the pitch.'),
  ('p2',
   'Book: Academy First',
   'Development method, 288 pages',
   'Product · hardback book',
   'Twenty-seven years of development work organised into a method: how to scout, how to measure and how to sustain a young player across three different countries.'),
  ('p3',
   'Coaching staff jacket',
   'Limited edition, unisex',
   'Product · jacket on a hanger',
   'Water-repellent technical fabric, straight cut, crest embroidered on the chest. Single run of 300 pieces.'),
  ('p4',
   'Training shirt',
   'Breathable fabric',
   'Product · folded shirt',
   'Training shirt in quick-drying fabric with a screen-printed logo. Sizes from junior to adult XXL.'),
  ('p5',
   'Field sweatshirt',
   '380 g combed cotton',
   'Product · sweatshirt on a neutral background',
   'Full-weight sweatshirt for cold-weather work, with a lined hood and a kangaroo pocket.'),
  ('p6',
   'Cone and ladder set',
   'Coordination kit',
   'Product · kit laid out',
   'Twelve cones, a four-metre agility ladder and a printed guide with twelve progressive circuits.'),
  ('p7',
   'Training ball',
   'Size 5, machine stitched',
   'Product · ball on grass',
   'Heavy-use training ball with a latex bladder and a reinforced carcass.'),
  ('p8',
   'Coaching staff cap',
   'Metal rear closure',
   'Product · cap in profile',
   'Structured six-panel cap with front embroidery and a pre-curved brim.')
) as v(id, name_en, sub_en, shot_en, description_en)
where p.id = v.id;
