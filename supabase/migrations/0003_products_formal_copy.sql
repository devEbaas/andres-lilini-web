-- Alinea el catálogo con el registro editorial del rediseño "Andrés Lillini Formal":
-- nombres sin prefijo, subtítulos con separador de punto medio y marcadores de foto 4:5.
insert into public.products (id, cat, name, sub, price, shot, description, sold_out, sort) values
  ('p1','Metodología','Cuaderno de sesión','120 sesiones planificables',480,'Producto 4:5 · cuaderno cerrado sobre mesa','Cuaderno de trabajo con la estructura de sesión utilizada en cantera: objetivo, tarea, carga, correcciones y evaluación individual. Papel de 100 g, cosido, resistente al trabajo de campo.',false,1),
  ('p2','Metodología','Cantera primero','Método de formación · 288 páginas',650,'Producto 4:5 · libro de tapa dura','Veintisiete años de trabajo formativo ordenados en un método: cómo detectar, cómo medir y cómo sostener a un jugador joven en tres países distintos.',false,2),
  ('p3','Indumentaria','Chamarra de cuerpo técnico','Edición limitada, unisex',1890,'Producto 4:5 · chamarra colgada','Tejido técnico repelente al agua, corte recto y escudo bordado en el pecho. Tirada única de 300 piezas.',true,3),
  ('p4','Indumentaria','Playera de entrenamiento','Tejido transpirable',590,'Producto 4:5 · playera doblada','Playera de entrenamiento con tejido de secado rápido y logotipo serigrafiado. Tallas de niño a adulto XXL.',false,4),
  ('p5','Indumentaria','Sudadera de campo','Algodón peinado 380 g',1240,'Producto 4:5 · sudadera sobre fondo neutro','Sudadera de peso completo para trabajo en frío, con capucha forrada y bolsillo frontal.',false,5),
  ('p6','Equipamiento','Set de conos y escalera','Kit de coordinación',890,'Producto 4:5 · kit desplegado','Doce conos, escalera de coordinación de cuatro metros y guía impresa con doce circuitos progresivos.',false,6),
  ('p7','Equipamiento','Balón de trabajo','Talla 5, cosido a máquina',720,'Producto 4:5 · balón sobre césped','Balón de entrenamiento de uso intensivo, con vejiga de látex y cámara reforzada.',false,7),
  ('p8','Accesorios','Gorra de cuerpo técnico','Ajuste trasero metálico',420,'Producto 4:5 · gorra de perfil','Gorra estructurada de seis paneles con bordado frontal y visera precurvada.',false,8)
on conflict (id) do update set
  cat = excluded.cat, name = excluded.name, sub = excluded.sub, price = excluded.price,
  shot = excluded.shot, description = excluded.description, sold_out = excluded.sold_out, sort = excluded.sort;
