import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@/components/ui";
import { ChevronDown } from "lucide-react";
import { EcosystemType, EcosystemTypeLabels } from "~/ecosystem/typing";

interface EcosystemTypeFilterProps {
  selectedType: EcosystemType;
  onTypeChange: (type: EcosystemType) => void;
  className?: string;
}

function EcosystemTypeFilter({
  selectedType,
  onTypeChange,
  className = "",
}: EcosystemTypeFilterProps) {
  const options = Object.entries(EcosystemTypeLabels).map(([key, label]) => ({
    key: key as EcosystemType,
    label,
  }));

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Desktop: Horizontal tabs */}
      <div className="hidden sm:inline-flex items-center gap-0 border border-rule rounded-[2px] bg-bg-sunken">
        {options.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onTypeChange(key)}
            className={`px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-200 whitespace-nowrap border-r border-rule last:border-r-0 ${
              selectedType === key
                ? "bg-bg-raised text-fg"
                : "text-fg-muted hover:text-fg hover:bg-bg-raised/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Mobile: Dropdown */}
      <div className="sm:hidden">
        <Dropdown placement="bottom-start">
          <DropdownTrigger>
            <Button
              variant="bordered"
              endContent={<ChevronDown className="w-4 h-4" />}
              className="text-sm font-medium"
            >
              {EcosystemTypeLabels[selectedType]}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            selectedKeys={[selectedType]}
            selectionMode="single"
            onAction={(key) => onTypeChange(key as EcosystemType)}
          >
            {options.map(({ key, label }) => (
              <DropdownItem key={key}>{label}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
}

export default EcosystemTypeFilter;
