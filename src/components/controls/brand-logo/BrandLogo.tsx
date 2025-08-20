import Image from "next/image";

import { getTitle } from "@/utils/app";

type BrandLogoProps = {
  className?: string;
  width?: number;
}

function BrandLogo({ className, width = 28 }: BrandLogoProps) {
  return (
    <Image
      className={className}
      src="/logo.png"
      width={width}
      height={width}
      alt={`${getTitle()} Logo`}
      priority
    />
  );
}

export default BrandLogo;
