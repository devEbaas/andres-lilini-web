"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

const TAGS = {
  div: motion.div,
  section: motion.section,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  li: motion.li,
  figure: motion.figure,
  span: motion.span,
} as const;

export type RevealTag = keyof typeof TAGS;

type RevealProps = {
  /** Posición dentro del grupo; escalona la entrada hasta 8 elementos. */
  index?: number;
  as?: RevealTag;
  id?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function Reveal({ index = 0, as = "div", children, ...rest }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    const Plain = as;
    return <Plain {...rest}>{children}</Plain>;
  }

  const Tag = TAGS[as] as typeof motion.div;

  return (
    <Tag
      initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px 0px -10% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay: Math.min(index, 8) * 0.075 }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
