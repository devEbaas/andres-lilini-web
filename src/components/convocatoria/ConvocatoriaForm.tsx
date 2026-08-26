"use client";

import { motion } from "motion/react";
import { useRef, useState, useTransition } from "react";

import { submitConvocatoria } from "@/lib/actions/convocatoria";
import { CONVOCATORIA_CHECKS, UPLOAD_ACCEPT, UPLOAD_MAX_BYTES } from "@/lib/content/fundacion";
import { bytesToMb } from "@/lib/format";
import { checkBox, checkRow } from "@/components/ui/styles";

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
      setError("Formato no admitido. Use PDF, JPG, PNG o MP4.");
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.7, 0.25, 1] }}
        className="border border-rule bg-surface p-[clamp(32px,5vw,54px)] text-center"
      >
        <div className="eyebrow mb-4">Acuse de recibo</div>
        <h2 className="m-0 mb-3 font-display text-[clamp(24px,3.2vw,38px)] font-normal">
          Participación registrada
        </h2>
        <p className="m-0 mx-auto mb-6 max-w-[46ch] leading-[1.8] text-ink-soft">
          El jurado publica la lista corta el 15 de diciembre de 2026. Se notifica por correo
          electrónico el resultado en todos los casos.
        </p>
        <div className="inline-block border border-rule px-5 py-3.5 font-mono text-[13px] tracking-[0.1em]">
          FOLIO CV-2026-{folio}
        </div>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="border border-rule bg-surface p-[clamp(24px,3.5vw,42px)]"
    >
      <h2 className="m-0 mb-[26px] border-b border-rule pb-[18px] font-display text-[clamp(22px,3vw,34px)] font-normal">
        Ficha de participación
      </h2>

      <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <label className="flex flex-col gap-2">
          <span className="label-caps">Nombre completo</span>
          <input name="nombre" placeholder="Nombre y apellidos" className="field" required />
        </label>
        <label className="flex flex-col gap-2">
          <span className="label-caps">Correo electrónico</span>
          <input
            name="email"
            type="email"
            placeholder="tucorreo@dominio.com"
            className="field"
            required
          />
        </label>
        <label className="col-span-full flex flex-col gap-2">
          <span className="label-caps">Enlace de apoyo (opcional)</span>
          <input
            name="link"
            placeholder="Video, portafolio o perfil de scouting"
            className="field"
          />
        </label>
        <label className="col-span-full flex flex-col gap-2">
          <span className="label-caps">Exposición del caso</span>
          <textarea
            name="propuesta"
            rows={4}
            maxLength={600}
            placeholder="Máximo 600 caracteres"
            className="field resize-y leading-[1.7]"
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
        className="mt-[22px] cursor-pointer border border-dashed p-[clamp(26px,4vw,40px)] text-center transition-[border-color,background] duration-250"
        style={{
          borderColor: dragging ? "var(--accent)" : "var(--ink-faint)",
          background: dragging ? "var(--surface-2)" : "var(--paper)",
        }}
      >
        {!file ? (
          <div>
            <div className="mb-2.5 font-display text-[clamp(19px,2.4vw,26px)] font-medium">
              Adjuntar expediente
            </div>
            <p className="m-0 text-sm text-ink-soft">
              Arrastre el archivo o haga clic para elegirlo · PDF, JPG, PNG, MP4 · hasta 25 MB
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-left">
            <span className="size-[54px] shrink-0 border border-rule bg-surface-2" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{file.name}</div>
              <div className="my-1 mb-2 font-mono text-[11px] text-ink-faint">
                {bytesToMb(file.size)}
              </div>
              <div className="h-0.5 bg-rule-soft">
                <div className="h-full w-full bg-accent" />
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
              className="size-9 shrink-0 cursor-pointer border border-rule bg-transparent"
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
            className={`${checkRow} border-rule`}
          >
            <span
              className={checkBox}
              style={{ background: checks[c.k] ? "var(--accent)" : "transparent" }}
            >
              {checks[c.k] ? "✓" : ""}
            </span>
            <span className="text-sm leading-[1.7] text-ink-soft">{c.label}</span>
            {checks[c.k] && <input type="hidden" name={c.k} value="on" />}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 border border-danger/40 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 min-h-[50px] w-full cursor-pointer border-0 bg-ink text-[11px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-250 hover:bg-accent disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar participación"}
      </button>
    </form>
  );
}
