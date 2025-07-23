import type { GithubUser } from "../../typing";

type EventDialogPayload = {
  eventId: number;
  contestants: GithubUser[];
};

type EventDialogProps = {
  visible: boolean;
  onClose: (payload?: EventDialogPayload) => void;
};

type ContestantListDialogProps = {
  dataSource: GithubUser[];
  visible: boolean;
  onClose: () => void;
  onGoto: () => void;
};

type EventListViewWidgetProps = {
  className?: string;
};

export type { EventDialogPayload, EventDialogProps, ContestantListDialogProps, EventListViewWidgetProps };
