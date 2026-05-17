import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DonationDetailClient from "./DonationDetailClient";
import { getTitle } from "@/utils/app";
import { getUser } from "~/auth/repository";
import DefaultLayoutWrapper from "../../../DefaultLayoutWrapper";
import { createWeb3InsightClient } from "@web3insight/orpc-client";
import { env } from "@/env";
import { api } from "@/lib/api/client";
import type { DonateRepo, RepoActiveDeveloperRecord } from "@/lib/api/types";
import type {
  Developer,
  DeveloperContribution,
  DeveloperEcosystems,
} from "~/developer/typing";

interface DonationPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function fetchDonateRepo(id: string): Promise<DonateRepo | null> {
  try {
    const { client } = createWeb3InsightClient({
      url: `${env.DATA_API_URL}/rpc`,
      token: env.DATA_API_TOKEN,
      credentials: "omit",
    });

    const detail = (await client.donate.getDonationById({
      id: Number(id),
    })) as DonateRepo | null;

    return detail && detail.repo_id ? detail : null;
  } catch (error) {
    console.error("[API] Fetch donate repo error:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: DonationPageProps): Promise<Metadata> {
  const { id } = await params;

  const donateRepo = await fetchDonateRepo(id);
  const repoName = donateRepo?.repo_info?.full_name || "Unknown";
  const title = donateRepo?.repo_donate_data?.title || repoName;
  const description =
    donateRepo?.repo_donate_data?.description ||
    donateRepo?.repo_info?.description ||
    `Support ${repoName} with crypto donations`;

  return {
    title: `${title} - Donate - ${getTitle()}`,
    description,
    openGraph: {
      title: `Support ${title}`,
      description,
    },
  };
}

export default async function DonationDetailPage({
  params,
}: DonationPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const user = await getUser();

  const donateRepo = await fetchDonateRepo(id);

  if (!donateRepo) {
    notFound();
  }

  // Reason: Fetch developer profile data using creator handle or repo owner
  const creatorHandle =
    donateRepo.repo_donate_data?.creator?.handle ||
    donateRepo.repo_info.owner.login;

  let developer: Developer | null = null;
  let contributions: DeveloperContribution[] = [];
  let ecosystems: DeveloperEcosystems | null = null;
  let activeDevelopers: RepoActiveDeveloperRecord[] = [];

  try {
    // Fetch developer data and repo active developers in parallel
    const [developerRes, activeDevelopersRes] = await Promise.all([
      api.developers.getOne(creatorHandle),
      api.repos.getActiveDeveloperList(donateRepo.repo_id),
    ]);

    // Process active developers
    if (activeDevelopersRes.success && activeDevelopersRes.data?.list) {
      activeDevelopers = activeDevelopersRes.data.list;
    }

    if (developerRes.success && developerRes.data) {
      developer = developerRes.data;

      // Fetch additional developer data in parallel
      const [contributionsRes, ecosystemsRes] = await Promise.all([
        api.developers.getContributionList(developer.id),
        api.developers.getEcosystems(developer.id),
      ]);

      contributions = contributionsRes.data || [];
      ecosystems = ecosystemsRes.data || null;
    }
  } catch (error) {
    console.error("[API] Error fetching data:", error);
    // Continue without developer data
  }

  return (
    <DefaultLayoutWrapper user={user}>
      <DonationDetailClient
        donateRepo={donateRepo}
        developer={developer}
        contributions={contributions}
        ecosystems={ecosystems}
        activeDevelopers={activeDevelopers}
      />
    </DefaultLayoutWrapper>
  );
}
