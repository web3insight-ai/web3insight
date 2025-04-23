import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Card, CardBody, CardHeader } from "@nextui-org/react";

import { getUser } from "~/auth/repository";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get user data
  const userData = await getUser(request);
  if (!userData) {
    return redirect("/");
  }

  return json({ user: userData });
};

export default function ProfileActivityPage() {
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
