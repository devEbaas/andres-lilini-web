"use client";

import { useCallback, useEffect, useState } from "react";

import { createBrowserSupabase } from "@/lib/supabase/browser";
import { Spinner } from "@/components/ui/Spinner";
import { btnQuiet } from "@/components/ui/styles";

type Pendiente = { factorId: string; qr: string; secreto: string; uri: string };

/**
 * El SVG del QR a un `data:` URI que el navegador acepte.
 *
 * En base64 y no con `encodeURIComponent`: el SVG trae almohadillas en los
 * colores (`fill="#fff"`), y una `#` sin escapar corta la URI ahí mismo —el
 * navegador la lee como fragmento— y el resultado es el icono de imagen rota.
 * En base64 no hay carácter que pueda cortarla.
 */
function svgADataUri(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let binario = "";
  for (const b of bytes) binario += String.fromCharCode(b);
  return `data:image/svg+xml;base64,${btoa(binario)}`;
}

/**
 * Alta del segundo factor, entera en el navegador.
 *
 * El QR y el secreto no pasan por nuestro servidor a propósito: viajan de
 * Supabase al navegador y de ahí a la app de autenticación. Lo que no se
 * registra no se puede filtrar por un log.
 */
export function MfaEnroll({ activo }: { activo: boolean }) {
  const [tieneFactor, setTieneFactor] = useState(activo);
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const supabase = createBrowserSupabase();

  /** Limpia factores a medio enrolar de intentos anteriores. */
  const limpiarSueltos = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.mfa.listFactors();
    for (const f of data?.all ?? []) {
      if (f.factor_type === "totp" && f.status !== "verified") {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
    }
  }, [supabase]);

  useEffect(() => {
    void limpiarSueltos();
  }, [limpiarSueltos]);

  if (!supabase) return null;

  const empezar = async () => {
    setError("");
    setCargando(true);
    await limpiarSueltos();

    const { data, error: e } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Panel · ${new Date().toLocaleDateString("es-MX")}`,
      issuer: "Andrés Lillini",
    });
    setCargando(false);

    if (e || !data) {
      setError("No pudimos generar el código. Inténtalo de nuevo.");
      return;
    }
    setPendiente({
      factorId: data.id,
      qr: data.totp.qr_code,
      secreto: data.totp.secret,
      uri: data.totp.uri,
    });
  };

  const confirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendiente) return;
    setError("");
    setCargando(true);

    const { data: reto, error: eReto } = await supabase.auth.mfa.challenge({
      factorId: pendiente.factorId,
    });
    if (eReto || !reto) {
      setCargando(false);
      setError("No pudimos verificar el código. Inténtalo de nuevo.");
      return;
    }

    const { error: eVerify } = await supabase.auth.mfa.verify({
      factorId: pendiente.factorId,
      challengeId: reto.id,
      code: codigo,
    });
    setCargando(false);

    if (eVerify) {
      setCodigo("");
      setError("Código incorrecto o caducado. Prueba con el siguiente.");
      return;
    }

    setPendiente(null);
    setCodigo("");
    setTieneFactor(true);
  };

  const cancelar = async () => {
    if (pendiente) await supabase.auth.mfa.unenroll({ factorId: pendiente.factorId });
    setPendiente(null);
    setCodigo("");
    setError("");
  };

  const quitar = async () => {
    setError("");
    setCargando(true);
    const { data } = await supabase.auth.mfa.listFactors();
    for (const f of data?.totp ?? []) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    setCargando(false);
    setTieneFactor(false);
  };

  const aviso = error && (
    <div
      role="alert"
      className="rounded-[14px] border border-danger/50 bg-danger/10 px-4 py-3.5 text-sm text-danger-text"
    >
      {error}
    </div>
  );

  if (tieneFactor) {
    return (
      <div className="grid gap-4">
        <p className="m-0 text-sm leading-[1.7] text-accent">
          Segundo factor activo. Cada acceso pedirá el código de tu aplicación.
        </p>
        {aviso}
        <button type="button" onClick={quitar} disabled={cargando} className={btnQuiet}>
          {cargando ? "Quitando…" : "Quitar el segundo factor"}
        </button>
      </div>
    );
  }

  if (pendiente) {
    return (
      <form onSubmit={confirmar} className="grid gap-[18px]">
        <p className="m-0 text-sm leading-[1.7] text-muted">
          Escanea el código con Google Authenticator, 1Password o la app que uses.
        </p>

        <div className="mx-auto rounded-[18px] bg-white p-3.5">
          {/* `img` y no `next/image`: la fuente es un data: URI que se arma en
              el cliente, así que no hay nada que optimizar ni ninguna ruta que
              Next pueda resolver. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={svgADataUri(pendiente.qr)}
            alt="Código QR para configurar el segundo factor"
            width={200}
            height={200}
            className="block size-[200px]"
          />
        </div>

        <a
          href={pendiente.uri}
          className="text-center font-mono text-[11px] text-accent underline underline-offset-4 nav:hidden"
        >
          Abrir directamente en la app de autenticación
        </a>

        <label className="flex flex-col gap-[9px]">
          <span className="label-caps">Si no puedes escanear</span>
          <input
            readOnly
            value={pendiente.secreto}
            onFocus={(e) => e.currentTarget.select()}
            className="field !bg-bg font-mono !text-xs"
          />
        </label>

        <label className="flex flex-col gap-[9px]">
          <span className="label-caps">Código de la app</span>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="field !bg-bg text-center font-mono !text-[22px] tracking-[0.5em]"
          />
        </label>

        {aviso}

        <div className="flex flex-wrap gap-2.5">
          <button
            type="submit"
            disabled={cargando || codigo.length < 6}
            className="flex min-h-[48px] flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
          >
            {cargando && <Spinner />}
            {cargando ? "Activando" : "Activar"}
          </button>
          <button type="button" onClick={cancelar} className={btnQuiet}>
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="m-0 text-sm leading-[1.7] text-muted">
        Sin segundo factor, quien consiga tu contraseña entra al panel y ve las
        direcciones de todos los clientes.
      </p>
      {aviso}
      <button
        type="button"
        onClick={empezar}
        disabled={cargando}
        className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
      >
        {cargando && <Spinner />}
        {cargando ? "Generando" : "Activar segundo factor"}
      </button>
    </div>
  );
}
