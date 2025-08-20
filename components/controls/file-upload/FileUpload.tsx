import { useRef, forwardRef, useImperativeHandle } from "react";

import { noop, capitalize } from "@/utils";

import type { FileUploadProps } from "./typing";
import type { ChangeEvent } from "react";

import { resolveFileSize, resolveFileAccept } from "./helper";

const FileUpload = forwardRef(({
  className,
  children,
  type,
  accept,
  size,
  flag,
  onChange = noop,
}: FileUploadProps, ref: React.ForwardedRef<HTMLInputElement>) => {
  const uploadRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => uploadRef.current as HTMLInputElement);

  const id = "fileUploadWidget";
  const resolvedId = flag ? `${id}For${capitalize(flag.charAt(0))}${flag.slice(1)}` : id;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files[0]) {
      const file = files[0];

      if (size && file.size > resolveFileSize(size)) {
        alert(`The file's size is larger than ${size}`);
        event.target.value = "";
        return;
      }

      onChange(file);
    }
  };

  return (
    <label htmlFor={resolvedId} className={className}>
      {children}
      <input
        ref={uploadRef}
        id={resolvedId}
        className="hidden"
        type="file"
        accept={resolveFileAccept(accept, type)}
        onChange={handleFileChange}
      />
    </label>
  );
});

FileUpload.displayName = "FileUpload";

export default FileUpload;
