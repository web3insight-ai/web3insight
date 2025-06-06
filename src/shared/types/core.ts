interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export type { StrapiUser };
export type {
  DataValue, ListValue,
  ViewFieldDescriptor, ViewDescriptor, FilterDescriptor, FieldRendererProps, ClientAction,
} from "@handie/runtime-core";
