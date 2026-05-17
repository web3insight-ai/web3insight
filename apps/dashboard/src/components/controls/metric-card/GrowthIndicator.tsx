import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function GrowthIndicator({ value, positive = false }: { value: string, positive?: boolean }) {
  return (
    <div className={`flex items-center gap-1 text-xs ${positive ? "text-success" : "text-danger"}`}>
      {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      <span>{value}</span>
    </div>
  );
}

export default GrowthIndicator;
