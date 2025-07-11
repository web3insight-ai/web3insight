import { EcosystemType, EcosystemTypeLabels } from "~/ecosystem/typing";

interface EcosystemTypeFilterProps {
  selectedType: EcosystemType;
  onTypeChange: (type: EcosystemType) => void;
  className?: string;
}

function EcosystemTypeFilter({ selectedType, onTypeChange, className = "" }: EcosystemTypeFilterProps) {

  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {Object.entries(EcosystemTypeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onTypeChange(key as EcosystemType)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              selectedType === key 
                ? 'bg-primary text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EcosystemTypeFilter;
