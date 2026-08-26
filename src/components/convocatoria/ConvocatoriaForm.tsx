"use client";

import { motion } from "motion/react";
import { useRef, useState, useTransition } from "react";

import { submitConvocatoria } from "@/lib/actions/convocatoria";
import {
  CONVOCATORIA_CHECKS,
  UPLOAD_ACCEPT,
  UPLOAD_MAX_BYTES,
} from "@/lib/content/fundacion";
import { bytesToMb } from "@/lib/format";

export function ConvocatoriaForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [folio, setFolio] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
    startTransition(async () => {
      const res = await submitConvocatoria(fd);
      if (res.ok) {
        setFolio(res.data.folio);
        window.scrollTo({ top: 200, behavior: "smooth" });
      } else {
        setError(res.error);
      }
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

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-[26px] border border-hairline bg-white/[0.03] p-[clamp(24px,3.5vw,44px)] shadow-deep backdrop-blur-[14px]"
    >
      <h2 className="m-0 mb-[26px] font-display text-[clamp(24px,3.4vw,40px)] uppercase">
        Tu propuesta
      </h2>

      <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <label className="flex flex-col gap-[9px]">
          <span className="label-caps">Nombre completo</span>
          <input name="nombre" placeholder="Nombre y apellidos" className="field" required />
        </label>
        <label className="flex flex-col gap-[9px]">
          <span className="label-caps">Correo</span>
          <input
            name="email"
            type="email"
            placeholder="tucorreo@dominio.com"
            className="field"
            required
          />
        </label>
        <label className="col-span-full flex flex-col gap-[9px]">
          <span className="label-caps">Enlace de apoyo (opcional)</span>
          <input name="link" placeholder="Video, portafolio o redes" className="field" />
        </label>
        <label className="col-span-full flex flex-col gap-[9px]">
          <span className="label-caps">Describe tu propuesta</span>
          <textarea
            name="propuesta"
            rows={4}
            maxLength={600}
            placeholder="Máximo 600 caracteres"
            className="field resize-y leading-[1.6]"
            required
          />
        </label>
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

      <div className="mt-[22px] grid gap-2.5">
        {CONVOCATORIA_CHECKS.map((c) => (
          <button
            key={c.k}
            type="button"
            role="checkbox"
            aria-checked={Boolean(checks[c.k])}
            onClick={() => setChecks((s) => ({ ...s, [c.k]: !s[c.k] }))}
            className="flex min-h-11 cursor-pointer items-start gap-3.5 rounded-2xl border border-hairline bg-panel p-[15px] text-left"
          >
            <span
              className="grid size-[22px] shrink-0 place-items-center rounded-[7px] border border-hairline-strong text-[13px] font-extrabold text-on-accent"
              style={{ background: checks[c.k] ? "var(--accent)" : "transparent" }}
            >
              {checks[c.k] ? "✓" : ""}
            </span>
            <span className="text-sm leading-[1.6] text-muted">{c.label}</span>
            {checks[c.k] && <input type="hidden" name={c.k} value="on" />}
          </button>
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
