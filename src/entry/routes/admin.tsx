import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { isContentManager } from "~/auth/helper";
import { getUser } from "~/auth/repository";

import AdminLayout from "../layouts/admin";

async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);

  if (!isContentManager(user)) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  return json({ user });
}

function AdminLayoutAdapter() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <AdminLayout user={user} />
  );
}

export { loader };
export default AdminLayoutAdapter;
