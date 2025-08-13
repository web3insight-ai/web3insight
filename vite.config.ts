import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      remix({
        appDirectory: "src/entry",
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_lazyRouteDiscovery: true,
          v3_singleFetch: true,
        },
      }),
      tsconfigPaths(),
    ],
    define: {
      // Make env vars available to client code by prefixing with 'import.meta.env.'
      'import.meta.env.VITE_ORIGIN_CLIENT_ID': JSON.stringify(env.VITE_ORIGIN_CLIENT_ID),
      'import.meta.env.VITE_ORIGIN_API_URL': JSON.stringify(env.VITE_ORIGIN_API_URL),
      'import.meta.env.VITE_ORIGIN_SUBGRAPH_URL': JSON.stringify(env.VITE_ORIGIN_SUBGRAPH_URL),
    },
  };
});
