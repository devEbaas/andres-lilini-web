"use client";

import { useState, useTransition } from "react";

import { enviarExpediente, type ExpedientePayload } from "@/lib/actions/expediente";
import {
  ALCANCES_IMAGEN,
  PARENTESCOS,
  PROTOCOLOS,
  SEGUROS,
  TESTS_AGILIDAD,
} from "@/lib/content/jugador";
import { Spinner } from "@/components/ui/Spinner";

type Errores = Record<string, string>;

const VACIO: ExpedientePayload = {
  sprint10: "", sprint30: "", saltoCmj: "", agilidadTest: "", agilidadSeg: "",
  yoyo: "", protocolo: "", medidoEn: "",
  contactoNombre: "", contactoParentesco: "", contactoTel: "",
  alergias: "", condiciones: "", lesiones: "", seguro: "",
  okSalud: false, okImagen: false, imagenAlcance: "", firmanteNombre: "",
};

function Campo({
  label, name, errores, hint, ancho, children,
}: {
  label: string;
  name: string;
  errores: Errores;
  hint?: string;
  ancho?: boolean;
  children: React.ReactNode;
}) {
  const error = errores[name];
  return (
    <label className={`flex flex-col gap-[9px] ${ancho ? "col-span-full" : ""}`}>
      <span className="label-caps">{label}</span>
      {children}
      {hint && !error && (
        <span className="font-mono text-[10px] leading-[1.6] text-muted">{hint}</span>
      )}
      {error && (
        <span role="alert" className="text-[11px] leading-[1.5] text-danger-text">
          {error}
        </span>
      )}
    </label>
  );
}

function Casilla({
  label, marcada, onToggle, error,
}: {
  label: string;
  marcada: boolean;
  onToggle: () => void;
  error?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={marcada}
        onClick={onToggle}
        className={`flex min-h-11 cursor-pointer items-start gap-3.5 rounded-2xl border bg-panel p-[15px] text-left ${
          error ? "border-danger/50" : "border-hairline"
        }`}
      >
        <span
          className="grid size-[22px] shrink-0 place-items-center rounded-[7px] border border-hairline-strong text-[13px] font-extrabold text-on-accent"
          style={{ background: marcada ? "var(--accent)" : "transparent" }}
        >
          {marcada ? "✓" : ""}
        </span>
        <span className="text-sm leading-[1.6] text-muted">{label}</span>
      </button>
      {error && (
        <span role="alert" className="text-[11px] text-danger-text">
          {error}
        </span>
      )}
    </div>
  );
}

export function ExpedienteForm({
  token,
  esMenor,
  tutorNombre,
}: {
  token: string;
  esMenor: boolean;
  tutorNombre: string | null;
}) {
  const [v, setV] = useState<ExpedientePayload>({
    ...VACIO,
    // En un menor firma el tutor, y su nombre ya se recogió al postularse.
    firmanteNombre: esMenor ? (tutorNombre ?? "") : "",
  });
  const [errores, setErrores] = useState<Errores>({});
  const [error, setError] = useState("");
  const [hecho, setHecho] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ExpedientePayload>(k: K, valor: ExpedientePayload[K]) => {
    setV((s) => ({ ...s, [k]: valor }));
    setErrores((e) => ({ ...e, [k]: "" }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await enviarExpediente(token, v);
      if (res.ok) {
        setHecho(res.data.folio);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setErrores(res.fieldErrors ?? {});
      setError(res.error);
    });
  };

  if (hecho) {
    return (
      <div className="rounded-[26px] border border-hairline bg-panel p-[clamp(30px,5vw,52px)] text-center shadow-deep">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-gradient-accent text-2xl font-extrabold text-on-accent">
          ✓
        </div>
        <h2 className="m-0 mb-2.5 font-display text-[28px] uppercase">Expediente enviado</h2>
        <p className="m-0 leading-[1.7] text-muted">
          Queda asociado a la postulación {hecho}. Te contactamos con la fecha y la sede.
        </p>
      </div>
    );
  }

  const rejilla = "grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-9">
      {/* ── Medibles ── */}
      <section>
        <h2 className="m-0 mb-2 font-display text-xl uppercase">Medibles</h2>
        <p className="m-0 mb-5 max-w-[62ch] text-sm leading-[1.7] text-muted">
          Todo es opcional. Si tienes los números, dinos también cómo se midieron: un
          cronómetro manual y unas fotocélulas se diferencian en más de lo que separa a un
          jugador rápido de uno normal, y sin ese dato no podemos comparar entre candidatos.
        </p>
        <div className={rejilla}>
          <Campo label="Sprint 10 m (s)" name="sprint10" errores={errores} hint="Ej. 1.85">
            <input
              value={v.sprint10}
              onChange={(e) => set("sprint10", e.target.value)}
              inputMode="decimal"
              className="field !bg-bg"
            />
          </Campo>
          <Campo label="Sprint 30 m (s)" name="sprint30" errores={errores} hint="Ej. 4.10">
            <input
              value={v.sprint30}
              onChange={(e) => set("sprint30", e.target.value)}
              inputMode="decimal"
              className="field !bg-bg"
            />
          </Campo>
          <Campo label="Salto CMJ (cm)" name="saltoCmj" errores={errores} hint="Ej. 52">
            <input
              value={v.saltoCmj}
              onChange={(e) => set("saltoCmj", e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className="field !bg-bg"
            />
          </Campo>
          <Campo label="Test de agilidad" name="agilidadTest" errores={errores}>
            <select
              value={v.agilidadTest}
              onChange={(e) => set("agilidadTest", e.target.value)}
              className="field !bg-bg appearance-none"
            >
              <option value="">—</option>
              {TESTS_AGILIDAD.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Agilidad (s)" name="agilidadSeg" errores={errores}>
            <input
              value={v.agilidadSeg}
              onChange={(e) => set("agilidadSeg", e.target.value)}
              inputMode="decimal"
              className="field !bg-bg"
            />
          </Campo>
          <Campo label="Resistencia" name="yoyo" errores={errores} hint="Ej. Yo-Yo 19.5">
            <input
              value={v.yoyo}
              onChange={(e) => set("yoyo", e.target.value)}
              className="field !bg-bg"
            />
          </Campo>
          <Campo label="Cómo se midió" name="protocolo" errores={errores}>
            <select
              value={v.protocolo}
              onChange={(e) => set("protocolo", e.target.value)}
              className="field !bg-bg appearance-none"
            >
              <option value="">—</option>
              {PROTOCOLOS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Fecha de la medición" name="medidoEn" errores={errores}>
            <input
              type="date"
              value={v.medidoEn}
              onChange={(e) => set("medidoEn", e.target.value)}
              className="field !bg-bg"
            />
          </Campo>
        </div>
      </section>

      {/* ── Contacto de emergencia ── */}
      <section>
        <h2 className="m-0 mb-2 font-display text-xl uppercase">Contacto de emergencia</h2>
        <p className="m-0 mb-5 max-w-[62ch] text-sm leading-[1.7] text-muted">
          A quién llamamos si pasa algo durante una concentración o una visoría.
        </p>
        <div className={rejilla}>
          <Campo label="Nombre completo" name="contactoNombre" errores={errores}>
            <input
              value={v.contactoNombre}
              onChange={(e) => set("contactoNombre", e.target.value)}
              className="field !bg-bg"
            />
          </Campo>
          <Campo label="Parentesco" name="contactoParentesco" errores={errores}>
            <select
              value={v.contactoParentesco}
              onChange={(e) => set("contactoParentesco", e.target.value)}
              className="field !bg-bg appearance-none"
            >
              <option value="">Elige uno</option>
              {PARENTESCOS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Teléfono" name="contactoTel" errores={errores}>
            <input
              type="tel"
              value={v.contactoTel}
              onChange={(e) => set("contactoTel", e.target.value)}
              placeholder="+52 55 0000 0000"
              className="field !bg-bg"
            />
          </Campo>
        </div>
      </section>

      {/* ── Salud ── */}
      <section>
        <h2 className="m-0 mb-2 font-display text-xl uppercase">Salud</h2>
        <p className="m-0 mb-5 max-w-[62ch] text-sm leading-[1.7] text-muted">
          Sólo lo que necesitamos para cuidarte en una actividad presencial. Son datos
          sensibles: si no marcas el consentimiento de abajo, no se guarda nada de esta
          sección aunque lo escribas.
        </p>
        <div className="grid gap-5">
          <Campo label="Alergias" name="alergias" errores={errores} ancho>
            <textarea
              rows={2}
              value={v.alergias}
              onChange={(e) => set("alergias", e.target.value.slice(0, 500))}
              placeholder="Alimentos, medicamentos, picaduras…"
              className="field !bg-bg resize-y leading-[1.6]"
            />
          </Campo>
          <Campo label="Condiciones médicas relevantes" name="condiciones" errores={errores} ancho>
            <textarea
              rows={2}
              value={v.condiciones}
              onChange={(e) => set("condiciones", e.target.value.slice(0, 500))}
              placeholder="Asma, diabetes, tratamiento en curso…"
              className="field !bg-bg resize-y leading-[1.6]"
            />
          </Campo>
          <Campo label="Lesiones de los últimos 12 meses" name="lesiones" errores={errores} ancho>
            <textarea
              rows={2}
              value={v.lesiones}
              onChange={(e) => set("lesiones", e.target.value.slice(0, 500))}
              className="field !bg-bg resize-y leading-[1.6]"
            />
          </Campo>
          <Campo label="Servicio de salud" name="seguro" errores={errores}>
            <select
              value={v.seguro}
              onChange={(e) => set("seguro", e.target.value)}
              className="field !bg-bg appearance-none"
            >
              <option value="">—</option>
              {SEGUROS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </section>

      {/* ── Consentimientos ── */}
      <section className="grid gap-2.5">
        <h2 className="m-0 mb-2 font-display text-xl uppercase">Autorizaciones</h2>

        <Casilla
          label="Autorizo el tratamiento de los datos de salud de esta sección, con la finalidad de atender una emergencia durante las actividades del programa."
          marcada={v.okSalud}
          onToggle={() => set("okSalud", !v.okSalud)}
          error={errores.okSalud}
        />
        <Casilla
          label="Autorizo el uso de imagen y video."
          marcada={v.okImagen}
          onToggle={() => set("okImagen", !v.okImagen)}
        />
        {v.okImagen && (
          <Campo
            label="Hasta dónde"
            name="imagenAlcance"
            errores={errores}
            hint="Puedes autorizar la evaluación interna sin autorizar la difusión."
          >
            <select
              value={v.imagenAlcance}
              onChange={(e) => set("imagenAlcance", e.target.value)}
              className="field !bg-bg appearance-none"
            >
              <option value="">Elige el alcance</option>
              {ALCANCES_IMAGEN.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Campo>
        )}

        <div className="mt-2">
          <Campo
            label={esMenor ? "Nombre del padre, madre o tutor que autoriza" : "Tu nombre completo"}
            name="firmanteNombre"
            errores={errores}
            hint={
              esMenor
                ? "Eres menor de edad: quien autoriza es tu tutor, no tú."
                : undefined
            }
          >
            <input
              value={v.firmanteNombre}
              onChange={(e) => set("firmanteNombre", e.target.value)}
              className="field !bg-bg"
            />
          </Campo>
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="m-0 rounded-[14px] border border-danger/50 bg-danger/10 px-4 py-3.5 text-sm text-danger-text"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? "Enviando" : "Enviar expediente"}
      </button>
    </form>
  );
}
