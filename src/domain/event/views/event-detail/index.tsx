import { useState } from "react";
import { Switch } from "@nextui-org/react";
import { Zap, Clock } from "lucide-react";

import EventDetailView from "./EventDetail";
import ProgressiveEventDetail from "./ProgressiveEventDetail";

import type { EventDetailViewWidgetProps } from "./typing";

function EventDetailWrapper(props: EventDetailViewWidgetProps) {
  const [useProgressiveLoading, setUseProgressiveLoading] = useState(true);

  return (
    <div className="space-y-4">
      {/* Toggle for demo purposes - remove in production */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-border dark:border-border-dark">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {useProgressiveLoading ? (
              <Zap size={16} className="text-primary" />
            ) : (
              <Clock size={16} className="text-gray-500" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {useProgressiveLoading ? "Progressive Loading" : "Traditional Loading"}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {useProgressiveLoading 
              ? "Shows basic info immediately, analyzes in background" 
              : "Waits for complete analysis before showing anything"
            }
          </span>
        </div>
        
        <Switch
          size="sm"
          isSelected={useProgressiveLoading}
          onValueChange={setUseProgressiveLoading}
        />
      </div>

      {/* Render appropriate component */}
      {useProgressiveLoading ? (
        <ProgressiveEventDetail {...props} />
      ) : (
        <EventDetailView {...props} />
      )}
    </div>
  );
}

export default EventDetailWrapper;
