import type { Metadata } from 'next';
import DevelopersPageClient from './DevelopersPageClient';
import { fetchStatisticsRank, fetchStatisticsOverview } from "~/statistics/repository";
import DefaultLayoutWrapper from '../DefaultLayoutWrapper';

export const metadata: Metadata = {
  title: "All Developers | Web3 Insights",
  openGraph: {
    title: "All Developers | Web3 Insights",
  },
  description: "Top contributors and developers across Web3 ecosystems with activity metrics and contributions",
};

export default async function DevelopersPage() {
  try {
    const [statisticsResult, rankResult] = await Promise.all([
      fetchStatisticsOverview(),
      fetchStatisticsRank(),
    ]);
    
    const developers = rankResult.success ? rankResult.data.developer : [];
    const statisticOverview = statisticsResult.success ? statisticsResult.data : {
      ecosystem: 0,
      repository: 0,
      developer: 0,
      coreDeveloper: 0,
    };
    
    if (!statisticsResult.success) {
      console.warn("Statistics overview fetch failed:", statisticsResult.message);
    }
    if (!rankResult.success) {
      console.warn("Statistics rank fetch failed:", rankResult.message);
    }

    const pageData = {
      developers,
      activeDevelopers: Number(statisticOverview.developer),
      coreDevelopers: Number(statisticOverview.coreDeveloper),
      totalRepositories: Number(statisticOverview.repository),
      totalEcosystems: Number(statisticOverview.ecosystem),
    };

    return (
      <DefaultLayoutWrapper user={null}>
        <DevelopersPageClient {...pageData} />
      </DefaultLayoutWrapper>
    );
  } catch (error) {
    console.error("Error in developers route:", error);
    
    const fallbackData = {
      developers: [],
      activeDevelopers: 0,
      coreDevelopers: 0,
      totalRepositories: 0,
      totalEcosystems: 0,
    };

    return (
      <DefaultLayoutWrapper user={null}>
        <DevelopersPageClient {...fallbackData} />
      </DefaultLayoutWrapper>
    );
  }
}
