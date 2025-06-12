import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { isAdmin } from "~/auth/helper";
import { getUser } from "~/auth/repository";

import AdminLayout from "../layouts/admin";

async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);

  if (!isAdmin(user)) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  return json({ user });
}

function SettingsLayoutAdapter() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <AdminLayout user={user} settings />
  );
}

export { loader };
export default SettingsLayoutAdapter;
