import type { GithubUser } from "../../typing";

type EventDialogProps = {
  managerId: string;
  visible: boolean;
  onClose: (contestants?: GithubUser[]) => void;
};

type ContestantListDialogProps = {
  dataSource: GithubUser[];
  visible: boolean;
  onClose: () => void;
};

type EventListViewWidgetProps = {
  className?: string;
  managerId: string;
};

export type { EventDialogProps, ContestantListDialogProps, EventListViewWidgetProps };
