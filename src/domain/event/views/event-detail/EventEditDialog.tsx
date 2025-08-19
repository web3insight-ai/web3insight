import { useState, useEffect, useRef, MouseEvent } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Textarea, Button, Chip,
} from "@nextui-org/react";
import { Calendar, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";

import { addToastAtom } from "#/atoms";
import FileUpload from "@/components/control/file-upload";
import AnalysisProgress from "@/components/loading/AnalysisProgress";
import { updateOne, fetchOne } from "../../repository";
import { resolveContestants } from "../event-list/helper";

import type { EventReport } from "../../typing";

type EventEditDialogProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event: EventReport | null;
};

function EventEditDialog({ visible, onClose, event }: EventEditDialogProps) {
  const router = useRouter();
  const [, addToast] = useAtom(addToastAtom);
  const [description, setDescription] = useState("");
  const [currentParticipants, setCurrentParticipants] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const uploadRef = useRef<HTMLInputElement>(null);

  // Initialize form with event data
  useEffect(() => {
    if (event && visible) {
      setDescription(event.description || "");

      // Load original request_data if available, otherwise try to derive from contestants
      let participantList: string[] = [];

      if (event.request_data && event.request_data.length > 0) {
        participantList = event.request_data;
      } else if (event.contestants && event.contestants.length > 0) {
        // Fallback: extract GitHub usernames from contestants
        participantList = event.contestants.map(contestant => contestant.username);
      }

      setCurrentParticipants(participantList);
      setUserInput("");
    }
  }, [event, visible]);

  const handleCsvUpload = (evt: MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    uploadRef.current?.click();
  };

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUserInput(e.target?.result as string);

      if (uploadRef.current) {
        uploadRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const closeDialog = () => {
    setDescription("");
    setCurrentParticipants([]);
    setUserInput("");
    setLoading(false);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    onClose();
  };

  const removeParticipant = (index: number) => {
    setCurrentParticipants(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (!event) return;

    const resolvedDescription = description && description.trim();

    if (!resolvedDescription) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Event name is required',
      });
      return;
    }

    // Combine current participants with new additions
    const newParticipants = resolveContestants(userInput);
    const allParticipants = [...currentParticipants, ...newParticipants];

    if (allParticipants.length === 0) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'At least one participant is required',
      });
      return;
    }

    setLoading(true);
    setIsAnalyzing(true);
    setAnalysisProgress(10);

    try {
      // Step 1: Update the event
      const result = await updateOne({
        id: Number(event.id),
        urls: allParticipants,
        description: resolvedDescription,
      });

      if (result.success) {
        setAnalysisProgress(20);

        addToast({
          type: 'success',
          title: 'Event Updated',
          message: 'Event updated successfully. Analysis in progress...',
        });

        // Step 2: Poll for analysis completion
        await pollAnalysisCompletion(Number(event.id));
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      setIsAnalyzing(false);
      setLoading(false);

      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update event',
      });
    }
  };

  const pollAnalysisCompletion = async (eventId: number): Promise<void> => {
    const maxAttempts = 40; // 40 attempts × 5 seconds = 200 seconds max wait
    let attempts = 0;

    const poll = async (): Promise<void> => {
      try {
        attempts++;

        // Update progress based on attempts (20% to 90%)
        const progressIncrement = Math.min(70 / maxAttempts * attempts, 70);
        setAnalysisProgress(20 + progressIncrement);

        const response = await fetchOne(eventId);

        if (response.success && response.data && response.data.contestants && response.data.contestants.length > 0) {
          // Check if analysis is complete by looking for analytics data
          const hasCompleteData = response.data.contestants.some(contestant =>
            contestant.analytics &&
            Array.isArray(contestant.analytics) &&
            contestant.analytics.length > 0 &&
            contestant.analytics.some(analytics => analytics.score !== undefined && analytics.score !== null),
          );

          if (hasCompleteData) {
            // Analysis complete!
            setAnalysisProgress(100);

            addToast({
              type: 'success',
              title: 'Analysis Complete',
              message: 'Event analysis completed successfully',
            });

            // Wait a moment to show completion, then navigate and refresh
            setTimeout(() => {
              router.push(`/admin/events/${eventId}`);
              closeDialog();
              // Trigger page refresh to get latest data
              window.location.reload();
            }, 1500);

            return;
          }
        }

        // Continue polling if not complete and under max attempts
        if (attempts < maxAttempts) {
          setTimeout(() => {
            poll();
          }, 5000); // Poll every 5 seconds
        } else {
          // Max attempts reached, but still navigate to show partial results
          setAnalysisProgress(100);

          addToast({
            type: 'warning',
            title: 'Analysis Taking Longer',
            message: 'Analysis is still in progress. You can view current status on the detail page.',
          });

          setTimeout(() => {
            router.push(`/admin/events/${eventId}`);
            closeDialog();
            // Trigger page refresh to get latest data
            window.location.reload();
          }, 1500);
        }
      } catch (error) {
        // On polling error, still navigate but show warning
        addToast({
          type: 'warning',
          title: 'Unable to Check Status',
          message: 'Event updated but unable to verify analysis completion. Please check the detail page.',
        });

        setTimeout(() => {
          router.push(`/admin/events/${eventId}`);
          closeDialog();
          // Trigger page refresh to get latest data
          window.location.reload();
        }, 1500);
      }
    };

    // Start polling after a short delay
    setTimeout(() => {
      poll();
    }, 2000);
  };

  return (
    <Modal
      backdrop="blur"
      isOpen={visible}
      onClose={closeDialog}
      placement="center"
      size="lg"
      isDismissable={true}
      isKeyboardDismissDisabled={false}
      classNames={{
        base: "max-w-2xl mx-4 max-h-[80vh] my-8",
        wrapper: "overflow-visible",
        backdrop: "bg-background-dark/50",
        header: "border-b border-border dark:border-border-dark",
        body: "p-0 overflow-hidden",
        closeButton: "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
      }}
    >
      <ModalContent className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark flex flex-col max-h-full">
        {() => (
          <>
            <ModalHeader className="flex items-center gap-3 px-6 py-5">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Event
                  {event && (
                    <Chip size="sm" variant="flat" color="primary" className="ml-2">
                      #{event.id}
                    </Chip>
                  )}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Update event details and manage participants
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="flex-1 overflow-y-auto">
              <div className="px-6 py-6 space-y-6 relative">
                {/* Loading Overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-b-lg">
                    <div className="text-center space-y-3">
                      {isAnalyzing ? (
                        <AnalysisProgress
                          progress={analysisProgress}
                          status="analyzing"
                          message={analysisProgress < 20 ? "Updating event..." :
                            analysisProgress < 90 ? "Re-analyzing participants..." :
                              "Finalizing analysis..."}
                          estimatedTime="This may take several minutes"
                        />
                      ) : (
                        <>
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Updating event...
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <Textarea
                    value={description}
                    placeholder="Enter event name (e.g., OpenBuild Hackathon)"
                    label="Event Name"
                    labelPlacement="outside"
                    isRequired
                    onValueChange={setDescription}
                    classNames={{
                      base: "w-full",
                      label: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                      input: "bg-white dark:bg-surface-dark border-border dark:border-border-dark",
                    }}
                  />

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Current Participants ({currentParticipants.length})
                    </label>
                    {currentParticipants.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-border dark:border-border-dark">
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-4">
                          {currentParticipants.map((participant, index) => (
                            <div
                              key={index}
                              className="relative bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-md px-3 py-2 group hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-center"
                            >
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate block">
                                {participant}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeParticipant(index)}
                                className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200 w-5 h-5 bg-white dark:bg-surface-dark hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full border border-border dark:border-border-dark flex items-center justify-center"
                                title="Remove participant"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-border dark:border-border-dark">
                        No current participants
                      </div>
                    )}
                  </div>

                  <Textarea
                    value={userInput}
                    placeholder="Enter GitHub username of new contestants, separated by comma"
                    label="Add New Participants"
                    labelPlacement="outside"
                    minRows={5}
                    maxRows={10}
                    onValueChange={setUserInput}
                    classNames={{
                      base: "w-full",
                      label: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                      input: "bg-white dark:bg-surface-dark border-border dark:border-border-dark",
                    }}
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Input manually above or
                    </span>
                    <FileUpload
                      ref={uploadRef}
                      type="csv"
                      onChange={handleFileChange}
                    >
                      <Button
                        onClick={handleCsvUpload}
                        size="sm"
                        variant="bordered"
                        className="border-border dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/10"
                      >
                        import from CSV file
                      </Button>
                    </FileUpload>
                  </div>

                  {/* Warning Notice */}
                  <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-warning-600 dark:text-warning-400 mt-0.5 shrink-0" />
                      <div className="text-sm text-warning-700 dark:text-warning-300">
                        <p className="font-medium mb-1">Analysis Re-run Notice</p>
                        <p>
                          Updating this event will trigger a complete re-analysis of all participants.
                          This process may take several minutes to complete.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-border dark:border-border-dark px-6 py-4">
              <div className="flex gap-3 w-full sm:w-auto sm:ml-auto">
                <Button
                  variant="bordered"
                  onClick={() => closeDialog()}
                  className="flex-1 sm:flex-none border-border dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/10"
                >
                  {loading ? "Close" : "Cancel"}
                </Button>
                <Button
                  color="primary"
                  isLoading={loading}
                  onClick={handleConfirm}
                  isDisabled={loading || !description.trim()}
                  className="flex-1 sm:flex-none"
                >
                  Update Event
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default EventEditDialog;
