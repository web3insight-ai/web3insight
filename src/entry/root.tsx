import {
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
} from "@remix-run/react";
import { useState } from "react";
import css from "./tailwind.css?url";
import { NextUIProvider } from "@nextui-org/react";
import { getUser } from "#/services/auth/session.server";
import { LoaderFunction } from "@remix-run/node";
import { validateEnvironment } from "#/services/env.server";
import type { StrapiUser } from "#/services/auth/strapi.server";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Web3Insights - Blockchain Analytics",
    },
    {
      name: "description",
      content: "Explore insights on blockchain projects and developers",
    },
  ];
};

export const links = () => [{ rel: "stylesheet", href: css }];

export const loader: LoaderFunction = async ({ request }) => {
  // Validate environment variables
  validateEnvironment();

  // Get user authentication data
  const user = await getUser(request);

  return json({
    user,
  });
};

function App() {
  const { user: initialUser } = useLoaderData<typeof loader>();
  const [user, setUser] = useState<StrapiUser | null>(initialUser);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <NextUIProvider>
          <Outlet context={{ user, setUser }} />
          <ScrollRestoration />
          <Scripts />
        </NextUIProvider>
      </body>
    </html>
  );
}

export default App;
