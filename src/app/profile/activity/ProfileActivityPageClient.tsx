'use client';

import { Card, CardBody, CardHeader } from "@nextui-org/react";

interface ProfileActivityPageProps {
  user: Record<string, unknown>;
}

export default function ProfileActivityPageClient({ user: _user }: ProfileActivityPageProps) {
  return (
    <div className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        <Card className="shadow-md border-none mb-6">
          <CardHeader>
            <h1 className="text-xl font-bold">Activity History</h1>
          </CardHeader>
          <CardBody>
            <p className="text-gray-500">
              This feature is currently under development. Please check back later.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
