/**
 * Editorial motion presets.
 *
 * Exponential ease-out only. No springs, no bounce, no rotate. Translate ≤ 8px,
 * scale ≤ 1.005. All presets compose with `useReducedMotion` via `withReduced`.
 */

import { Variants, Transition } from "framer-motion";

const EASE_OUT_EDITORIAL: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1];

export const transitions = {
  quick: {
    type: "tween",
    ease: EASE_OUT_EDITORIAL,
    duration: 0.18,
  } as Transition,

  editorial: {
    type: "tween",
    ease: EASE_OUT_EDITORIAL,
    duration: 0.24,
  } as Transition,

  long: {
    type: "tween",
    ease: EASE_OUT_QUART,
    duration: 0.4,
  } as Transition,

  // Deprecated — kept as aliases so existing imports don't break mid-migration.
  // These map to the editorial ease-out; no spring, no bounce.
  smooth: {
    type: "tween",
    ease: EASE_OUT_EDITORIAL,
    duration: 0.3,
  } as Transition,
  snappy: {
    type: "tween",
    ease: EASE_OUT_EDITORIAL,
    duration: 0.18,
  } as Transition,
  bouncy: {
    type: "tween",
    ease: EASE_OUT_EDITORIAL,
    duration: 0.24,
  } as Transition,
  easeOut: {
    type: "tween",
    ease: EASE_OUT_EDITORIAL,
    duration: 0.24,
  } as Transition,
  easeInOut: {
    type: "tween",
    ease: EASE_OUT_EDITORIAL,
    duration: 0.3,
  } as Transition,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.editorial },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: transitions.editorial },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: transitions.editorial },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: transitions.editorial },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 8 },
  visible: { opacity: 1, x: 0, transition: transitions.editorial },
};

// Editorial surfaces should NOT scale on entrance — opacity + translate only.
// `scaleIn` is kept for modal entries where a tiny scale feels right.
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.995 },
  visible: { opacity: 1, scale: 1, transition: transitions.editorial },
};

// Deprecated — alias to scaleIn. Removed in Phase 9.
export const scaleInBounce: Variants = scaleIn;

export const slideInBottom: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: transitions.editorial },
};

export const slideInTop: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: transitions.editorial },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: transitions.editorial },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.editorial },
};

// Hover effects — subtle translate only. No scale.
export const cardHover = {
  rest: { y: 0 },
  hover: { y: -1, transition: transitions.quick },
  tap: { y: 0 },
};

export const buttonHover = {
  rest: { opacity: 1 },
  hover: { opacity: 0.9, transition: transitions.quick },
  tap: { opacity: 0.8 },
};

// Deprecated — used to rotate 360° on hover. Neutralized for editorial feel.
export const iconHover = {
  rest: { opacity: 1 },
  hover: { opacity: 0.7, transition: transitions.quick },
};

export const liftOnHover = {
  rest: { y: 0 },
  hover: { y: -1, transition: transitions.quick },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: transitions.editorial },
  exit: { opacity: 0, transition: transitions.quick },
};

export const modalTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: transitions.editorial },
  exit: { opacity: 0, y: 4, transition: transitions.quick },
};

export const drawerSlideRight: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: transitions.long },
  exit: { x: "100%", transition: transitions.editorial },
};

export const drawerSlideLeft: Variants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: transitions.long },
  exit: { x: "-100%", transition: transitions.editorial },
};

export const createStagger = (
  staggerDelay: number = 0.08,
  delayChildren: number = 0,
) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: staggerDelay, delayChildren },
  },
});

export const createFadeIn = (
  direction: "up" | "down" | "left" | "right" = "up",
  distance: number = 6,
) => {
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const value =
    direction === "down" || direction === "right" ? distance : -distance;

  return {
    hidden: { opacity: 0, [axis]: value },
    visible: {
      opacity: 1,
      [axis]: 0,
      transition: transitions.editorial,
    },
  };
};

export const createViewportAnimation = (once: boolean = true) => ({
  viewport: { once, amount: 0.3 },
  initial: "hidden",
  whileInView: "visible",
});

/**
 * Wrap variants so they degrade to an instant opacity flip under
 * `prefers-reduced-motion`. Pair with `useReducedMotion()` from framer-motion.
 */
export function withReduced(variants: Variants, reduced: boolean): Variants {
  if (!reduced) return variants;
  const out: Variants = {};
  for (const key of Object.keys(variants)) {
    const v = variants[key];
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      out[key] = { opacity: (v as { opacity?: number }).opacity ?? 1 };
    } else {
      out[key] = v;
    }
  }
  return out;
}
