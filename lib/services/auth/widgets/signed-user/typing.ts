import type { JSXElementConstructor } from "react";
import type { DataValue } from "@/types";

import type { ApiUser } from "../../typing";

type ActionBase = {
  text: string;
  icon: JSXElementConstructor<DataValue>;
  danger?: boolean;
  disabled?: boolean;
};

type LinkAction = {
  action: string;
  renderType?: "link"
};

type ButtonAction = {
  action: (...args: DataValue[]) => void;
  renderType: "button";
};

type ActionItemProps = ActionBase & (LinkAction | ButtonAction);

type SignedUserProps<U = ApiUser | null> = {
  user: U;
  onSignIn: () => void;
  onSignOut: (user: U) => void;
};

export type { ActionItemProps, SignedUserProps };

