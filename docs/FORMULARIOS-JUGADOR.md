# Datos del jugador y consentimiento de menores — análisis y plan

Revisión de los dos formularios que recogen datos de jugadores, qué falta, y qué obliga la ley mexicana cuando la mayoría de quienes se postulan son menores de edad.

> **Estado**: Fases 0 y 1 implementadas (31 ago 2026). Ver §7.

---

## 1. El diagnóstico no es el que parecía

La intuición era «los campos de postulación son muy básicos». Al mirarlo, hay **dos formularios distintos** y sólo uno tiene ese problema.

### `/programa` — Programa de atletas

Ya es bastante completo. Cinco pasos, y sí pregunta lo que se echaba en falta:

| Se dijo que faltaba | Dónde está |
|---|---|
| Qué posición juega | `pos1` y `pos2`, con siete opciones |
| Pierna dominante | `pie` — derecho / izquierdo / ambos |
| Velocidad de sprint | `vel` — 30 m en segundos |

Y además: estatura, peso, equipo, liga, años practicando, nivel más alto, contacto del entrenador, salto vertical, Yo-Yo, sentadilla máxima, disponibilidad para viajar y reubicarse.

**Su problema es otro**, y está en la sección 3.

### `/convocatoria` — Beca de formación 2027

Aquí sí. El formulario recoge **cinco campos**: nombre, correo, un enlace opcional, un texto de propuesta y un archivo.

Pero las bases publicadas en `/contenido/bases` dicen:

> «Jugadores de **12 a 21 años** residentes en México, sin contrato profesional vigente al cierre de la convocatoria.»

Tres consecuencias inmediatas:

1. **No se pide la fecha de nacimiento.** El requisito de edad de tus propias bases es inaplicable: no hay forma de saber si quien se postula tiene 12, 21 o 34.
2. **No se pide la residencia.** Mismo problema con «residentes en México».
3. **El jurado evalúa «potencial deportivo, contexto y compromiso académico»** y el formulario no pregunta nada de las tres cosas. La propuesta en texto libre tiene que cargar con todo.

El formulario está diseñado como si fuera un concurso de propuestas. La convocatoria es una beca deportiva para menores.

---

## 2. El hueco más grave: consentimiento de menores

De 12 a 21 años significa que **la mayoría de quienes se postulan son menores de edad**. Y aquí no se trata de mejorar un formulario, sino de que hoy se está incumpliendo una promesa ya publicada.

### Lo que tu aviso de privacidad ya promete

En `/contenido/privacidad`, literalmente:

> «Toda postulación de una persona menor de 18 años requiere el consentimiento expreso de su padre, madre o tutor legal, **incluidos nombre completo, parentesco y medio de contacto verificable**.»

### Lo que los formularios hacen de verdad

| | Nombre del tutor | Parentesco | Contacto | ¿Obligatorio? |
|---|---|---|---|---|
| `/programa` | Campo existe | Campo existe | Campo existe | **No.** Ninguno tiene `required` |
| `/convocatoria` | No existe | No existe | No existe | — |

En el programa, un menor puede completar y enviar la postulación dejando los tres campos del tutor en blanco. En la convocatoria ni siquiera aparecen.

**Prometer más de lo que se hace es la peor de las dos opciones**: si no dijeras nada, sería una omisión; diciéndolo y no cumpliéndolo, es una declaración falsa en un documento legal publicado.

### Lo que exige la ley

La [nueva LFPDPPP (2025)](https://adrianaperalta.com/2025/04/29/proteccion-de-datos-personales-de-menores-obligaciones-reforzadas-en-la-nueva-lfpdppp-2025/) refuerza las obligaciones sobre datos de menores. Tres puntos que afectan al diseño:

- **El consentimiento lo da quien ejerce la patria potestad o la tutela**, y debe ser libre, informado, específico e inequívoco.
- **Tiene que ser demostrable.** No basta con que alguien marque una casilla: hay que poder acreditar que un adulto responsable lo entendió y lo autorizó. Una casilla marcada por el propio menor no acredita nada.
- **El aviso de privacidad debe describir el mecanismo** concreto con el que se obtiene ese consentimiento, y las medidas especiales que se toman con estos datos.

Las [recomendaciones del IDAIP](http://www.idaipqroo.org.mx/archivos/institucion/datos-personales/recomendaciones/01_recomendaciones_idaip_dp_menores.pdf) van en la misma línea: tratamiento reforzado y minimización cuando hay menores de por medio.

### Y un segundo tipo de dato que cambia las reglas

Si el programa incluye **concentraciones presenciales** y **visorías** —y las incluye, según `/fundacion`— hacen falta contacto de emergencia y datos médicos básicos. Pero los datos de salud son **datos personales sensibles** bajo la LFPDPPP: exigen consentimiento **expreso y por escrito**, separado del general.

Eso obliga a una decisión de diseño, no sólo a añadir campos: **no pidas datos de salud en la postulación inicial**. Pídelos cuando el jugador ya esté preseleccionado y vaya a asistir a algo presencial, con su propio consentimiento diferenciado. Recoger historial médico de cientos de menores que nunca van a pisar una concentración es exposición legal sin ninguna contrapartida.

---

## 3. Qué datos importan de verdad, y para qué

Organizados por la decisión que permiten tomar, no como lista de deseos. Un campo que no cambia ninguna decisión es un campo que no debe existir.

### Elegibilidad — sin esto no puedes aplicar tus propias bases

| Dato | Por qué | ¿Está? |
|---|---|---|
| Fecha de nacimiento | Categoría por edad y el filtro 12–21 | Programa sí · **Convocatoria no** |
| País y estado de residencia | Requisito «residentes en México» | Programa sí · **Convocatoria no** |
| ¿Contrato profesional vigente? | Las bases lo excluyen y nadie lo pregunta | **Ninguno** |
| Categoría actual | Sub-13, Sub-15, Sub-17, Sub-20, libre | **Ninguno** |

### Perfil deportivo — lo que un evaluador mira primero

Posición principal y secundaria, pie dominante, estatura, peso, club actual, liga, años de práctica, nivel más alto. **El programa ya lo tiene completo.** La convocatoria no tiene nada.

Dos añadidos que valen la pena en ambos:

- **Dorsal y años en el club actual.** Ayuda a cruzar con video y con el contacto del entrenador.
- **Historial de clubes.** Un jugador que cambió de club cinco veces en tres años cuenta una historia distinta a uno con seis años en el mismo sitio. Es contexto, que es uno de los tres criterios del jurado.

### Medibles — con una advertencia importante

El programa pide 30 m, salto vertical, Yo-Yo y sentadilla. Tres matices de cómo se usan estos datos en fútbol:

- **Los 10 m importan más que los 30 m.** El fútbol se juega en aceleraciones cortas; la velocidad punta sobre 30 m se alcanza pocas veces por partido. Los perfiles de aceleración se analizan típicamente en el tramo 0–10 m. Vale la pena pedir los dos.
- **Falta el cambio de dirección.** Un test de agilidad (505, Illinois, T-test) discrimina más que la línea recta para casi todas las posiciones.
- **Son datos auto-reportados sin protocolo.** Un 30 m cronometrado a mano por el entrenador y uno con fotocélulas se diferencian en dos o tres décimas — más que la diferencia entre un jugador rápido y uno normal. **Sirven para ordenar candidatos, no para compararlos entre sí.** Conviene añadir un campo de «cómo se midió» (cronómetro / fotocélulas / app) y decirlo en la interfaz, o los números darán una falsa sensación de precisión.

### Contexto y académico — lo evalúas y no lo preguntas

Las bases dicen que el jurado califica «contexto y compromiso académico». La campaña «Beca académica paralela» de `/fundacion` es explícita: «sin avance académico no hay continuidad deportiva».

Ninguno de los dos formularios pregunta si el jugador estudia. Hace falta al menos: escolaridad actual, si sigue estudiando, y turno —porque determina si puede entrenar por la mañana o por la tarde, que es una restricción operativa real.

### Salud y seguridad — sólo en la fase presencial

Contacto de emergencia con parentesco, alergias, condiciones médicas relevantes, lesiones de los últimos doce meses, y si cuenta con seguro médico o servicio de salud. Es lo que piden las inscripciones de fuerzas básicas en México, donde el [certificado médico original](https://playadelcarmen.gob.mx/mpdc-idm-di-fb-022) es requisito habitual junto con la constancia de estudios.

**Repito el criterio de la sección 2: esto no va en la postulación abierta.** Va en la fase de preselección.

### Consentimientos — tres, no uno

Hoy hay dos casillas genéricas. Hacen falta tres cosas distintas, porque autorizan tratamientos distintos:

1. **Tratamiento de datos personales** (el que ya existe).
2. **Consentimiento del tutor**, si el jugador es menor: con nombre, parentesco y contacto verificable — lo que ya prometes.
3. **Uso de imagen**, separado. Un video de un menor es un dato personal, y publicarlo en redes o en materiales del programa es una finalidad distinta de evaluarlo. Debe poder aceptarse la evaluación y rechazarse la difusión.

El marco de [FIFA Guardians](https://inside.fifa.com/human-rights/fifa-guardians) sobre salvaguarda de menores apunta en la misma dirección: cultura de seguridad y transparencia en toda actividad que involucre a niños.

---

## 4. ¿Vale la pena? Sí, pero no como un formulario más largo

La pregunta de fondo era si merece la pena pedir más datos. La respuesta corta es sí; la larga tiene un matiz que decide el diseño.

**Cada campo cuesta envíos.** Un formulario de cuarenta preguntas para una beca gratuita ahuyenta justo al perfil que dices querer alcanzar: las campañas de `/fundacion` hablan de «municipios sin representación en ligas formativas» y de cubrir transporte y comida. Ese candidato se postula desde un teléfono, con datos móviles, y es el menos tolerante a la fricción de todos.

Y la mayoría de esos datos **no sirven para nada hasta que alguien pasa el primer corte**. La sentadilla máxima de un chico que no llegó a la lista corta es un dato que costó abandonos y no se usó nunca.

### La solución es partirlo en dos

**Fase 1 — Postulación abierta.** Corta, de móvil, dos o tres minutos. Sólo lo que decide si sigue: elegibilidad (edad, residencia, sin contrato), contacto, perfil deportivo mínimo (posición, pie, club, categoría), video, y los consentimientos. Si es menor, los datos del tutor **obligatorios**.

**Fase 2 — Expediente del preseleccionado.** Por invitación, con enlace privado tras pasar el corte. Aquí sí: medibles con su protocolo, historial de clubes, académico, salud, contacto de emergencia, consentimiento de imagen firmado por el tutor.

Con esto se resuelven las dos cosas a la vez: pides mucho más de quien importa, y menos de quien no ha pasado el filtro. Y reduce la exposición legal, porque los datos sensibles sólo existen para un puñado de personas en lugar de para cientos.

---

## 5. Plan de implementación

### Fase 0 — Cerrar la brecha legal *(prioritaria e independiente del resto)*

Es lo único que hoy es un incumplimiento, no una mejora.

- [ ] En `/programa`: hacer `tutor`, `tutorTel` y `parentesco` **obligatorios** cuando `nac` indique menor de 18. Validación en el servidor, no sólo en el cliente.
- [ ] En `/convocatoria`: añadir fecha de nacimiento y, si es menor, el bloque del tutor con las mismas reglas.
- [ ] Guardar la fecha y hora del consentimiento junto al registro, para poder acreditarlo.
- [ ] Revisar el aviso de privacidad para que describa **el mecanismo** de obtención del consentimiento del tutor, como exige la ley.

### Fase 1 — Elegibilidad en la convocatoria

- [ ] Fecha de nacimiento, país y estado de residencia, categoría actual, declaración de no tener contrato profesional vigente.
- [ ] Validar el rango 12–21 en el servidor y devolver un mensaje claro a quien queda fuera.
- [ ] Perfil deportivo mínimo: posición, pie, club, liga.
- [ ] Consentimiento de imagen como casilla separada de la de datos.

### Fase 2 — Unificar el modelo

- [ ] Extraer un tipo `PerfilJugador` compartido. Hoy `programa` define sus campos en `content/programa.ts` y `convocatoria` los tiene incrustados en el componente: dos fuentes de verdad que van a divergir.
- [ ] Guardar los campos estructurados en columnas, no dentro del `payload` jsonb. Hoy todo el detalle de una postulación vive en un blob que no se puede filtrar ni ordenar desde el panel.
- [ ] Añadir historial de clubes y bloque académico.

### Fase 3 — Expediente del preseleccionado

- [ ] Enlace privado por invitación para quien pasa el corte.
- [ ] Medibles con campo de protocolo de medición, incluido 10 m y un test de cambio de dirección.
- [ ] Salud, contacto de emergencia y consentimiento de imagen del tutor, con su consentimiento expreso separado.

### Panel

- [ ] Filtros por categoría, posición y estado en `/admin/postulaciones`, que hoy es una lista plana.
- [ ] Marcar visualmente los expedientes de menores, para que quien los maneje sepa que aplican reglas distintas.

---

## 6. Lo que hay que decidir antes de empezar

1. **¿La convocatoria y el programa son dos puertas al mismo proceso, o dos procesos?** Si son lo mismo con distinto nombre, sobra un formulario. Si son distintos, las bases deberían explicar en qué.
2. **¿Habrá actividades presenciales con menores?** Si la respuesta es sí —y las visorías y concentraciones lo son—, hace falta una política de salvaguarda escrita, no sólo campos en un formulario.
3. **Plazos y alcance del consentimiento de imagen**: evaluación interna, materiales del programa, redes sociales. Son tres permisos distintos y conviene separarlos.
4. **Revisión legal.** Todo lo de la sección 2 sale de la lectura de la ley y de guías públicas, no de asesoría jurídica. Antes de publicar cambios en el aviso de privacidad, que lo vea quien lleve el tema legal.

---

## Fuentes

- [Protección de datos personales de menores — obligaciones reforzadas en la nueva LFPDPPP 2025](https://adrianaperalta.com/2025/04/29/proteccion-de-datos-personales-de-menores-obligaciones-reforzadas-en-la-nueva-lfpdppp-2025/)
- [LFPDPPP — texto de la ley](https://dgesui.ses.sep.gob.mx/sites/default/files/2026-01/LFPDPPP.pdf)
- [Reglamento de la LFPDPPP](https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LFPDPPP.pdf)
- [Recomendaciones para proteger los datos personales de menores de edad — IDAIP](http://www.idaipqroo.org.mx/archivos/institucion/datos-personales/recomendaciones/01_recomendaciones_idaip_dp_menores.pdf)
- [Lineamientos del Aviso de Privacidad — DOF](https://www.dof.gob.mx/nota_detalle.php?codigo=5284966&fecha=17%2F01%2F2013)
- [FIFA Guardians — salvaguarda y protección infantil](https://inside.fifa.com/human-rights/fifa-guardians)
- [Child Safeguarding Toolkit — UEFA](https://uefafoundation.org/wp-content/uploads/2020/08/uefa-toolkit-english-5ed7b80c36150-5f3797b9f1008.pdf)
- [The FA — Section 7: children and young people (under-18s)](https://www.thefa.com/football-rules-governance/safeguarding/section-7-children-and-young-people-under-18s)
- [Requisitos de inscripción, fuerzas básicas — ejemplo municipal](https://playadelcarmen.gob.mx/mpdc-idm-di-fb-022)
- [Sector Amateur FMF — cómo afiliarse](https://amateur.fmf.mx/como-afiliarme)


---

## 7. Estado de la implementación

### Hecho — Fase 1: elegibilidad y perfil en la convocatoria

| Archivo | Qué añade |
|---|---|
| `supabase/migrations/20260831160000_convocatoria_elegibilidad.sql` | Diez columnas nuevas en `convocatoria_entries`, sus CHECK y un índice por categoría |
| `src/lib/content/fundacion.ts` | Fecha de cierre, rango de edad, `edadAlCierre()`, estados, categorías, posiciones y pies |
| `src/lib/actions/convocatoria.ts` | Validación completa con errores por campo |
| `src/components/convocatoria/ConvocatoriaForm.tsx` | Los campos nuevos, en secciones, con el error debajo de cada uno |
| `src/app/admin/convocatoria/page.tsx` | Edad al cierre, categoría, posición, pie y estado en el listado |

Verificado con `tsc`, `eslint` y `next build`.

**Cuatro decisiones que quedaron en el código:**

- **La edad se calcula al cierre, no hoy.** Quien cumple 22 en octubre queda fuera aunque hoy tenga 21; quien cumple 12 en noviembre entra aunque hoy tenga 11. Con la fecha actual, el mismo jugador sería elegible o no según el día en que abriera el formulario. Comprobado en los seis casos límite.
- **El rango 12–21 no es un CHECK de la base.** Depende de la fecha de cierre y cambiaría de significado cada temporada: es regla de aplicación, no de esquema. La base sólo rechaza fechas imposibles.
- **Quedar fuera por edad se explica, no se enmascara.** El mensaje dice el rango y la edad que tendría, en vez del genérico «revisa los campos». No es un error del participante.
- **Las columnas nuevas son nullable.** Las participaciones anteriores no tienen estos datos y no se inventan; la obligatoriedad la impone la Server Action para los envíos nuevos.

**Y una consecuencia visible**: quien no reside en México o está fuera del rango ya no puede enviar. Antes se registraba igual y alguien tenía que descartarlo a mano.

### Hecho — Fase 0: consentimiento del tutor

| Archivo | Qué añade |
|---|---|
| `src/lib/edad.ts` | `edadEn()` y `esMenorHoy()`, compartidos por los dos formularios |
| `supabase/migrations/20260831180000_tutor_menores.sql` | Columnas de tutor en ambas tablas y el CHECK que impide un menor sin tutor |
| `src/lib/content/programa.ts` | `soloMenores` y `requiredIfMenor` en los campos de tutor |
| `src/lib/actions/apply.ts` · `convocatoria.ts` | Validación condicional y persistencia |
| `src/components/programa/ApplyForm.tsx` · `ConvocatoriaForm.tsx` | Bloque del tutor visible sólo para menores, con aviso |
| `src/app/admin/postulaciones/` · `convocatoria/` | Distintivo «Menor» y contacto del tutor |
| `src/lib/content/docs.ts` | El aviso de privacidad describe el mecanismo, como exige la ley |

**Cinco decisiones que quedaron en el código:**

- **Dos fechas de referencia, no una.** La elegibilidad se mide al cierre; la minoría de edad, hoy. Alguien nacido el 15/09/2008 tiene 17 hoy —menor, necesita tutor— y 18 al cierre —elegible como adulto—. Usar una sola fecha da la respuesta equivocada a una de las dos preguntas.
- **Ante una fecha ilegible se asume menor.** Equivocarse hacia el lado protector cuesta un campo de más; hacia el otro, saltarse el consentimiento del tutor.
- **A los mayores de edad no se les enseñan los campos del tutor.** No es sólo estética: guardar los datos de un adulto ajeno «por si acaso» es recoger a alguien que no se postuló. La acción también los anula al guardar.
- **El CHECK vive en la base, no sólo en la aplicación.** `not es_menor or (tutor_nombre is not null and ...)`. Es la regla que el aviso de privacidad promete por escrito: si algún día se inserta desde otro sitio, la base sigue diciendo que no.
- **La autorización del tutor es una casilla separada** de la de privacidad y la de veracidad. Autorizan cosas distintas y deben poder marcarse por separado.

**Y una limitación que conviene no maquillar**: el consentimiento es hoy **declarativo**. El formulario exige los datos del tutor y su autorización, pero nadie comprueba que quien marca la casilla sea el tutor. La verificación real —un correo o SMS de confirmación al tutor— depende del SMTP, que sigue pendiente. El aviso de privacidad describe el mecanismo tal como es, sin prometer una verificación que todavía no existe.

### Pendiente

- [ ] Verificación real del tutor por correo, cuando haya SMTP ([PRIVACIDAD-Y-CORREO.md](./PRIVACIDAD-Y-CORREO.md) §1).
- [ ] Revisión legal del aviso antes de producción.
- [ ] Fases 2 y 3 — §5.
