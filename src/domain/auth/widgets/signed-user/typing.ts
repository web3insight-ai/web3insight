import type { JSXElementConstructor } from "react";
import type { DataValue } from "@/types";

import type { User } from "../../../strapi/typing";

type ActionBase = {
  text: string;
  icon: JSXElementConstructor<DataValue>;
  danger?: boolean;
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

type SignedUserProps<U = User | null> = {
  user: U;
  onSignIn: () => void;
  onSignOut: (user: U) => void;
  onResetPassword: () => void;
};

export type { ActionItemProps, SignedUserProps };

