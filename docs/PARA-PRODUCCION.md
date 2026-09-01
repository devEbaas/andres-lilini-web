# Qué falta para que esto sea productivo

Estado a 1 de septiembre de 2026. El sitio es **una demo para enseñar al
cliente**: funciona entero, pero el contenido es de relleno y no hay usuarios
reales. Todo lo de abajo está pendiente de decidirse o de hacerse.

`main` ya contiene las diez fases del bilingüe ES/EN.

---

## 1. Para que la demo funcione entera

### Aplicar las dos migraciones pendientes

```bash
npm run db:push
```

Añaden `locale` a siete tablas. **Sin ellas, cualquier formulario falla al
enviarse**: el insert intenta escribir una columna que no existe y la persona ve
«No pudimos registrar el envío». Es lo único que hoy impide que la demo se
recorra completa.

Se aplican solas al empujar a `main` (`deploy-migrations.yml`), así que puede
que ya estén. Comprobar en Supabase que `applications` tiene la columna
`locale`.

---

## 2. Correo — aplazado a propósito

No hay `RESEND_API_KEY` ni `EMAIL_FROM`, y el sitio está diseñado para
funcionar así: `enviarCorreo` devuelve `false` sin lanzar, y ninguna acción
falla por ello. Pero conviene saber qué queda cojo mientras tanto.

| Correo | Sin configurar |
| --- | --- |
| Invitación al expediente | **Funciona igual.** El panel devuelve el enlace y el admin lo copia a mano. Está pensado para esto. |
| Acuse de solicitud ARCO | Se pierde. La solicitud se registra y el admin la ve; sólo falta el acuse. |
| Autorización del tutor | **Se rompe el flujo.** Ver abajo. |

### El caso del tutor bloquea la postulación de un menor

Al postularse alguien menor de edad se genera un token, **se guarda sólo su
hash** y el enlace viaja únicamente por correo. Sin correo, ese enlace no
existe en ninguna parte: no hay forma de recuperarlo ni de reemitirlo, y la
postulación se queda «Sin verificar» para siempre.

**Resuelto:** `/admin/postulaciones` tiene ahora un botón «Reenviar
autorización» junto a cada tutor sin verificar. Reemite el enlace, lo muestra
una vez y lo copia al portapapeles; si hay correo configurado también lo manda.
El enlace anterior deja de valer, que es lo que se quiere si se perdió por
donde no debía. No aparece en las postulaciones ya autorizadas: ofrecerlo
invitaría a invalidar una autorización válida por error.

### Correos de Supabase Auth

Confirmación de cuenta y recuperación de contraseña **no pasan por Resend**:
los manda Supabase con las plantillas de su panel. Las versiones bilingües
están listas en [`docs/correos-supabase/`](./correos-supabase/) para pegar
cuando toque.

---

## 3. Antes del lanzamiento real

### Contenido

- [ ] **Los tres documentos legales** —`/contenido/privacidad`, `/terminos`,
      `/bases`— tienen texto de relleno. Al sustituirlo por el real, hay que
      revisarlo: el flujo recoge autorizaciones de tutores de menores bajo la
      LFPDPPP. La traducción al inglés se publica con un aviso de que es de
      cortesía y de que sólo el español vincula; **cuando el texto sea real,
      ese aviso pasa a ser una afirmación con consecuencias**.
- [ ] **Las fotografías.** `PhotoSlot` dibuja marcadores rayados con la
      descripción del encuadre previsto. Al llegar el material, sustituir por
      `next/image`. Los textos de esos marcadores están traducidos, así que se
      borran de `messages/` al quitarlos.
- [ ] **El catálogo de la tienda** son ocho productos de ejemplo con precios
      inventados. Si cambian, cambian en dos sitios: `PRODUCTS_SEED` y la
      migración. `npm run check:catalogo` avisa si se separan.
- [ ] **Las cifras de la portada** (1400 evaluados, 62 debutantes…) y la
      trayectoria: confirmar que son las reales antes de publicarlas.

### Configuración

- [ ] **`SITE_URL`** debe apuntar al dominio real. Se usa en los `success_url`
      de Stripe y en los enlaces de los correos. Si queda en `localhost`, los
      enlaces que reciba la gente no funcionan.
- [ ] **`metadataBase`** está escrito a mano en
      `src/app/[lang]/layout.tsx` como `https://andreslillini.com`. Tiene que
      coincidir con el dominio real o los `canonical` y `hreflang` apuntarán a
      otro sitio.
- [ ] **Stripe en modo vivo**: `STRIPE_SECRET_KEY` de producción y
      `STRIPE_WEBHOOK_SECRET` del endpoint real, que es distinto del que
      imprime `stripe listen`.
- [ ] **Dominio y DNS**, y el remitente verificado en Resend si para entonces
      hay correo.

### Buscadores

- [x] **`robots.txt`**: ya existe y **bloquea todo el sitio** mientras sea una
      demo. Sin él, el `sitemap.xml` —que lista las 44 URLs— habría bastado
      para que un buscador indexara el contenido de relleno.
- [ ] **Al lanzar, poner `SITIO_INDEXABLE=1`** en las variables de entorno.
      Eso invierte el `robots.txt`: permite el rastreo, declara el sitemap y
      bloquea sólo las áreas con sesión y los enlaces con token, en los dos
      idiomas. No se deduce de `NODE_ENV` a propósito: la demo también se
      construye en modo producción y eso la dejaría abierta.
- [ ] Dar de alta el sitio en Search Console y comprobar que reconoce las dos
      versiones de idioma.

### Seguridad y datos

- [ ] Revisar que no queden filas de prueba. Por convención llevan `PRUEBA` en
      el nombre y `@example.test` en el correo.
- [ ] Confirmar que `SUPABASE_SERVICE_ROLE_KEY` sólo está en las variables del
      servidor y en ningún sitio más.
- [ ] Activar el segundo factor en las cuentas de admin: el panel avisa pero
      no lo obliga.

---

## 4. Cómo comprobar que sigue bien

```bash
npm run check                    # catálogos de idioma, literales, semilla
npm run build && npm run start   # en otra terminal:
npm run humo                     # 112 comprobaciones del sitio bilingüe
npm run check:fugas              # español servido en páginas inglesas
```

Los tres chequeos de `npm run check` corren solos en cada PR
(`.github/workflows/verificar.yml`). El repaso de humo se lanza a mano contra
un servidor levantado, o contra un preview pasándole la URL:

```bash
npm run humo -- https://mi-preview.vercel.app
```

Lo que el humo **no** cubre, porque necesita sesión o dinero real:

- Comprar desde `/en/store` y confirmar que Stripe abre en inglés y cobra MXN.
- Entrar en `/en/login` y aterrizar en `/en/account`.
- Que una postulación en inglés dispare el correo bilingüe al tutor.

---

## 5. Decisiones que siguen abiertas

**Persistencia del idioma.** Hoy la URL manda: quien elige inglés y vuelve al
dominio pelado aterriza en español. Activar la cookie es una línea, pero hace
que la portada varíe por usuario y pierda cacheabilidad.

**Moneda.** La tienda cobra en MXN en los dos idiomas, y en inglés se muestra
`MX$480.00` para que nadie lo lea como dólares. Cobrar en USD es otro proyecto:
precios multi-divisa en Stripe, rehacer `SHIPPING_MXN` y resolver envíos
internacionales.

**La columna `cat` de `products`** quedó obsoleta al entrar `cat_key`. Se
conservó un ciclo por si había que revertir; ya no la lee nadie y se puede
eliminar con una migración de una línea.

**El panel es monolingüe** por decisión: `/admin` y `/sistema` piden el idioma
español y redirigen si se abren en inglés. Si algún día lo opera alguien que no
lea español, es una fase nueva — son unos 70 textos.
