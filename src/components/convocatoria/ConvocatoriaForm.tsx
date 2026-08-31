"use client";

import { motion } from "motion/react";
import { useRef, useState, useTransition } from "react";

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
      setError("El archivo supera los 25 MB permitidos.");
      return;
    }
    if (!UPLOAD_ACCEPT.includes(f.type)) {
      setError("Formato no admitido. Usa PDF, JPG, PNG o MP4.");
      return;
    }
    setError("");
    setFile(f);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
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
          Participación registrada
        </h2>
        <p className="mx-auto m-0 mb-[22px] max-w-[44ch] leading-[1.7] text-muted">
          El jurado publica la lista corta el 15 de diciembre. Te avisamos por correo pase lo que
          pase.
        </p>
        <div className="inline-block rounded-[14px] border border-dashed border-hairline-strong p-[15px] font-mono text-[13px] tracking-[0.14em]">
          FOLIO · CV-2026-{folio}
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
        Tu participación
      </h2>

      {/* ── Identidad ── */}
      <div className={rejilla}>
        <Campo label="Nombre completo" name="nombre" errores={errores}>
          <input name="nombre" placeholder="Nombre y apellidos" className="field" />
        </Campo>
        <Campo label="Correo" name="email" errores={errores}>
          <input name="email" type="email" placeholder="tucorreo@dominio.com" className="field" />
        </Campo>
        <Campo
          label="Fecha de nacimiento"
          name="nacimiento"
          errores={errores}
          hint={`De ${EDAD_MIN} a ${EDAD_MAX} años al cierre de la convocatoria.`}
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
        <Campo label="País de residencia" name="pais" errores={errores}>
          <select
            name="pais"
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            className="field appearance-none"
          >
            {PAISES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Campo>
        {pais === "México" && (
          <Campo label="Estado" name="estado" errores={errores}>
            <select name="estado" defaultValue="" className="field appearance-none">
              <option value="" disabled>
                Elige tu estado
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
      <h3 className="mb-4 mt-8 font-display text-lg uppercase">Perfil deportivo</h3>
      <div className={rejilla}>
        <Campo label="Categoría" name="categoria" errores={errores}>
          <select name="categoria" defaultValue="" className="field appearance-none">
            <option value="" disabled>
              Elige una
            </option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Posición principal" name="posicion" errores={errores}>
          <select name="posicion" defaultValue="" className="field appearance-none">
            <option value="" disabled>
              Elige una
            </option>
            {POSICIONES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Pie dominante" name="pie" errores={errores}>
          <select name="pie" defaultValue="" className="field appearance-none">
            <option value="" disabled>
              Elige uno
            </option>
            {PIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Equipo actual" name="club" errores={errores}>
          <input name="club" placeholder="Nombre del club o escuela" className="field" />
        </Campo>
        <Campo label="Liga (opcional)" name="liga" errores={errores}>
          <input name="liga" placeholder="Ej. Liga municipal Sub-17" className="field" />
        </Campo>
      </div>

      {/* ── Tutor, sólo si es menor ── */}
      {esMenor && (
        <>
          <h3 className="mb-3 mt-8 font-display text-lg uppercase">Tu padre, madre o tutor</h3>
          <p className="mb-4 max-w-[62ch] text-sm leading-[1.7] text-muted">
            Eres menor de edad, así que necesitamos sus datos y su autorización expresa. Sin eso
            no podemos evaluar tu participación.
          </p>
          <div className={rejilla}>
            <Campo label="Nombre completo" name="tutorNombre" errores={errores}>
              <input name="tutorNombre" placeholder="Nombre y apellidos" className="field" />
            </Campo>
            <Campo label="Parentesco" name="tutorParentesco" errores={errores}>
              <select name="tutorParentesco" defaultValue="" className="field appearance-none">
                <option value="" disabled>
                  Elige uno
                </option>
                {PARENTESCOS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Teléfono" name="tutorTel" errores={errores}>
              <input name="tutorTel" type="tel" placeholder="+52 55 0000 0000" className="field" />
            </Campo>
            <Campo label="Correo (opcional)" name="tutorEmail" errores={errores}>
              <input name="tutorEmail" type="email" placeholder="correo@dominio.com" className="field" />
            </Campo>
          </div>
        </>
      )}

      {/* ── Propuesta ── */}
      <h3 className="mb-4 mt-8 font-display text-lg uppercase">Tu historia</h3>
      <div className={rejilla}>
        <Campo label="Enlace de apoyo (opcional)" name="link" errores={errores} ancho>
          <input name="link" placeholder="Video, portafolio o redes" className="field" />
        </Campo>
        <Campo
          label="Quién eres y qué necesitas para seguir"
          name="propuesta"
          errores={errores}
          ancho
        >
          <textarea
            name="propuesta"
            rows={4}
            maxLength={600}
            placeholder="Máximo 600 caracteres"
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
              Arrastra tu archivo
            </div>
            <p className="m-0 text-sm text-muted">
              o haz clic para elegirlo · PDF, JPG, PNG, MP4 · hasta 25 MB
            </p>
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
              aria-label="Quitar archivo"
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
          label="Declaro que no tengo contrato profesional vigente."
          marcada={Boolean(checks.contrato)}
          onToggle={() => marcar("contrato")}
          error={errores.contrato}
        />
        {esMenor && (
          <Casilla
            nombre="tutor"
            label="Mi padre, madre o tutor legal conoce esta participación y autoriza expresamente el tratamiento de mis datos."
            marcada={Boolean(checks.tutor)}
            onToggle={() => marcar("tutor")}
            error={errores.tutor}
          />
        )}
        {CONVOCATORIA_CHECKS.map((c) => (
          <Casilla
            key={c.k}
            nombre={c.k}
            label={c.label}
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
        {pending ? "Enviando…" : "Enviar participación"}
      </button>
    </form>
  );
}
