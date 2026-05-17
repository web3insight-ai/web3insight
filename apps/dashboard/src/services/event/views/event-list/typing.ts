import type { GithubUser } from "../../typing";

type EventDialogPayload = {
  eventId: number;
  contestants: GithubUser[];
  failedAccounts?: string[];
};

type EventDialogProps = {
  visible: boolean;
  onClose: (payload?: EventDialogPayload) => void;
};

type ContestantListDialogProps = {
  dataSource: GithubUser[];
  eventId: number;
  failedAccounts?: string[];
  visible: boolean;
  onClose: () => void;
  onGoto: () => void;
};

type EventListViewWidgetProps = {
  className?: string;
};

export type { EventDialogPayload, EventDialogProps, ContestantListDialogProps, EventListViewWidgetProps };
