import { json } from "@remix-run/node";

import type { StrapiUser } from "~/strapi/typing";
import { isAdmin } from "~/auth/helper";

async function loader() {
  if (!isAdmin({ id: -1 } as StrapiUser)) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  return json({});
}

export { loader };
export { default } from "../layouts/admin";
