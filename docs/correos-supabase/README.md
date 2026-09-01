# Correos de Supabase Auth

Confirmación de registro, recuperación de contraseña y cambio de correo no los
manda la aplicación: los renderiza Supabase con las plantillas del panel, y
**sólo existe un juego de plantillas**, sin variante por idioma. Es el único
punto del sitio bilingüe que no puede resolverse desde el código.

Hay tres salidas, en orden de coste:

| Opción | Qué implica | Cuándo |
| --- | --- | --- |
| **(a) Bilingües** | Pegar los HTML de esta carpeta en el panel. Cada correo lleva el bloque en inglés y debajo el español. | Ahora. Es lo que está aquí. |
| **(b) Auth Hook** | Mover el envío a un hook que renderice desde la aplicación con Resend, como ya hacen los otros tres correos. Lee `profiles.locale` y manda una sola versión. | Cuando el tráfico en inglés lo justifique. |
| **(c) Sólo español** | No hacer nada. | Si se decide que el registro en inglés no es un caso real. |

## Cómo aplicar la opción (a)

En **Authentication › Emails › Templates** del panel de Supabase, pega el
contenido de cada archivo en la plantilla correspondiente:

| Archivo | Plantilla del panel |
| --- | --- |
| `confirmar-registro.html` | Confirm signup |
| `recuperar-password.html` | Reset password |
| `cambiar-correo.html` | Change email address |

El asunto también va bilingüe; está en la primera línea de cada archivo, como
comentario HTML.

Las variables (`{{ .ConfirmationURL }}`, `{{ .SiteURL }}`) son de Supabase y no
se tocan: las sustituye el servidor al enviar.

## Por qué no viven en el repositorio como código

Porque Supabase no las lee de aquí. Se guardan igualmente para que el texto
tenga control de versiones y para que quien las cambie en el panel sepa de
dónde salieron. **Si editas el panel, edita también estos archivos**, o la
próxima persona no sabrá cuál es la versión buena.
