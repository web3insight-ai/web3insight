import { useState, useEffect } from "react";
import { Spinner, Accordion, AccordionItem, Chip, Avatar } from "@nextui-org/react";

import ChartCard from "@/components/control/chart-card";

import ProfileCardWidget from "../../../developer/widgets/profile-card";

import type { EventReport } from "../../typing";
import { fetchOne } from "../../repository";

import type { EventDetailViewWidgetProps } from "./typing";
import { resolveChartOptions } from "./helper";
import RepoScoreListCard from "./RepoScoreListCard";

function EventDetailView({ id }: EventDetailViewWidgetProps) {
  const [loading, setLoading] = useState(false);

  const [contestants, setContestants] = useState<EventReport["contestants"]>([]);

  useEffect(() => {
    setLoading(true);
    fetchOne(id)
      .then(res => {
        if (res.success) {
          setContestants(res.data.contestants);
        } else {
          alert(res.message);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="relative min-h-80 flex flex-col gap-6">
      <Accordion variant="splitted" selectionMode="multiple">
        {contestants.map(contestant => (
          <AccordionItem
            key={contestant.id}
            classNames={{
              titleWrapper: "gap-1",
              content: "p-4 mb-4 bg-gray-100 rounded-xl",
            }}
            title={contestant.nickname}
            subtitle={
              <div className="flex gap-1">
                {contestant.analytics.slice(0, 3).map(({ name, score }) => (
                  <Chip key={name} size="sm">{name}: {score}</Chip>
                ))}
              </div>
            }
            startContent={
              <Avatar
                src={contestant.avatar}
                fallback={contestant.nickname}
                size="lg"
              />
            }
          >
            <div className="flex flex-col gap-6">
              <ProfileCardWidget developer={contestant} />
              <ChartCard
                title="Ecosystem Score"
                style={{ height: "400px" }}
                option={resolveChartOptions(contestant.analytics)}
                chartContainerClassName="h-[400px]"
              />
              <RepoScoreListCard dataSource={contestant.analytics} />
            </div>
          </AccordionItem>
        ))}
      </Accordion>
      {loading && (
        <div className="absolute top-0 left-0 z-10 w-full h-full flex items-center justify-center">
          <Spinner label="Loading" />
        </div>
      )}
    </div>
  );
}

export default EventDetailView;
