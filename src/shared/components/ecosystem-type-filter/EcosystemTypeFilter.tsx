import { EcosystemType, EcosystemTypeLabels } from "~/ecosystem/typing";

interface EcosystemTypeFilterProps {
  selectedType: EcosystemType;
  onTypeChange: (type: EcosystemType) => void;
  className?: string;
}

function EcosystemTypeFilter({ selectedType, onTypeChange, className = "" }: EcosystemTypeFilterProps) {

  return (
    <div className={`flex gap-1 ${className}`}>
      {Object.entries(EcosystemTypeLabels).map(([key, label]) => (
        <button
          key={key}
          onClick={() => onTypeChange(key as EcosystemType)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
            selectedType === key 
              ? 'bg-primary text-white' 
              : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default EcosystemTypeFilter;
