"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";

import { NAV_TOP } from "@/lib/content/site";
import { useCart } from "@/lib/store/cart";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, open } = useCart();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 30));

  return (
    <>
      <header
        data-scrolled={scrolled}
        className="fixed inset-x-0 top-0 z-100 border-b backdrop-blur-[10px] transition-[background-color,border-color] duration-300 data-[scrolled=false]:border-transparent data-[scrolled=false]:bg-paper data-[scrolled=true]:border-rule data-[scrolled=true]:bg-[color-mix(in_oklab,var(--paper)_94%,transparent)]"
      >
        <div
          className="shell-nav flex items-center gap-[clamp(14px,2vw,32px)] transition-[height] duration-300 data-[scrolled=false]:h-[76px] data-[scrolled=true]:h-[62px]"
          data-scrolled={scrolled}
        >
          <Link href="/" className="flex min-w-0 shrink-0 items-baseline gap-2.5">
            <span className="whitespace-nowrap font-display text-[19px] font-medium tracking-[0.01em] sm:text-[22px]">
              Andrés Lillini
            </span>
            <span className="hidden whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.24em] text-ink-faint sm:inline">
              Formación
            </span>
          </Link>

          <nav
            aria-label="Principal"
            className="ml-auto hidden min-w-0 items-center gap-[clamp(14px,1.8vw,26px)] nav:flex"
          >
            {NAV_TOP.map((item) => {
              const active = item.href === pathname;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap border-b py-1.5 text-[11.5px] font-medium uppercase tracking-[0.1em] transition-colors duration-200 hover:border-accent hover:text-accent ${
                    active ? "border-ink text-ink" : "border-transparent text-ink-soft"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2.5 nav:ml-0">
            <button
              type="button"
              onClick={open}
              aria-label={count ? `Pedido, ${count} artículos` : "Pedido"}
              className="relative min-h-[38px] cursor-pointer border border-rule bg-transparent px-[clamp(10px,1.4vw,14px)] py-2 text-[10px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap transition-colors duration-200 hover:border-accent sm:text-[11px]"
            >
              Pedido
              {count > 0 && <span className="ml-2 font-mono text-[11px] text-accent">{count}</span>}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Menú"
              aria-expanded={menuOpen}
              className="flex h-[38px] w-11 cursor-pointer flex-col items-center justify-center gap-[5px] border border-rule bg-transparent nav:hidden"
            >
              <span className="block h-px w-[18px] bg-ink" />
              <span className="block h-px w-[18px] bg-ink" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
