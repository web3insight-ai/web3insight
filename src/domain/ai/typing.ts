type AnalysisType = "evm" | "github_repo" | undefined;

type fetchAIStatisticProps = {
  query: string;
  request_id: string;
};

export type { AnalysisType, fetchAIStatisticProps };
