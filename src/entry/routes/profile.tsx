import { Button, Card, CardBody, CardHeader, Avatar, Divider } from "@nextui-org/react";
import { LoaderFunctionArgs, MetaFunction, json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Activity, KeyRound } from "lucide-react";
import { getUser } from "~/services/auth/session.server";
import { useAtom } from "jotai";
import { authModalOpenAtom, authModalTypeAtom } from "~/atoms";
import DefaultLayout from "~/layouts/default";
import { fetchUserQueries } from "~/services/strapi";

export const meta: MetaFunction = () => {
  return [
    { title: "My Profile | Web3Insights" },
    { name: "description", content: "Manage your Web3Insights profile" },
  ];
};

// Define query history type
type QueryHistory = {
  query: string;
  id: string;
  documentId: string;
}[];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get user data
  const user = await getUser(request);
  if (!user) {
    return redirect("/");
  }

  let history: QueryHistory = [];

  // Fetch user's query history from Strapi if user is logged in
  if (user && user.id) {
    const userQueries = await fetchUserQueries(user.id, 10);
    history = userQueries.map(query => ({
      id: query.id.toString(),
      documentId: query.documentId,
      query: query.query || "Untitled query"
    })).filter(item => item.query); // Filter out any potentially invalid items
  }

  return json({
    user,
    history
  });
};

export default function ProfilePage() {
  const { user, history } = useLoaderData<typeof loader>();
  const [, setAuthModalOpen] = useAtom(authModalOpenAtom);
  const [, setAuthModalType] = useAtom(authModalTypeAtom);

  // Function to open auth modal with 'resetPassword' type
  const openChangePasswordModal = () => {
    setAuthModalType('resetPassword');
    setAuthModalOpen(true);
  };

  return (
    <DefaultLayout history={history} user={user}>
      <div className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full">
          <Card className="shadow-md border-none mb-6">
            <CardHeader className="flex gap-4 items-center">
              <Avatar
                name={user.username?.substring(0, 1).toUpperCase() || "U"}
                size="lg"
                color="primary"
                isBordered
              />
              <div className="flex flex-col">
                <p className="text-lg font-bold">{user.username || "User"}</p>
                <p className="text-sm text-gray-500">{user.email || "No email provided"}</p>
                <div className="flex items-center mt-1">
                  <span className={`inline-block h-2 w-2 rounded-full mr-2 ${user.confirmed ? 'bg-success' : 'bg-warning'}`}></span>
                  <span className="text-xs text-gray-500">{user.confirmed ? 'Verified' : 'Pending verification'}</span>
                </div>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  as={Link}
                  to="/profile/activity"
                  variant="flat"
                  color="secondary"
                  startContent={<Activity size={18} />}
                  className="justify-start"
                >
                  Activity History
                </Button>

                <Button
                  variant="flat"
                  color="warning"
                  startContent={<KeyRound size={18} />}
                  className="justify-start"
                  onPress={openChangePasswordModal}
                >
                  Change Password
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-md border-none">
            <CardHeader>
              <h2 className="text-xl font-bold">Account Summary</h2>
            </CardHeader>
            <Divider />
            <CardBody className="py-5">
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-semibold text-gray-700">Account Details</h3>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="text-gray-500">Username:</span> {user.username || "N/A"}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Email:</span> {user.email || "N/A"}
                    </div>
                    {user.createdAt && (
                      <div className="text-sm">
                        <span className="text-gray-500">Account Created:</span> {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    )}
                    {user.updatedAt && (
                      <div className="text-sm">
                        <span className="text-gray-500">Last Updated:</span> {new Date(user.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}
