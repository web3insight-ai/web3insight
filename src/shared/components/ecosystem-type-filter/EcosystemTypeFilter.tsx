import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { ChevronDown } from "lucide-react";
import { EcosystemType, EcosystemTypeLabels } from "~/ecosystem/typing";

interface EcosystemTypeFilterProps {
  selectedType: EcosystemType;
  onTypeChange: (type: EcosystemType) => void;
  className?: string;
}

function EcosystemTypeFilter({ selectedType, onTypeChange, className = "" }: EcosystemTypeFilterProps) {
  const options = Object.entries(EcosystemTypeLabels).map(([key, label]) => ({
    key: key as EcosystemType,
    label,
  }));

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Desktop: Horizontal tabs */}
      <div className="hidden sm:inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {options.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onTypeChange(key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
              selectedType === key 
                ? 'bg-primary text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
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
              <DropdownItem key={key}>
                {label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
}

export default EcosystemTypeFilter;
