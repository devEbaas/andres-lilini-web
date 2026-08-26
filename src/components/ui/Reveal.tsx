"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

const TAGS = {
  div: motion.div,
  section: motion.section,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  li: motion.li,
  figure: motion.figure,
  span: motion.span,
} as const;

export type RevealTag = keyof typeof TAGS;

type RevealProps = {
  /** Posición dentro del grupo; escalona la entrada hasta 6 elementos. */
  index?: number;
  as?: RevealTag;
  id?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const EASE = [0.22, 0.7, 0.25, 1] as const;

/** Entrada sobria del canvas formal: 10px de desplazamiento y nada de desenfoque. */
export function Reveal({ index = 0, as = "div", children, ...rest }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    const Plain = as;
    return <Plain {...rest}>{children}</Plain>;
  }

  const Tag = TAGS[as] as typeof motion.div;

  return (
    <Tag
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px 0px -8% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay: Math.min(index, 6) * 0.06 }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
