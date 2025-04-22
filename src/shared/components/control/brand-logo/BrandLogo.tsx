import { Image, type ImageProps } from "@nextui-org/react";

import { getTitle } from "../../../utils/app";
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
      alt={`${getTitle()} Logo`}
    />
  );
}

export default BrandLogo;
