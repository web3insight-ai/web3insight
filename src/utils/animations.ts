/**
 * Framer Motion Animation Utilities
 * Provides reusable animation variants, transitions, and helpers
 */

import { Variants, Transition } from "framer-motion";

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

export const transitions = {
  // Smooth and elegant
  smooth: {
    type: "spring",
    stiffness: 100,
    damping: 15,
    mass: 0.8,
  } as Transition,

  // Quick and snappy
  snappy: {
    type: "spring",
    stiffness: 400,
    damping: 30,
  } as Transition,

  // Bouncy effect
  bouncy: {
    type: "spring",
    stiffness: 300,
    damping: 10,
  } as Transition,

  // Ease out
  easeOut: {
    type: "tween",
    ease: "easeOut",
    duration: 0.3,
  } as Transition,

  // Ease in out
  easeInOut: {
    type: "tween",
    ease: "easeInOut",
    duration: 0.4,
  } as Transition,
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/**
 * Fade in from opacity 0 to 1
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.easeOut,
  },
};

/**
 * Fade in with upward motion
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

/**
 * Fade in with downward motion
 */
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

/**
 * Fade in from left
 */
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
};

/**
 * Fade in from right
 */
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
};

/**
 * Scale in animation
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.smooth,
  },
};

/**
 * Scale in with bounce
 */
export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.bouncy,
  },
};

/**
 * Slide in from bottom
 */
export const slideInBottom: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

/**
 * Slide in from top
 */
export const slideInTop: Variants = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

/**
 * Container for stagger children animations
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/**
 * Fast stagger container
 */
export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

/**
 * Stagger item for use with stagger containers
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

/**
 * Stagger item with scale
 */
export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.smooth,
  },
};

/**
 * Card hover effect
 */
export const cardHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: transitions.snappy,
  },
  tap: {
    scale: 0.98,
  },
};

/**
 * Button hover effect
 */
export const buttonHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: transitions.snappy,
  },
  tap: {
    scale: 0.95,
  },
};

/**
 * Icon hover effect
 */
export const iconHover = {
  rest: { rotate: 0 },
  hover: {
    rotate: 360,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

/**
 * Subtle lift on hover
 */
export const liftOnHover = {
  rest: { y: 0 },
  hover: {
    y: -4,
    transition: transitions.snappy,
  },
};

/**
 * Page transition variants
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

/**
 * Modal transition variants
 */
export const modalTransition: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

/**
 * Drawer slide in from right
 */
export const drawerSlideRight: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: "100%",
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

/**
 * Drawer slide in from left
 */
export const drawerSlideLeft: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: "-100%",
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a custom stagger delay
 */
export const createStagger = (
  staggerDelay: number = 0.1,
  delayChildren: number = 0,
) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

/**
 * Create a custom fade in with direction
 */
export const createFadeIn = (
  direction: "up" | "down" | "left" | "right" = "up",
  distance: number = 20,
) => {
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const value =
    direction === "down" || direction === "right" ? distance : -distance;

  return {
    hidden: { opacity: 0, [axis]: value },
    visible: {
      opacity: 1,
      [axis]: 0,
      transition: transitions.smooth,
    },
  };
};

/**
 * Create a viewport animation config
 * Useful for scroll-triggered animations
 */
export const createViewportAnimation = (once: boolean = true) => ({
  viewport: { once, amount: 0.3 },
  initial: "hidden",
  whileInView: "visible",
});

