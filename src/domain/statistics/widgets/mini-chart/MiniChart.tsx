function MiniChartWidget({ data, color = "primary", height = 40 }: { data: number[], color?: string, height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  return (
    <div className="w-full h-full" style={{ height: `${height}px` }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${data.length} ${range || 1}`} preserveAspectRatio="none">
        <path
          d={data.map((d, i) => `${i === 0 ? "M" : "L"} ${i} ${max - d + min}`).join(" ")}
          fill="none"
          stroke={`var(--${color})`}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-80"
        />
      </svg>
    </div>
  );
}

export default MiniChartWidget;