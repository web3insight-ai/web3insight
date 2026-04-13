interface CardSkeletonProps {
  count?: number;
}

function CardSkeleton({ count = 4 }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative border border-rule bg-bg-raised rounded-[2px] p-5"
        >
          <span className="absolute top-0 left-0 -translate-y-1/2 translate-x-3 bg-bg px-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
            loading
          </span>
          <div className="flex flex-col gap-3">
            <span className="loading-skeleton h-[11px] w-20 rounded-[2px]" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl text-fg-muted">—</span>
              <span
                aria-hidden
                className="animate-cursor inline-block h-[0.85em] w-[0.55ch] translate-y-[1px] bg-accent align-middle"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardSkeleton;
