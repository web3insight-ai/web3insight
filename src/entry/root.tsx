import {
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
} from '@remix-run/react';
import { useState } from 'react';
import css from './tailwind.css?url';
import { NextUIProvider } from '@nextui-org/react';
import { getUser } from '~/auth/repository';
import { LoaderFunction } from '@remix-run/node';
import { validateEnvironment } from '@/utils/env';
import type { ApiUser } from '~/auth/typing';
import NavigationProgress from './components/NavigationProgress';
import { WalletProvider } from '@/providers/WalletProvider';

import { getTitle } from '@/utils/app';
import { useLanguageInit } from '@/utils/useLanguageInit';
import { ThemeProvider } from 'next-themes';

export const meta: MetaFunction = () => {
  return [
    {
      title: `${getTitle()} - Blockchain Analytics`,
    },
    {
      name: 'description',
      content: 'Explore insights on blockchain projects and developers',
    },
  ];
};

export const links = () => [{ rel: 'stylesheet', href: css }];

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
  const [user, setUser] = useState<ApiUser | null>(initialUser);

  // Initialize language preference based on browser locale
  useLanguageInit();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          defer
          src="https://umami.web3insight.ai/script.js"
          data-website-id="b036732f-4406-4778-90cc-2e4002b5e13b"
        />
      </head>
      <body>
        <NextUIProvider>
          <ThemeProvider
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <WalletProvider>
              <NavigationProgress />
              <Outlet context={{ user, setUser }} />
              <ScrollRestoration />
              <Scripts />
            </WalletProvider>
          </ThemeProvider>
        </NextUIProvider>
      </body>
    </html>
  );
}

export default App;
