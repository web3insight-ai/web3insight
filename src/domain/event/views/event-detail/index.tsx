import { useState } from "react";
import { Switch, Button } from "@nextui-org/react";
import { Zap, Clock, Edit3 } from "lucide-react";

import { fetchOne } from "../../repository";
import EventDetailView from "./EventDetail";
import ProgressiveEventDetail from "./ProgressiveEventDetail";
import EventEditDialog from "./EventEditDialog";

import type { EventDetailViewWidgetProps } from "./typing";
import type { EventReport } from "../../typing";

function EventDetailWrapper(props: EventDetailViewWidgetProps) {
  const [useProgressiveLoading, setUseProgressiveLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [eventData, setEventData] = useState<EventReport | null>(null);
  const [loadingEventData, setLoadingEventData] = useState(false);

  // Fetch event data for editing
  const fetchEventData = async () => {
    setLoadingEventData(true);
    try {
      const result = await fetchOne(props.id);
      if (result.success) {
        setEventData(result.data);
      }
    } catch (error) {
      console.error('[EventDetailWrapper] Error fetching event data:', error);
    } finally {
      setLoadingEventData(false);
    }
  };

  const handleEditClick = () => {
    if (!eventData) {
      fetchEventData();
    }
    setShowEditDialog(true);
  };

  const handleEditSuccess = () => {
    // Refresh the page to show updated data
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-border dark:border-border-dark">
        <div className="flex items-center gap-3 flex-1">
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
        
        <div className="flex items-center gap-3 justify-end">
          <Button
            size="sm"
            color="primary"
            variant="flat"
            startContent={<Edit3 size={16} />}
            onClick={handleEditClick}
            isLoading={loadingEventData}
            className="text-sm font-medium px-4 h-9"
          >
            Edit Event
          </Button>
          <Switch
            size="sm"
            isSelected={useProgressiveLoading}
            onValueChange={setUseProgressiveLoading}
          />
        </div>
      </div>

      {/* Render appropriate component */}
      {useProgressiveLoading ? (
        <ProgressiveEventDetail {...props} />
      ) : (
        <EventDetailView {...props} />
      )}

      {/* Edit Dialog */}
      <EventEditDialog
        visible={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSuccess={handleEditSuccess}
        event={eventData}
      />
    </div>
  );
}

export default EventDetailWrapper;
