import { Chip } from "@nextui-org/react";

function EcosystemField({ value }: { value: string[] }) {
  return value.length > 0 ? (
    <div className="flex flex-wrap gap-2">
      {value.map(eco => (
        <Chip key={eco.replaceAll(" ", "")} size="sm">{eco}</Chip>
      ))}
    </div>
  ) : null;
}

export default EcosystemField;
