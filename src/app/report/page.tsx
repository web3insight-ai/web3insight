import { api } from "@/lib/api/client";
import { getUser } from "~/auth/repository";
import DefaultLayoutWrapper from "../DefaultLayoutWrapper";
import YearlyReport from "~/report/views/yearly-report";

export const metadata = {
  title: "2025 Annual Report | Web3 Insight",
  description:
    "Chinese Web3 developer ecosystem annual report - developer growth, ecosystem participation, and top repositories.",
};

export default async function ReportPage() {
  const user = await getUser();
  const result = await api.rankings.getYearlyReport();

  const reportData = result.success && result.data ? result.data : null;

  return (
    <DefaultLayoutWrapper user={user}>
      <div className="w-full max-w-content mx-auto px-6 py-8">
        <YearlyReport data={reportData} />
      </div>
    </DefaultLayoutWrapper>
  );
}
