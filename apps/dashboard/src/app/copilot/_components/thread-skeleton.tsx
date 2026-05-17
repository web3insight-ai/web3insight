"use client";

import { Skeleton } from "@/components/ui/skeleton";

function CopilotThreadSkeleton() {
  return (
    <div className="flex w-full h-screen bg-bg">
      <div className="mx-auto flex w-full max-w-[44rem] flex-1 flex-col px-4 pt-6">
        <div className="space-y-5 rounded-[2px] border border-rule bg-bg-raised px-4 py-5">
          <div className="flex justify-end">
            <Skeleton className="h-14 w-[72%] rounded-[2px] bg-bg-sunken" />
          </div>
          <div className="flex justify-start">
            <Skeleton className="h-20 w-[85%] rounded-[2px] bg-bg-sunken" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-12 w-[55%] rounded-[2px] bg-bg-sunken" />
          </div>
        </div>

        <div className="mt-auto pb-6">
          <div className="rounded-[2px] border border-rule bg-bg-raised p-3">
            <Skeleton className="h-16 w-full rounded-[2px] bg-bg-sunken" />
            <div className="mt-3 flex items-center justify-between">
              <Skeleton className="h-8 w-8 rounded-[2px] bg-bg-sunken" />
              <Skeleton className="h-8 w-8 rounded-[2px] bg-bg-sunken" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CopilotThreadSkeleton };
