// Legacy donate request shapes. See ./api.dto.ts for the rationale on why
// these no longer carry class-validator decorators — validation moved to the
// oRPC Zod contracts in @web3insight/api-contract.
export interface DonateCreateDto {
  repo_full_name: string;
}

export interface DonateUpdateDto {
  repo_donate_data?: Record<string, unknown>;
}
