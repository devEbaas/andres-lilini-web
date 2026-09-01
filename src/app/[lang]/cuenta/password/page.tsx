import { PasswordForm } from "@/components/auth/PasswordForm";
import { fijarIdioma } from "@/i18n/servidor";

export default async function PasswordPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  return (
    <div>
      <h2 className="m-0 mb-3.5 font-display text-2xl uppercase">Contraseña</h2>
      <p className="m-0 mb-7 max-w-[52ch] leading-[1.7] text-muted">
        Supabase pide haber entrado hace poco para cambiarla. Si te lo rechaza, vuelve a
        entrar y repite: es lo que impide que un portátil desbloqueado se convierta en
        una cuenta perdida.
      </p>

      <PasswordForm />
    </div>
  );
}
