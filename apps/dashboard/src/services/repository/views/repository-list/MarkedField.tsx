import { resolveCustomMarkText } from "../../helper";

function MarkedField({ value }: { value: number | string; }) {
  return resolveCustomMarkText(value);
}

export default MarkedField;
