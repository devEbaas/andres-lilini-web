"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { useTranslations } from "next-intl";

import { createBrowserSupabase } from "@/lib/supabase/browser";
import { Spinner } from "@/components/ui/Spinner";
import { btnQuiet } from "@/components/ui/styles";

/** `qr` guarda el `data:` URI del código, o "" si no se pudo dibujar. */
type Pendiente = { factorId: string; qr: string; secreto: string; uri: string };

/**
 * Dibuja el QR a partir del `otpauth://`, no del SVG que manda Supabase.
 *
 * Ese SVG venía con etiquetas mal cerradas —`<rect ... >` en vez de
 * `<rect ... />`—, y como un SVG se parsea con reglas de XML, una sola
 * etiqueta abierta aborta el documento entero. Se intentó sanearlo dos
 * veces y seguía fallando; repararlo a ciegas es perseguir un formato que
 * no controlamos.
 *
 * La URI sí es canónica: es exactamente lo que la app de autenticación
 * necesita, y de ella se deriva el mismo código. Un QR generado aquí no
 * puede venir malformado.
 */
async function dibujarQr(uri: string): Promise<string> {
  if (!uri) return "";
  try {
    return await QRCode.toDataURL(uri, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 400,
      // Alto contraste: el lector necesita negro sobre blanco, no los
      // colores del sitio.
      color: { dark: "#000000", light: "#ffffff" },
    });
  } catch (e) {
    console.warn("[mfa] no se pudo dibujar el QR", (e as Error).message);
    return "";
  }
}

export function MfaEnroll({ activo }: { activo: boolean }) {
  const t = useTranslations("mfa");
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
      setError(t("errorGenerar"));
      return;
    }
    // El QR es un extra, no el mecanismo: lo que enrola de verdad es el
    // secreto. Si el servidor no lo manda, se sigue pudiendo activar a mano,
    // así que no se deja que un campo vacío bloquee el alta.
    const uri = data.totp?.uri ?? "";
    const qr = await dibujarQr(uri);

    setPendiente({
      factorId: data.id,
      qr,
      secreto: data.totp?.secret ?? "",
      uri,
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
      setError(t("errorVerificar"));
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
      setError(t("codigoMal"));
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
          {t("activo")}
        </p>
        {aviso}
        <button type="button" onClick={quitar} disabled={cargando} className={btnQuiet}>
          {cargando ? t("quitando") : t("quitar")}
        </button>
      </div>
    );
  }

  if (pendiente) {
    return (
      <form onSubmit={confirmar} className="grid gap-[18px]">
        <p className="m-0 text-sm leading-[1.7] text-muted">
          {t("escanea")}
        </p>

        {pendiente.qr ? (
          <div className="mx-auto rounded-[18px] bg-white p-3.5">
            {/* `img` y no `next/image`: la fuente es un data: URI que se
                genera en el cliente, así que no hay nada que optimizar ni
                ninguna ruta que Next pueda resolver. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendiente.qr}
              alt={t("qrAlt")}
              width={200}
              height={200}
              className="block size-[200px]"
            />
          </div>
        ) : (
          <p className="m-0 rounded-[14px] border border-hairline bg-bg px-4 py-3.5 text-sm leading-[1.7] text-muted">
            {t("sinQr")}
          </p>
        )}

        {pendiente.uri && (
          <a
            href={pendiente.uri}
            className={`text-center font-mono text-[11px] text-accent underline underline-offset-4 ${
              pendiente.qr ? "nav:hidden" : ""
            }`}
          >
            {t("abrirApp")}
          </a>
        )}

        <label className="flex flex-col gap-[9px]">
          <span className="label-caps">{t("siNoEscaneas")}</span>
          <input
            readOnly
            value={pendiente.secreto}
            onFocus={(e) => e.currentTarget.select()}
            className="field !bg-bg font-mono !text-xs"
          />
        </label>

        <label className="flex flex-col gap-[9px]">
          <span className="label-caps">{t("codigoApp")}</span>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder={t("codigoPh")}
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
            {cargando ? t("activando") : t("activar")}
          </button>
          <button type="button" onClick={cancelar} className={btnQuiet}>
            {t("cancelar")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="m-0 text-sm leading-[1.7] text-muted">
        {t("porQue")}
      </p>
      {aviso}
      <button
        type="button"
        onClick={empezar}
        disabled={cargando}
        className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
      >
        {cargando && <Spinner />}
        {cargando ? t("generando") : t("activarTitulo")}
      </button>
    </div>
  );
}
