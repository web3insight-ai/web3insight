import { useState, useEffect } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Avatar, Link, Button, Badge, Card, CardBody, CardHeader,
} from "@nextui-org/react";
import { MapPin, Calendar, ExternalLink, Users, AlertTriangle, Copy, ChevronDown, ChevronUp } from "lucide-react";

import AnalysisProgress from "@/components/loading/AnalysisProgress";
import { fetchOne } from "../../repository";

import type { ContestantListDialogProps } from "./typing";

function ContestantListDialog({ dataSource, eventId, failedAccounts, visible, onClose, onGoto }: ContestantListDialogProps) {
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(10);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingError, setPollingError] = useState<string | null>(null);
  const [failedAccountsExpanded, setFailedAccountsExpanded] = useState(false);

  useEffect(() => {
    if (!visible || !eventId || analysisComplete) {
      return;
    }

    setIsPolling(true);
    setPollingError(null);
    setAnalysisProgress(15);

    const pollAnalysisStatus = async () => {
      try {
        const response = await fetchOne(eventId);

        if (response.success && response.data && response.data.contestants && response.data.contestants.length > 0) {
          const hasCompleteData = response.data.contestants.some(contestant =>
            contestant.analytics &&
            Array.isArray(contestant.analytics) &&
            contestant.analytics.length > 0,
          );

          if (hasCompleteData) {
            setAnalysisComplete(true);
            setAnalysisProgress(100);
            setIsPolling(false);

            // Auto-navigate to event detail page when analysis is complete
            setTimeout(() => {
              onGoto();
            }, 1500); // Small delay to show completion state

            return;
          }
        }

        setAnalysisProgress(prev => Math.min(prev + 5, 85));
      } catch (error) {
        console.error('[ContestantListDialog] Polling error:', error);
        setPollingError(error instanceof Error ? error.message : 'Analysis failed');
        setIsPolling(false);
        return;
      }

      setTimeout(pollAnalysisStatus, 10000);
    };

    const timeoutId = setTimeout(() => {
      pollAnalysisStatus();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [visible, eventId, analysisComplete, onGoto]);

  useEffect(() => {
    if (!visible) {
      setAnalysisComplete(false);
      setAnalysisProgress(10);
      setIsPolling(false);
      setPollingError(null);
      setFailedAccountsExpanded(false);
    }
  }, [visible]);

  const copyFailedAccounts = () => {
    if (failedAccounts && failedAccounts.length > 0) {
      const accountsText = failedAccounts.join('\n');
      navigator.clipboard.writeText(accountsText).then(() => {
        // Could add a toast notification here

      });
    }
  };

  return (
    <Modal
      size="xl"
      backdrop="blur"
      isOpen={visible}
      isDismissable={false}
      isKeyboardDismissDisabled
      classNames={{
        closeButton: "hidden",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-primary" />
                  <span>Contestants</span>
                </div>
                <Badge color="primary" variant="flat">
                  {dataSource.length} user{dataSource.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {analysisComplete
                  ? "Basic profiles loaded • Analysis complete"
                  : pollingError
                    ? `Analysis failed: ${pollingError}`
                    : "Basic profiles loaded • Analysis in progress"
                }
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4 max-h-96 overflow-auto">
                {dataSource.map(user => (
                  <div className="flex gap-4 p-4 border border-border dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" key={user.id}>
                    <Link href={user.html_url} isExternal className="shrink-0">
                      <Avatar src={user.avatar_url} size="lg" className="ring-2 ring-border dark:ring-border-dark" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={user.html_url}
                          isExternal
                          className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-primary transition-colors"
                        >
                          {user.login}
                        </Link>
                        <ExternalLink size={14} className="text-gray-400" />
                      </div>

                      {user.name && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          {user.name}
                        </div>
                      )}

                      {user.bio && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                          {user.bio}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        {user.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{user.location}</span>
                          </div>
                        )}
                        {user.public_repos > 0 && (
                          <div className="flex items-center gap-1">
                            <span>{user.public_repos} repositories</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Joined {new Date(user.created_at).getFullYear()}</span>
                        </div>
                      </div>

                      <AnalysisProgress
                        status={analysisComplete ? "completed" : pollingError ? "failed" : "analyzing"}
                        progress={analysisProgress}
                        estimatedTime={analysisComplete ? "Completed" : "2-3 minutes"}
                        message={
                          analysisComplete
                            ? "Analysis completed successfully"
                            : pollingError
                              ? pollingError
                              : "Analyzing contribution patterns..."
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Failed Accounts Section */}
              {failedAccounts && failedAccounts.length > 0 && (
                <div className="px-6 pb-6">
                  <Card className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <CardHeader
                      className="pb-3 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      onClick={() => setFailedAccountsExpanded(!failedAccountsExpanded)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                            Failed Accounts ({failedAccounts.length})
                          </h4>
                          {failedAccountsExpanded ? (
                            <ChevronUp size={16} className="text-red-600 dark:text-red-400" />
                          ) : (
                            <ChevronDown size={16} className="text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="flat"
                          color="default"
                          startContent={<Copy size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            copyFailedAccounts();
                          }}
                          className="text-xs"
                        >
                          Copy All
                        </Button>
                      </div>
                    </CardHeader>
                    {failedAccountsExpanded && (
                      <CardBody className="pt-0">
                        <div className="text-xs text-red-700 dark:text-red-300 mb-2">
                          These accounts could not be processed. Please verify the usernames:
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-md p-3 border border-red-200 dark:border-red-700">
                          <div className="font-mono text-sm text-gray-800 dark:text-gray-200 space-y-1">
                            {failedAccounts.map((account, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span>{account}</span>
                                <Button
                                  size="sm"
                                  isIconOnly
                                  variant="light"
                                  onClick={() => navigator.clipboard.writeText(account)}
                                  className="h-6 w-6 min-w-6"
                                >
                                  <Copy size={10} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardBody>
                    )}
                  </Card>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <div className="flex justify-between items-center w-full">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {analysisComplete
                    ? "Analysis completed successfully"
                    : pollingError
                      ? "Analysis failed - please try again"
                      : "Analysis will continue in background"
                  }
                </div>
                <div className="flex gap-2">
                  <Button variant="bordered" onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onClick={onGoto}
                    isDisabled={!analysisComplete || !!pollingError}
                    isLoading={isPolling && !pollingError}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default ContestantListDialog;
