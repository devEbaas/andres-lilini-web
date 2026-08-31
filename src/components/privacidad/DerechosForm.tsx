"use client";

import { useState, useTransition } from "react";

import { crearSolicitudArco } from "@/lib/actions/privacidad";
import { Spinner } from "@/components/ui/Spinner";

const DERECHOS = [
  { v: "acceso", label: "Acceso", ayuda: "Saber qué datos tuyos tenemos." },
  { v: "rectificacion", label: "Rectificación", ayuda: "Corregir un dato incorrecto." },
  { v: "cancelacion", label: "Cancelación", ayuda: "Que borremos tus datos." },
  { v: "oposicion", label: "Oposición", ayuda: "Que dejemos de usarlos para algo." },
];

export function DerechosForm() {
  const [tipo, setTipo] = useState("acceso");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [detalle, setDetalle] = useState("");
  const [error, setError] = useState("");
  const [hecho, setHecho] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await crearSolicitudArco({ tipo, nombre, email, detalle });
      if (res.ok) setHecho(res.data.mensaje);
      else setError(res.error);
    });
  };

  if (hecho) {
    return (
      <div className="py-4 text-center">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-gradient-accent text-2xl font-extrabold text-on-accent">
          ✓
        </div>
        <h3 className="m-0 mb-2.5 font-display text-[26px] uppercase">Solicitud recibida</h3>
        <p className="m-0 leading-[1.7] text-muted">{hecho}</p>
      </div>
    );
  }

  const actual = DERECHOS.find((d) => d.v === tipo);

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-[18px]">
      <div className="grid gap-[9px]">
        <span className="label-caps">Qué quieres ejercer</span>
        <div className="flex flex-wrap gap-2">
          {DERECHOS.map((d) => (
            <button
              key={d.v}
              type="button"
              onClick={() => setTipo(d.v)}
              aria-pressed={tipo === d.v}
              className={`min-h-11 cursor-pointer rounded-full border px-[18px] text-[11px] font-extrabold uppercase tracking-[0.12em] transition ${
                tipo === d.v
                  ? "border-accent bg-panel-2 text-ink"
                  : "border-hairline bg-transparent text-muted hover:text-ink"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        {actual && <span className="text-xs leading-[1.7] text-muted">{actual.ayuda}</span>}
      </div>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">Nombre completo</span>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="field !bg-bg"
        />
      </label>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">Correo con el que nos escribiste</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@dominio.com"
          className="field !bg-bg"
        />
        <span className="font-mono text-[10px] leading-[1.7] text-muted">
          Es la única forma de encontrar tus datos si nunca tuviste cuenta.
        </span>
      </label>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">Detalle</span>
        <textarea
          rows={4}
          value={detalle}
          onChange={(e) => setDetalle(e.target.value.slice(0, 2000))}
          placeholder="Qué dato concreto y, si aplica, cómo debería quedar."
          className="field !bg-bg resize-y leading-[1.6]"
        />
      </label>

      {error && (
        <div
          role="alert"
          className="rounded-[14px] border border-danger/50 bg-danger/10 px-4 py-3.5 text-sm text-danger-text"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? "Enviando" : "Enviar solicitud"}
      </button>
    </form>
  );
}
