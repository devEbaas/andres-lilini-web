"use client";

import { useState, useTransition } from "react";

import { buscarPorCorreo, purgarPorCorreo, type Rastro } from "@/lib/actions/arco-datos";
import { Spinner } from "@/components/ui/Spinner";
import { btnQuiet } from "@/components/ui/styles";
import type { ErrorRef } from "@/lib/actions/types";
import { useErrores } from "@/lib/errores";

/**
 * La herramienta que hace ejecutables las solicitudes: cuatro de las cinco
 * tablas se llenaron desde formularios públicos y no saben de qué cuenta son,
 * así que el correo es la única forma de encontrarlas.
 */
export function BuscarPorCorreo() {
  const err = useErrores();
  const [email, setEmail] = useState("");
  const [rastro, setRastro] = useState<Rastro | null>(null);
  const [confirmacion, setConfirmacion] = useState("");
  const [purgando, setPurgando] = useState(false);
  const [resumen, setResumen] = useState("");
  const [error, setError] = useState<ErrorRef | null>(null);
  const [pending, startTransition] = useTransition();

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResumen("");
    setRastro(null);
    setPurgando(false);
    startTransition(async () => {
      const res = await buscarPorCorreo(email);
      if (res.ok) setRastro(res.data);
      else setError(res.code);
    });
  };

  const purgar = () => {
    setError(null);
    startTransition(async () => {
      const res = await purgarPorCorreo({ email, confirmacion });
      if (!res.ok) {
        setError(res.code);
        return;
      }
      setResumen(res.data.resumen);
      setRastro(null);
      setPurgando(false);
      setConfirmacion("");
    });
  };

  const filas = rastro
    ? [
        { k: "Postulaciones", n: rastro.postulaciones.length },
        { k: "Convocatoria", n: rastro.convocatoria.length },
        { k: "Mensajes", n: rastro.mensajes.length },
        { k: "Boletín", n: rastro.boletin.length },
        { k: "Pedidos", n: rastro.pedidos.length },
      ]
    : [];

  const total = filas.reduce((a, f) => a + f.n, 0);

  return (
    <div className="grid gap-5 rounded-[22px] border border-hairline bg-panel p-[clamp(20px,3vw,30px)]">
      <div>
        <h3 className="m-0 mb-1.5 font-display text-xl uppercase">Buscar por correo</h3>
        <p className="m-0 text-sm leading-[1.6] text-muted">
          Todo lo que hay de una persona, en las cinco tablas a la vez.
        </p>
      </div>

      <form onSubmit={buscar} className="flex flex-wrap gap-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@dominio.com"
          className="field !bg-bg min-w-[220px] flex-1"
        />
        <button
          type="submit"
          disabled={pending || !email}
          className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent px-7 text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
        >
          {pending && <Spinner />}
          Buscar
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="rounded-[14px] border border-danger/50 bg-danger/10 px-4 py-3.5 text-sm text-danger-text"
        >
          {err(error)}
        </div>
      )}

      {resumen && (
        <div className="rounded-[14px] border border-accent/40 bg-panel-2 px-4 py-3.5 text-sm leading-[1.6] text-muted">
          {resumen}
        </div>
      )}

      {rastro && (
        <>
          <div className="grid gap-px overflow-hidden rounded-[14px] border border-hairline bg-hairline">
            {filas.map((f) => (
              <div key={f.k} className="flex items-center justify-between bg-panel px-4 py-3">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
                  {f.k}
                </span>
                <span className={`font-mono text-sm ${f.n ? "text-ink" : "text-muted"}`}>
                  {f.n}
                </span>
              </div>
            ))}
          </div>

          {total === 0 ? (
            <p className="m-0 text-sm text-muted">No hay nada con ese correo.</p>
          ) : !purgando ? (
            <button type="button" onClick={() => setPurgando(true)} className={btnQuiet}>
              Ejecutar cancelación
            </button>
          ) : (
            <div className="grid gap-3.5 rounded-[18px] border border-danger/40 bg-danger/5 p-5">
              <p className="m-0 text-sm leading-[1.7] text-muted">
                Se borran postulaciones, participaciones (con sus archivos), mensajes y
                boletín. Los pedidos <strong className="text-ink">no se borran</strong>: se
                les quita el correo y la dirección, y se conservan importes y fechas por
                obligación fiscal. No se puede deshacer.
              </p>
              <input
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                placeholder="Escribe el correo otra vez"
                autoComplete="off"
                className="field !bg-bg"
              />
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={purgar}
                  disabled={pending || confirmacion.trim().toLowerCase() !== email.trim().toLowerCase()}
                  className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-full border border-danger/60 bg-transparent text-[11px] font-extrabold uppercase tracking-[0.16em] text-danger-text disabled:opacity-50"
                >
                  {pending && <Spinner />}
                  Confirmar
                </button>
                <button type="button" onClick={() => setPurgando(false)} className={btnQuiet}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
