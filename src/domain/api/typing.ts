type EcosystemType = "NEAR" | "OpenBuild" | "Starknet";

type EcoRequestParams = {
  eco: EcosystemType | "ALL";
};

type TotalResponseData = {
  total: string;
};

type ListResponseData<T> = {
  list: T[];
};

export type { EcoRequestParams, TotalResponseData, ListResponseData };
