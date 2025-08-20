import { EcosystemType } from "./typing";

const defaultPageSize = 25;

function getPageSize(): number {
  return defaultPageSize;
}

// Map frontend ecosystem types to backend kind field values
function getFilterForType(selectedType: EcosystemType, ecosystemKind: string | undefined): boolean {
  if (selectedType === EcosystemType.ALL) {
    return true;
  }
  
  if (!ecosystemKind) {
    return false;
  }

  const kindLower = ecosystemKind.toLowerCase();
  
  switch (selectedType) {
  case EcosystemType.PUBLIC_CHAIN:
    return kindLower.includes('public') || kindLower.includes('chain') || kindLower.includes('blockchain');
  case EcosystemType.INFRASTRUCTURE:
    return kindLower.includes('infrastructure') || kindLower.includes('infra');
  case EcosystemType.COMMUNITY:
    return kindLower.includes('community') || kindLower.includes('social');
  default:
    return false;
  }
}

export { getPageSize, getFilterForType };
