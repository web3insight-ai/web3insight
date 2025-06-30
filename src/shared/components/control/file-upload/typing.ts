import type { InputHTMLAttributes, PropsWithChildren } from "react";

type FileUploadType = "image" | "csv";

type FileUploadAccept = InputHTMLAttributes<HTMLInputElement>["accept"];

type FileUploadSize = number | string;

type FileUploadProps = PropsWithChildren<{
  className?: string;
  type?: FileUploadType;
  accept?: FileUploadAccept;
  size?: FileUploadSize;
  flag?: string;
  onChange?: (file: File) => void;
}>;

export type { FileUploadType, FileUploadAccept, FileUploadSize, FileUploadProps };
