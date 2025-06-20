import { useState, useEffect, useMemo } from "react";
import { Select, SelectItem, Spinner } from "@nextui-org/react";

import ChartCard from "@/components/control/chart-card";

import ProfileCardWidget from "../../../developer/widgets/profile-card";

import type { EventReport } from "../../typing";
import { fetchOne } from "../../repository";

import type { EventDetailViewWidgetProps } from "./typing";
import { resolveChartOptions } from "./helper";
import RepoScoreListCard from "./RepoScoreListCard";

function EventDetailView({ id }: EventDetailViewWidgetProps) {
  const [dataSource, setDataSource] = useState<EventReport | null>(null);
  const [loading, setLoading] = useState(false);

  const [contestants, setContestants] = useState<EventReport["contestants"]>([]);
  const [selectedContestant, setSelectedContestant] = useState("");

  const contestantData = useMemo(() => contestants.find(contestant => `${contestant.id}` === selectedContestant), [contestants, selectedContestant]);

  useEffect(() => {
    setLoading(true);
    fetchOne(id)
      .then(res => {
        if (res.success) {
          setDataSource(res.data);
          setContestants(res.data.contestants);

          if (res.data.contestants.length === 1) {
            setSelectedContestant(`${res.data.contestants[0].id}`);
          }
        } else {
          alert(res.message);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="relative min-h-80 flex flex-col gap-6">
      <div className="flex items-center">
        <Select
          className="max-w-xs"
          placeholder="Choose a contestant"
          selectedKeys={[selectedContestant]}
          isDisabled={!dataSource || contestants.length === 0}
          onChange={e => {
            setSelectedContestant(e.target.value);
          }}
        >
          {contestants.map(contestant => (
            <SelectItem key={contestant.id}>
              {contestant.nickname}
            </SelectItem>
          ))}
        </Select>
      </div>
      {contestantData && (
        <div className="flex flex-col gap-6">
          <ProfileCardWidget developer={contestantData} />
          <ChartCard
            title="Ecosystem Score"
            style={{ height: "400px" }}
            option={resolveChartOptions(contestantData.analytics)}
            chartContainerClassName="h-[400px]"
          />
          <RepoScoreListCard dataSource={contestantData.analytics} />
        </div>
      )}
      {loading && (
        <div className="absolute top-0 left-0 z-10 w-full h-full flex items-center justify-center">
          <Spinner label="Loading" />
        </div>
      )}
    </div>
  );
}

export default EventDetailView;
