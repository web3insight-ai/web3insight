type ContestantDialogProps = {
  managerId: string;
  visible: boolean;
  onClose: (needRefetch?: boolean) => void;
};

type ContestantListViewWidgetProps = {
  className?: string;
  managerId: string;
};

export type { ContestantDialogProps, ContestantListViewWidgetProps };
