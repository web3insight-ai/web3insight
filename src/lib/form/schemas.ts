import { z } from "zod";

// ============================================================================
// AI Query Form
// ============================================================================

export const aiQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Query is required")
    .max(500, "Query must be less than 500 characters")
    .trim(),
});

export type AIQueryInput = z.infer<typeof aiQuerySchema>;

// ============================================================================
// Search & Filter Forms
// ============================================================================

export const searchFilterSchema = z.object({
  search: z.string().optional().default(""),
  sortBy: z.string().default("score"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(10).max(100).default(25),
});

export type SearchFilterInput = z.infer<typeof searchFilterSchema>;

export const developerSearchSchema = z.object({
  search: z.string(),
  sortBy: z.enum(["total_commit_count", "actor_login"]),
  sortDirection: z.enum(["asc", "desc"]),
});

export type DeveloperSearchInput = z.infer<typeof developerSearchSchema>;

export const repositorySearchSchema = z.object({
  search: z.string(),
  sortBy: z.enum(["star_count", "forks_count", "contributor_count", "name"]),
  sortDirection: z.enum(["asc", "desc"]),
});

export type RepositorySearchInput = z.infer<typeof repositorySearchSchema>;

export const ecosystemSearchSchema = z.object({
  search: z.string().optional().default(""),
  type: z.enum(["all", "blockchain", "protocol"]).default("all"),
  sortBy: z
    .enum(["actors_total", "repos_total", "name"])
    .default("actors_total"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

export type EcosystemSearchInput = z.infer<typeof ecosystemSearchSchema>;

// ============================================================================
// Admin Forms
// ============================================================================

export const ecosystemRepoMarkSchema = z.object({
  repoId: z.number().int().positive("Invalid repository ID"),
  eco: z.string().min(1, "Ecosystem is required"),
  mark: z
    .number()
    .min(0, "Mark must be at least 0")
    .max(100, "Mark must be at most 100"),
});

export type EcosystemRepoMarkInput = z.infer<typeof ecosystemRepoMarkSchema>;

// ============================================================================
// Custom Analysis Forms
// ============================================================================

export const analyzeUsersSchema = z.object({
  usernames: z
    .string()
    .min(1, "At least one username is required")
    .transform((val) =>
      val
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(z.string())
        .min(1, "At least one username is required")
        .max(100, "Maximum 100 usernames allowed"),
    ),
  intent: z.string().min(1, "Intent is required").max(200),
  description: z.string().max(500).optional(),
});

export type AnalyzeUsersInput = z.infer<typeof analyzeUsersSchema>;

// ============================================================================
// Pagination Schema
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ============================================================================
// Repository List Search Form (Admin)
// ============================================================================

export const repoListSearchSchema = z.object({
  search: z.string(),
  order: z.enum(["id", "org"]),
  direction: z.enum(["asc", "desc"]),
});

export type RepoListSearchInput = z.infer<typeof repoListSearchSchema>;

// ============================================================================
// Event Edit Form
// ============================================================================

export const eventEditSchema = z.object({
  description: z
    .string()
    .min(1, "Event name is required")
    .max(200, "Event name must be less than 200 characters")
    .trim(),
  userInput: z.string(),
});

export type EventEditInput = z.infer<typeof eventEditSchema>;

// ============================================================================
// Repository Mark Form (Admin)
// ============================================================================

export const repoMarkSchema = z.object({
  mark: z.string().min(1, "Please select a mark level"),
});

export type RepoMarkInput = z.infer<typeof repoMarkSchema>;

// ============================================================================
// x402 Donate Forms
// ============================================================================

/**
 * Schema for submitting a repository for donation
 */
export const donateRepoSubmitSchema = z.object({
  repo_full_name: z
    .string()
    .min(1, "Repository name is required")
    .regex(
      /^[\w.-]+\/[\w.-]+$/,
      "Invalid format. Use: owner/repo (e.g., ethereum/go-ethereum)",
    ),
});

export type DonateRepoSubmitInput = z.infer<typeof donateRepoSubmitSchema>;

/**
 * Schema for generating donation.json configuration
 */
export const donationConfigSchema = z.object({
  payTo: z
    .string()
    .min(1, "Wallet address is required")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM wallet address"),
  title: z
    .string()
    .max(100, "Title must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  creator: z
    .string()
    .max(100, "Creator name must be less than 100 characters")
    .optional(),
  defaultAmount: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().positive("Amount must be positive").optional()),
  network: z.string().optional(),
});

// Form input type (before transform) - use for React Hook Form
export type DonationConfigFormValues = z.input<typeof donationConfigSchema>;

// Output type (after transform) - use for generated config
export type DonationConfigInput = z.infer<typeof donationConfigSchema>;

/**
 * Schema for donation amount selection
 */
export const donateAmountSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .transform((val) => parseFloat(val))
    .pipe(
      z
        .number()
        .positive("Amount must be positive")
        .max(10000, "Maximum donation is 10,000 USDC"),
    ),
});

export type DonateAmountInput = z.infer<typeof donateAmountSchema>;
