"use client";

import { useEffect, useState } from "react";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
}

export default function FadeIn({ children, className = "" }: FadeInProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={["transition-opacity", "duration-300", visible ? "opacity-100" : "opacity-0", className].join(" ") }>
      {children}
    </div>
  );
}
