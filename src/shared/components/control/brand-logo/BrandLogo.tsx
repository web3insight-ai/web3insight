import { Image, type ImageProps } from "@nextui-org/react";

import Logo from "./logo.png";

type BrandLogoProps = {
  className?: string;
  width?: ImageProps["width"];
}

function BrandLogo({ className, width }: BrandLogoProps) {
  return (
    <Image
      className={className}
      src={Logo}
      width={width}
      alt="Web3Insights Logo"
    />
  );
}

export default BrandLogo;
