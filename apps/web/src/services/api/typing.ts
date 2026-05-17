// API related type definitions
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  code: string;
}

// Statistics data types (matching web3insight project)
export interface StatisticsData {
  ecosystem: number;
  repository: number;
  developer: number;
  coreDeveloper: number;
}

// Add more API-specific types here as needed
