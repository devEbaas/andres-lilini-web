"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";

import { NAV } from "@/lib/content/site";
import { useCart } from "@/lib/store/cart";
import { useToast } from "@/lib/store/toast";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, open } = useCart();
  const { flash } = useToast();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  const isActive = (href: string) => href === pathname;

  return (
    <>
      <header
        data-scrolled={scrolled}
        className="fixed inset-x-0 top-0.5 z-100 border-b backdrop-blur-[18px] transition-[background-color,border-color,padding] duration-[350ms] data-[scrolled=false]:border-transparent data-[scrolled=false]:bg-transparent data-[scrolled=false]:py-4 data-[scrolled=true]:border-hairline data-[scrolled=true]:bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] data-[scrolled=true]:py-2.5"
      >
        <div className="shell flex items-center gap-7">
          <Link href="/" className="flex shrink-0 items-center gap-3 text-ink hover:text-ink">
            <span className="grid size-[34px] place-items-center rounded-[10px] bg-gradient-accent font-display text-[19px] tracking-[-0.02em] text-on-accent">
              AL
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[16px] uppercase tracking-[0.06em]">Lillini</span>
              <span className="mt-[3px] font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
                Formación
              </span>
            </span>
          </Link>

          <nav className="ml-auto hidden gap-1 nav:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-full px-[13px] py-[11px] text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-[250ms] hover:bg-panel-2 hover:text-ink ${
                  isActive(item.href) ? "bg-panel-2 text-ink" : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5 nav:ml-0">
            <div className="flex overflow-hidden rounded-full border border-hairline">
              <button
                type="button"
                aria-pressed="true"
                className="cursor-pointer border-0 bg-panel-2 px-[11px] py-2 text-[10px] font-extrabold tracking-[0.14em]"
              >
                ES
              </button>
              <button
                type="button"
                aria-pressed="false"
                onClick={() => flash("La versión en inglés llega en la próxima entrega.")}
                className="cursor-pointer border-0 bg-transparent px-[11px] py-2 text-[10px] font-extrabold tracking-[0.14em] text-muted hover:text-ink"
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={open}
              aria-label={count ? `Carrito, ${count} artículos` : "Carrito"}
              className="relative grid size-11 min-w-11 cursor-pointer place-items-center rounded-full border border-hairline bg-panel transition-colors duration-[250ms] hover:border-accent"
            >
              <span className="text-[11px] font-extrabold tracking-[0.1em]">BAG</span>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 24 }}
                  className="absolute -right-1 -top-1 grid h-[19px] min-w-[19px] place-items-center rounded-full bg-gradient-accent px-[5px] text-[10px] font-extrabold text-on-accent"
                >
                  {count}
                </motion.span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Menú"
              aria-expanded={menuOpen}
              className="flex size-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-full border border-hairline bg-panel nav:hidden"
            >
              <span className="block h-[1.5px] w-4 bg-ink" />
              <span className="block h-[1.5px] w-4 bg-ink" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
