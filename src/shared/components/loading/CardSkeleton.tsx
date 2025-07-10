import { Card, CardBody, Skeleton } from "@nextui-org/react";

interface CardSkeletonProps {
  count?: number;
}

function CardSkeleton({ count = 4 }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card 
          key={index} 
          className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark"
        >
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="p-3 w-12 h-12 rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-3 w-20 mb-2 rounded" />
                <Skeleton className="h-6 w-16 rounded" />
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export default CardSkeleton;
