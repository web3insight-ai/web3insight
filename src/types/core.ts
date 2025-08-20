// Types previously from @handie/runtime-core, now defined locally
export type DataValue = string | number | boolean | null | undefined | DataValue[] | { [key: string]: DataValue };

export interface ViewFieldDescriptor {
  name: string;
  label?: string;
  type?: string;
  required?: boolean;
  readonly?: boolean;
  [key: string]: unknown;
}

export interface ViewDescriptor {
  name: string;
  fields: ViewFieldDescriptor[];
  [key: string]: unknown;
}

export interface FieldRendererProps {
  field: ViewFieldDescriptor;
  value?: DataValue;
  onChange?: (value: DataValue) => void;
  [key: string]: unknown;
}

export interface ClientAction {
  type: string;
  payload?: unknown;
}
