"use client";

import { motion } from "motion/react";
import { useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";

import { submitConvocatoria } from "@/lib/actions/convocatoria";
import {
  CATEGORIAS,
  CONVOCATORIA_CHECKS,
  EDAD_MAX,
  EDAD_MIN,
  ESTADOS_MX,
  PAISES,
  PARENTESCOS,
  PIES,
  POSICIONES,
  UPLOAD_ACCEPT,
  UPLOAD_MAX_BYTES,
} from "@/lib/content/fundacion";
import { bytesToMb } from "@/lib/format";
import { esMenorHoy } from "@/lib/edad";

type Errores = Record<string, string>;

/** Etiqueta, control y su error. Con doce campos, repetirlo no compensa. */
function Campo({
  label,
  name,
  errores,
  ancho,
  hint,
  children,
}: {
  label: string;
  name: string;
  errores: Errores;
  ancho?: boolean;
  hint?: string;
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
  nombre,
  label,
  marcada,
  onToggle,
  error,
}: {
  nombre: string;
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
        {marcada && <input type="hidden" name={nombre} value="on" />}
      </button>
      {error && (
        <span role="alert" className="text-[11px] text-danger-text">
          {error}
        </span>
      )}
    </div>
  );
}

export function ConvocatoriaForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const t = useTranslations("convocatoria.form");
  const locale = useLocale();
  const tv = useTranslations("vocab");
  const tc = useTranslations("convocatoria.checks");
  const [pais, setPais] = useState("México");
  const [nacimiento, setNacimiento] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [errores, setErrores] = useState<Errores>({});
  const [error, setError] = useState("");
  const [folio, setFolio] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const marcar = (k: string) => {
    setChecks((s) => ({ ...s, [k]: !s[k] }));
    setErrores((e) => ({ ...e, [k]: "" }));
  };

  const takeFile = (f: File | null | undefined) => {
    if (!f) return;
    if (f.size > UPLOAD_MAX_BYTES) {
      setError(t("archivoGrande"));
      return;
    }
    if (!UPLOAD_ACCEPT.includes(f.type)) {
      setError(t("formatoMal"));
      return;
    }
    setError("");
    setFile(f);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Va en el FormData, no en un campo oculto: no es un dato del formulario,
    // es el idioma con el que se está usando.
    fd.set("locale", locale);
    if (file) fd.set("file", file);
    else fd.delete("file");
    setError("");
    setErrores({});
    startTransition(async () => {
      const res = await submitConvocatoria(fd);
      if (res.ok) {
        setFolio(res.data.folio);
        window.scrollTo({ top: 200, behavior: "smooth" });
        return;
      }
      setErrores(res.fieldErrors ?? {});
      setError(res.error);
    });
  };

  if (folio) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
        className="rounded-[26px] border border-hairline bg-panel p-[clamp(34px,5vw,56px)] text-center shadow-deep"
      >
        <div className="mx-auto mb-[22px] grid size-[60px] place-items-center rounded-full bg-gradient-accent text-[26px] font-extrabold text-on-accent">
          ✓
        </div>
        <h2 className="m-0 mb-3 font-display text-[clamp(26px,4vw,44px)] uppercase">
          {t("registradaTitulo")}
        </h2>
        <p className="mx-auto m-0 mb-[22px] max-w-[44ch] leading-[1.7] text-muted">
          {t("registradaTexto")}
        </p>
        <div className="inline-block rounded-[14px] border border-dashed border-hairline-strong p-[15px] font-mono text-[13px] tracking-[0.14em]">
          {t("folio", { folio })}
        </div>
      </motion.div>
    );
  }

  // Se mide con la fecha de hoy, no con la del cierre: es cuando se otorga
  // el consentimiento. A un mayor de edad no se le piden datos de tutor.
  const esMenor = Boolean(nacimiento) && esMenorHoy(nacimiento);

  const rejilla = "grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-[26px] border border-hairline bg-white/[0.03] p-[clamp(24px,3.5vw,44px)] shadow-deep backdrop-blur-[14px]"
    >
      <h2 className="m-0 mb-[26px] font-display text-[clamp(24px,3.4vw,40px)] uppercase">
        {t("titulo")}
      </h2>

      {/* ── Identidad ── */}
      <div className={rejilla}>
        <Campo label={t("nombre")} name="nombre" errores={errores}>
          <input name="nombre" placeholder={t("nombrePh")} className="field" />
        </Campo>
        <Campo label={t("correo")} name="email" errores={errores}>
          <input name="email" type="email" placeholder={t("correoPh")} className="field" />
        </Campo>
        <Campo
          label={t("nacimiento")}
          name="nacimiento"
          errores={errores}
          hint={t("nacimientoHint", { min: EDAD_MIN, max: EDAD_MAX })}
        >
          <input
            name="nacimiento"
            type="date"
            value={nacimiento}
            onChange={(e) => setNacimiento(e.target.value)}
            className="field"
          />
        </Campo>
      </div>

      {/* ── Residencia ── */}
      <div className={`mt-5 ${rejilla}`}>
        <Campo label={t("pais")} name="pais" errores={errores}>
          <select
            name="pais"
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            className="field appearance-none"
          >
            {PAISES.map((p) => (
              <option key={p} value={p}>
                {tv(p)}
              </option>
            ))}
          </select>
        </Campo>
        {pais === "México" && (
          <Campo label={t("estado")} name="estado" errores={errores}>
            <select name="estado" defaultValue="" className="field appearance-none">
              <option value="" disabled>
                {t("eligeEstado")}
              </option>
              {ESTADOS_MX.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </Campo>
        )}
      </div>

      {/* ── Perfil deportivo ── */}
      <h3 className="mb-4 mt-8 font-display text-lg uppercase">{t("perfilTitulo")}</h3>
      <div className={rejilla}>
        <Campo label={t("categoria")} name="categoria" errores={errores}>
          <select name="categoria" defaultValue="" className="field appearance-none">
            <option value="" disabled>
              {t("eligeUna")}
            </option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {tv(c)}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label={t("posicion")} name="posicion" errores={errores}>
          <select name="posicion" defaultValue="" className="field appearance-none">
            <option value="" disabled>
              {t("eligeUna")}
            </option>
            {POSICIONES.map((p) => (
              <option key={p} value={p}>
                {tv(p)}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label={t("pie")} name="pie" errores={errores}>
          <select name="pie" defaultValue="" className="field appearance-none">
            <option value="" disabled>
              {t("eligeUno")}
            </option>
            {PIES.map((p) => (
              <option key={p} value={p}>
                {tv(p)}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label={t("club")} name="club" errores={errores}>
          <input name="club" placeholder={t("clubPh")} className="field" />
        </Campo>
        <Campo label={t("liga")} name="liga" errores={errores}>
          <input name="liga" placeholder={t("ligaPh")} className="field" />
        </Campo>
      </div>

      {/* ── Tutor, sólo si es menor ── */}
      {esMenor && (
        <>
          <h3 className="mb-3 mt-8 font-display text-lg uppercase">{t("tutorTitulo")}</h3>
          <p className="mb-4 max-w-[62ch] text-sm leading-[1.7] text-muted">
            {t("tutorAviso")}
          </p>
          <div className={rejilla}>
            <Campo label={t("nombre")} name="tutorNombre" errores={errores}>
              <input name="tutorNombre" placeholder={t("nombrePh")} className="field" />
            </Campo>
            <Campo label={t("tutorParentesco")} name="tutorParentesco" errores={errores}>
              <select name="tutorParentesco" defaultValue="" className="field appearance-none">
                <option value="" disabled>
                  {t("eligeUno")}
                </option>
                {PARENTESCOS.map((p) => (
                  <option key={p} value={p}>
                    {tv(p)}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label={t("tutorTel")} name="tutorTel" errores={errores}>
              <input name="tutorTel" type="tel" placeholder={t("tutorTelPh")} className="field" />
            </Campo>
            <Campo label={t("tutorEmail")} name="tutorEmail" errores={errores}>
              <input name="tutorEmail" type="email" placeholder={t("tutorEmailPh")} className="field" />
            </Campo>
          </div>
        </>
      )}

      {/* ── Propuesta ── */}
      <h3 className="mb-4 mt-8 font-display text-lg uppercase">{t("historiaTitulo")}</h3>
      <div className={rejilla}>
        <Campo label={t("link")} name="link" errores={errores} ancho>
          <input name="link" placeholder={t("linkPh")} className="field" />
        </Campo>
        <Campo
          label={t("propuesta")}
          name="propuesta"
          errores={errores}
          ancho
        >
          <textarea
            name="propuesta"
            rows={4}
            maxLength={600}
            placeholder={t("propuestaPh")}
            className="field resize-y leading-[1.6]"
          />
        </Campo>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.jpg,.jpeg,.png,.mp4"
        onChange={(e) => takeFile(e.target.files?.[0])}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          takeFile(e.dataTransfer.files?.[0]);
        }}
        className="mt-[22px] cursor-pointer rounded-[20px] border-[1.5px] border-dashed p-[clamp(28px,4vw,44px)] text-center transition-all duration-300"
        style={{
          borderColor: dragging ? "var(--accent)" : "var(--border-strong)",
          background: dragging ? "color-mix(in oklab, var(--accent) 8%, transparent)" : "var(--panel)",
        }}
      >
        {!file ? (
          <div>
            <div className="mb-2.5 font-display text-[clamp(20px,2.6vw,30px)] uppercase">
              {t("arrastra")}
            </div>
            <p className="m-0 text-sm text-muted">{t("arrastraHint")}</p>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-left">
            <span className="photo-slot size-[60px] shrink-0 rounded-[14px] border border-hairline" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">{file.name}</div>
              <div className="my-1 mb-2 font-mono text-[11px] text-muted">
                {bytesToMb(file.size)}
              </div>
              <div className="h-1 rounded-full bg-hairline">
                <div className="h-full w-full rounded-full bg-gradient-accent" />
              </div>
            </div>
            <button
              type="button"
              aria-label={t("quitarArchivo")}
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="size-9 shrink-0 cursor-pointer rounded-full border border-hairline bg-transparent"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* ── Declaración y consentimientos ── */}
      <div className="mt-[22px] grid gap-2.5">
        <Casilla
          nombre="contrato"
          label={t("contrato")}
          marcada={Boolean(checks.contrato)}
          onToggle={() => marcar("contrato")}
          error={errores.contrato}
        />
        {esMenor && (
          <Casilla
            nombre="tutor"
            label={t("tutorConsent")}
            marcada={Boolean(checks.tutor)}
            onToggle={() => marcar("tutor")}
            error={errores.tutor}
          />
        )}
        {CONVOCATORIA_CHECKS.map((c) => (
          <Casilla
            key={c.k}
            nombre={c.k}
            label={tc(c.k)}
            marcada={Boolean(checks[c.k])}
            onToggle={() => marcar(c.k)}
            error={errores[c.k]}
          />
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-[14px] border border-danger/50 bg-danger/10 px-4 py-3.5 text-sm text-danger-text"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 min-h-[52px] w-full cursor-pointer rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
      >
        {pending ? t("enviando") : t("enviar")}
      </button>
    </form>
  );
}
