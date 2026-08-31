# Correo transaccional y derechos ARCO — plan

Cierra los dos huecos que quedaron abiertos en [AUTENTICACION.md](./AUTENTICACION.md) §10:

1. **Correo transaccional** — sin él no se puede abrir el registro público.
2. **Borrado de cuenta y derechos ARCO** — obligación legal, y el único código pendiente del plan de auth.

Van juntos en un documento porque comparten una dependencia: los dos necesitan que `andreslillini.com` mande y reciba correo.

> **Estado**: §2 (ARCO) implementado. §1 (correo) pendiente — depende de DNS y de un buzón, que llegan en un paso futuro. Ver §5.

---

## 0. Estado verificado del terreno

Comprobado el 31 de agosto de 2026, no asumido:

| Hecho | Cómo se comprobó | Consecuencia |
|---|---|---|
| `andreslillini.com` registrado en GoDaddy el 27 ago 2026 | `whois` | El dominio es vuestro y podéis tocar su DNS |
| Nameservers en `domaincontrol.com` | `dig NS` | El DNS se gestiona desde el panel de GoDaddy |
| **Sin registros MX** | `dig MX` → vacío | `prensa@`, `atletas@` y `tienda@andreslillini.com` **no reciben correo** |
| Resend tiene `rentocuarto.com` y `allpuppies.com`, verificados | API de Resend | `andreslillini.com` **no está dado de alta**: hay que añadirlo |
| `enable_confirmations = true`, `enable_signup = false` en producción | `config.toml` y §6 del plan de auth | El registro está cerrado y así debe seguir hasta que el correo salga |

El sitio publica en `/contacto` tres direcciones que hoy no reciben nada. Eso ya es un problema por sí solo, y bloquea el canal de ARCO.

---

## 1. Correo transaccional

### 1.1 Enviar y recibir son dos problemas distintos

Se confunden constantemente y se resuelven por separado:

- **Enviar** (SPF + DKIM) es lo que necesita Supabase para mandar confirmaciones y resets. No requiere MX. Lo resuelve Resend.
- **Recibir** (MX) es lo que necesitan `prensa@`, `atletas@`, `tienda@` y el canal de ARCO. Resend no os da un buzón donde leer.

Se puede tener lo primero sin lo segundo, y es exactamente donde estáis a punto de quedaros si sólo se configura Resend.

### 1.2 Envío — pasos

1. **Alta del dominio en Resend.** `Domains → Add Domain` → `andreslillini.com`. Devuelve los registros DNS que hay que publicar.
2. **DNS en GoDaddy.** Añadir lo que dicte Resend: el TXT de SPF, los registros de DKIM y, si lo ofrece, el de retorno. Propagan en minutos, aunque GoDaddy a veces tarda más.
3. **Verificar en Resend** hasta que el dominio quede `verified`, igual que los otros dos.
4. **DMARC.** Un TXT en `_dmarc.andreslillini.com`, empezando en `p=none` para observar sin romper nada, y endureciendo a `quarantine` cuando el tráfico se vea limpio. Sin DMARC, SPF y DKIM protegen a medias.
5. **API key en Resend**, con permiso sólo de envío. Es la contraseña SMTP.
6. **SMTP en Supabase** → `Project Settings → Authentication → SMTP Settings`:
   - Host `smtp.resend.com`, puerto `587`
   - Usuario `resend`, contraseña la API key
   - Remitente `no-reply@andreslillini.com`, nombre «Andrés Lillini»
   - *(Confirmar host y puerto en la documentación de Resend antes de guardar; es lo único de esta lista que puede haber cambiado.)*
7. **Subir el límite de envío.** El `email_sent = 2` por hora es la protección del remitente compartido de Supabase. Con SMTP propio deja de tener sentido y estrangula el registro.
8. **Plantillas en español.** Las de fábrica están en inglés y con la marca de Supabase. Confirmación de cuenta, recuperación y cambio de correo, como mínimo. En local van por `config.toml` (`[auth.email.template.*]`); en producción, por el dashboard.

### 1.3 Recepción — decisión pendiente

Hace falta un buzón real donde alguien lea. Tres caminos, y hay que elegir uno:

| Opción | A favor | En contra |
|---|---|---|
| Google Workspace | Lo que ya sabe usar todo el mundo | De pago por usuario |
| Zoho Mail | Plan gratuito para un dominio | Menos familiar |
| Buzón de GoDaddy | El DNS ya está ahí, cero configuración extra | Interfaz pobre |

Da igual cuál, pero **elegir uno es requisito** para publicar el canal de ARCO. Y ojo con el orden: los MX que añada el proveedor de buzón conviven con los TXT de Resend sin pisarse, pero conviene añadir los de Resend primero y verificar antes de tocar nada más.

### 1.4 Criterio de terminado

- [ ] `andreslillini.com` en `verified` dentro de Resend
- [ ] DMARC publicado, aunque sea en `p=none`
- [ ] Un registro de prueba en local recibe la confirmación en un buzón real
- [ ] El correo cae en bandeja de entrada, no en spam (probar con Gmail y con Outlook)
- [ ] Las tres direcciones de `/contacto` reciben
- [ ] Sólo entonces: abrir `enable_signup` en producción

Ese último punto es el que amarra todo lo demás. Abrir el registro antes deja a la gente con cuentas que no pueden confirmar.

---

## 2. Borrado de cuenta y derechos ARCO

### 2.1 El problema real

Borrar `auth.users` no borra los datos personales. Cascadea a `profiles` y `user_roles`, y deja `orders.user_id` en null porque la clave se declaró `on delete set null`. Pero deja intactos:

| Tabla | Datos personales | Ligada a la cuenta |
|---|---|---|
| `orders` | `email`, `shipping_address` (nombre y dirección) | Sí, por `user_id` |
| `applications` | nombre, correo, vídeo, `payload` | **No**, sólo por correo |
| `convocatoria_entries` | nombre, correo, archivo subido | **No** |
| `contact_messages` | nombre, correo, mensaje | **No** |
| `newsletter_subscribers` | correo | **No** |

Cuatro de las cinco no tienen ni idea de qué cuenta pertenecen: se llenaron desde formularios públicos, sin sesión. Un «borrar mi cuenta» que sólo toque `auth.users` deja al usuario creyendo que se fue, cuando su nombre y su correo siguen en cuatro tablas.

Y en la que sí está ligada hay una tensión: los pedidos no se pueden borrar sin más, porque hay obligación fiscal de conservarlos. La respuesta correcta no es borrar, es **anonimizar**.

### 2.2 Dos vías, no una

**Vía A — Cancelación de cuenta.** Autoservicio, inmediata, desde `/cuenta`. Cubre lo que está ligado a la cuenta.

**Vía B — Solicitud ARCO.** Canal documentado, con plazo legal, abierto también a quien nunca tuvo cuenta. Cubre lo que entró por formularios públicos.

Intentar meterlo todo en un botón es lo que produce o bien un borrado incompleto, o bien uno que destroza una postulación en curso.

### 2.3 Vía A — cancelación de cuenta

Qué pasa al pulsar, y qué se le dice al usuario **antes** de pulsar:

| Dato | Qué se hace | Por qué |
|---|---|---|
| `auth.users`, `profiles`, `user_roles` | Se borran | Ya no hay cuenta |
| `orders` (importes, fechas, estado) | Se conservan | Obligación fiscal de conservación |
| `orders.email`, `orders.shipping_address` | **Se anonimizan** | El dato personal se va; la contabilidad se queda |
| Postulaciones, convocatoria, mensajes, boletín | No se tocan | Requieren la vía B: pueden estar en un proceso en curso |

La pantalla tiene que decir esto en palabras llanas, no en letra pequeña. Un borrado que promete más de lo que hace es peor que uno honesto.

**Requisitos técnicos:**

- **Reautenticación con contraseña.** Es irreversible. La verificación se hace con un cliente desechable (anon, sin cookies), no con el de la sesión: si la contraseña falla no queremos haber tocado la sesión activa.
- **Confirmación escrita.** Teclear el correo propio, no un «¿seguro?».
- **El borrado necesita service role** (`auth.admin.deleteUser`). Es de los pocos sitios donde está justificado, y va después de haber verificado la identidad.
- **La anonimización, en una función SQL** `security definer` con `search_path = ''`, para que ocurra en la misma transacción y no dependa de que la aplicación se acuerde.
- **Registro de la baja sin datos personales.** Hace falta poder demostrar cuándo se atendió, pero guardar el correo de quien pidió que borraras su correo es contradictorio. Se guarda el `user_id` (ya huérfano) y la fecha. Nada más.
- **Cerrar sesión y redirigir** a una página que confirme qué se conservó.

**Regalo barato: exportación.** El derecho de acceso se satisface con un botón que devuelva perfil y pedidos en JSON. Son veinte líneas y cubre entero uno de los cuatro derechos para quien tiene cuenta.

### 2.4 Vía B — solicitudes ARCO

Tabla nueva, con el mismo criterio que el resto del esquema:

```sql
create table public.arco_requests (
  id          uuid primary key default gen_random_uuid(),
  tipo        text not null check (tipo in ('acceso','rectificacion','cancelacion','oposicion')),
  email       text not null,
  nombre      text not null default '',
  detalle     text not null default '',
  status      text not null default 'recibida'
              check (status in ('recibida','en_proceso','atendida','rechazada')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users on delete set null,
  nota        text
);

alter table public.arco_requests enable row level security;
-- Insert por service role desde el formulario público, como contact_messages.
-- Select y update sólo para admin, con public.is_admin().
```

**Formulario público**, no detrás de login: el derecho es de cualquier titular, tenga cuenta o no.

**Verificación de identidad manual.** La ley exige acreditar identidad antes de entregar o borrar datos. Eso no se automatiza con un formulario, y no hay que fingir que sí: el admin lo gestiona por correo y lo anota en `nota`.

**Pantalla en `/admin/arco`** con la cola, el detalle y las acciones. Cada resolución, a `admin_audit`.

**Herramientas de ejecución** que el admin necesita, y que hoy no existen:

- Buscar por correo en las cinco tablas a la vez.
- Exportar todo lo de un correo (acceso).
- Borrar o anonimizar por correo (cancelación) — incluyendo **el archivo en el bucket** de convocatoria, que es el que más fácil se olvida porque no está en ninguna tabla.
- Baja del boletín (oposición).

> **Plazos**: la LFPDPPP fija plazos para responder y para hacer efectiva la solicitud. Confírmalos con quien lleve el tema legal antes de publicar el aviso — no los des por buenos desde aquí.

### 2.5 Aviso de privacidad

`/contenido/privacidad` ya existe como documento, y el formulario de registro enlaza a él. Hay que revisar que diga lo que el sistema hace de verdad:

- Qué datos se recogen y para qué.
- Cuánto se conservan los pedidos y por qué no se borran a petición.
- Cómo ejercer ARCO: la dirección de correo **que reciba de verdad** (§1.3) y el formulario.
- Que se usa Stripe como procesador de pagos y Supabase como alojamiento.

---

## 3. Orden de trabajo

El correo va primero, y no es indiferente: sin buzón no hay canal de ARCO que publicar, y sin envío no se puede abrir el registro que hace que las cuentas —y por tanto sus bajas— existan de verdad.

```
1. Resend: alta y verificación de andreslillini.com     [tú, DNS]
2. Elegir proveedor de buzón y publicar los MX          [tú, decisión]
3. SMTP en Supabase + plantillas en español             [tú, dashboard]
4. Probar registro completo en local                    [conjunto]
5. Vía A: cancelación de cuenta y exportación           [código]
6. Vía B: tabla, formulario público y panel             [código]
7. Revisar el aviso de privacidad                       [conjunto]
8. Abrir enable_signup en producción                    [tú, dashboard]
```

Los pasos 5 y 6 se pueden escribir en paralelo a los primeros: no dependen del correo para existir, sólo para probarse de punta a punta.

## 4. Lo que hay que decidir antes de empezar

1. **Proveedor de buzón** (§1.3). Bloquea el canal de ARCO.
2. **Dirección remitente**: `no-reply@` es lo habitual, pero conviene una que reciba para las respuestas de la gente que le da a «responder» igualmente.
3. **¿La cancelación de cuenta borra también las postulaciones?** El plan dice que no, porque puede haber un proceso en curso. Si preferís que sí, hay que decirlo en la pantalla y aceptar que se pierde la candidatura.
4. **Plazo de conservación de los pedidos** antes de anonimizarlos. Requiere el criterio fiscal de vuestro contable.


---

## 5. Estado de la implementación

### Hecho — todo el §2

Sitio demo: se construyó lo que no depende de DNS ni de buzón, que es el capítulo entero de ARCO.

| Archivo | Qué hace |
|---|---|
| `supabase/migrations/20260831140000_privacidad_arco.sql` | `arco_requests`, `account_deletions`, `cancelar_mi_cuenta()` y sus policies |
| `src/lib/actions/privacidad.ts` | Exportación, cancelación de cuenta, alta y resolución de solicitudes |
| `src/lib/actions/arco-datos.ts` | Búsqueda y purga por correo en las cinco tablas |
| `src/app/cuenta/privacidad/` | Descargar mis datos y cancelar la cuenta |
| `src/app/derechos/` | Formulario público, sin necesidad de cuenta |
| `src/app/admin/arco/` | Cola de solicitudes y herramienta de ejecución |
| `src/lib/content/docs.ts` | Aviso de privacidad: conservación, encargados y canal de derechos |

Verificado con `tsc`, `eslint` y `next build`.

### Decisiones que quedaron en el código

- **La cancelación anonimiza los pedidos, no los borra.** `email` y `shipping_address` a null; importes, fechas y estado se quedan. La pantalla lo dice antes de pulsar, en tres bloques: qué se borra, qué se anonimiza y qué no se toca.
- **La anonimización corre antes del borrado**, dentro de una función SQL. Después de borrar `auth.users` ya no habría forma de saber qué pedidos eran suyos.
- **Reautenticación con contraseña, verificada con un cliente desechable** sin cookies: si la contraseña falla, la sesión activa no se toca.
- **La baja se registra sin datos personales.** `account_deletions` guarda el id huérfano y la fecha. Guardar el correo de quien pidió que borraras su correo sería contradictorio.
- **La purga borra los archivos del bucket antes que las filas.** Al revés se pierde la ruta y el archivo queda huérfano para siempre: es lo que más se olvida, porque después no aparece en ninguna tabla.
- **La purga usa service role** porque ninguna tabla tiene policy de delete —a propósito, para que borrar nunca sea un accidente del panel—. La autoriza `adminOrNull()` y queda en `admin_audit`.
- **La verificación de identidad es manual y no se finge lo contrario.** El formulario abre una solicitud; el admin acredita por correo y lo anota.

### Pendiente — sólo lo externo

- [ ] Alta y verificación de `andreslillini.com` en Resend (§1.2)
- [ ] Proveedor de buzón y registros MX (§1.3)
- [ ] SMTP en el dashboard de Supabase y plantillas en español
- [ ] Revisar los plazos legales del aviso con asesoría
- [ ] Abrir `enable_signup` en producción, y sólo después del correo

Mientras el correo no salga, la vía B funciona pero es muda: la solicitud entra en la cola y el admin la ve, pero nadie recibe un acuse. Para un sitio demo es suficiente; antes de abrirlo a gente real, no.
