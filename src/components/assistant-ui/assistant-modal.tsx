"use client";

import { useThreadRuntime } from "@assistant-ui/react";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FC } from "react";
import { Thread } from "./thread";

const widgetTransition = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const buttonTransition = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: { duration: 0.15 },
  },
};

interface AssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AssistantModal: FC<AssistantModalProps> = ({ open, onOpenChange }) => {
  const runtime = useThreadRuntime({ optional: true });

  const handleMinimize = () => {
    onOpenChange(false);
  };

  const handleClose = () => {
    if (runtime) {
      runtime.cancelRun();
    }
    onOpenChange(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            variants={buttonTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => onOpenChange(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
            aria-label="Open AI Assistant"
          >
            <Sparkles
              size={24}
              className="group-hover:scale-110 transition-transform"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={widgetTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-6 right-6 z-50 w-[480px] max-h-[80vh] flex flex-col bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl shadow-2xl overflow-hidden"
          >
            <Thread onMinimize={handleMinimize} onClose={handleClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export { AssistantModal };
