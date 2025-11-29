'use client';

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { getTitle } from "@/utils/app";

type BrandLogoProps = {
  className?: string;
  width?: number;
  height?: number;
}

function BrandLogo({ className, width = 150, height = 26 }: BrandLogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if dark mode is active
  const isDark = mounted && (theme === 'system' ? systemTheme === 'dark' : theme === 'dark');

  // Use placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className={className}
        style={{ width, height }}
      />
    );
  }

  return (
    <Image
      className={className}
      src={isDark ? "/web3insight_logo_white.svg" : "/web3insight_logo.svg"}
      width={width}
      height={height}
      alt={`${getTitle()} Logo`}
      priority
    />
  );
}

export default BrandLogo;
