import { redirect, json } from "@remix-run/node";
import { generateFailedResponse } from "@/clients/http";

// This route only supports GitHub OAuth authentication
// All traditional email/password auth methods are disabled
export async function action() {
  return json(generateFailedResponse("Traditional authentication is not supported. Please use GitHub OAuth.", 400), { status: 400 });
}

// No loader or component needed for this route
export default function Auth() {
  return redirect("/");
}
