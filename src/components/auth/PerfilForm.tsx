"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { actualizarPerfil } from "@/lib/actions/cuenta";
import { Spinner } from "@/components/ui/Spinner";

export function PerfilForm({
  inicial,
}: {
  inicial: { nombre: string; apellido: string; telefono: string };
}) {
  const t = useTranslations("account");
  const [nombre, setNombre] = useState(inicial.nombre);
  const [apellido, setApellido] = useState(inicial.apellido);
  const [telefono, setTelefono] = useState(inicial.telefono);
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGuardado(false);
    startTransition(async () => {
      const res = await actualizarPerfil({ nombre, apellido, telefono });
      if (res.ok) setGuardado(true);
      else setError(res.error);
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-[460px] gap-[18px]">
      <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
        <label className="flex flex-col gap-[9px]">
          <span className="label-caps">{t("nombre")}</span>
          <input
            value={nombre}
            autoComplete="given-name"
            onChange={(e) => setNombre(e.target.value)}
            className="field !bg-bg"
          />
        </label>
        <label className="flex flex-col gap-[9px]">
          <span className="label-caps">{t("apellido")}</span>
          <input
            value={apellido}
            autoComplete="family-name"
            onChange={(e) => setApellido(e.target.value)}
            className="field !bg-bg"
          />
        </label>
      </div>

      <label className="flex flex-col gap-[9px]">
        <span className="label-caps">{t("telefono")}</span>
        <input
          value={telefono}
          autoComplete="tel"
          onChange={(e) => setTelefono(e.target.value)}
          placeholder={t("telefonoPh")}
          className="field !bg-bg"
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
      {guardado && <p className="m-0 text-sm text-accent">{t("guardado")}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-gradient-accent text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
      >
        {pending && <Spinner />}
        {pending ? t("guardando") : t("guardar")}
      </button>
    </form>
  );
}
