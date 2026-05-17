import { build } from 'esbuild';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const OUTPUT_ROOT = join(ROOT, '.vercel/output');
const FUNCTIONS_ROOT = join(OUTPUT_ROOT, 'functions');

type Entry = {
  /** Source .ts file relative to apps/api */
  in: string;
  /** Logical function path used in URLs and routes (e.g. "api/hono") */
  funcPath: string;
  memory: number;
  maxDuration: number;
};

// Reason: source files live under src/serverless/ (not apps/api/api/) so the
// Vercel pipeline cannot autodetect them as serverless functions and trigger
// its own per-file install (which fails on workspace:* refs). The output paths
// under .vercel/output/functions/api/... are still what determines the URL.
const entries: Entry[] = [
  {
    in: 'src/serverless/api-hono.ts',
    funcPath: 'api/hono',
    memory: 1024,
    maxDuration: 60,
  },
  {
    in: 'src/serverless/cron-cache-clear.ts',
    funcPath: 'api/cron/cache-clear',
    memory: 512,
    maxDuration: 300,
  },
];

async function main() {
  await rm(OUTPUT_ROOT, { recursive: true, force: true });
  await mkdir(FUNCTIONS_ROOT, { recursive: true });

  await Promise.all(
    entries.map(async (entry) => {
      const funcDir = join(FUNCTIONS_ROOT, `${entry.funcPath}.func`);
      await mkdir(funcDir, { recursive: true });

      await build({
        entryPoints: [join(ROOT, entry.in)],
        outfile: join(funcDir, 'index.js'),
        bundle: true,
        platform: 'node',
        target: 'node22',
        format: 'cjs',
        sourcemap: 'inline',
        tsconfig: join(ROOT, 'tsconfig.json'),
        // Reason: optional NestJS peers + native pg that aren't installed and
        // aren't needed for our runtime path.
        external: [
          'pg-native',
          '@nestjs/websockets/socket-module',
          '@nestjs/microservices',
          '@nestjs/microservices/microservices-module',
          'class-transformer/storage',
        ],
        // Reason: bundle every workspace + npm dep into a self-contained file
        // so the Vercel Node runtime never needs a second-pass pnpm install
        // (workspace:* refs always fail in that sandbox).
        packages: 'bundle',
        logLevel: 'info',
      });

      // Build Output API vc-config — tells Vercel runtime, memory, timeouts.
      const vcConfig = {
        runtime: 'nodejs22.x',
        handler: 'index.js',
        launcherType: 'Nodejs',
        shouldAddHelpers: false,
        supportsResponseStreaming: true,
        memory: entry.memory,
        maxDuration: entry.maxDuration,
      };
      await writeFile(
        join(funcDir, '.vc-config.json'),
        JSON.stringify(vcConfig, null, 2),
      );
    }),
  );

  // Build Output API config — routes incoming requests onto our functions.
  // /api/cron/* stays on its own function (matches Vercel Cron path).
  // Everything else funnels into api/hono with ?path= so the Hono router can
  // reconstruct the original URL.
  const config = {
    version: 3,
    routes: [
      { src: '^/api/cron/(.*)$', dest: '/api/cron/$1' },
      { src: '^/(.*)$', dest: '/api/hono?path=/$1' },
    ],
  };
  await writeFile(
    join(OUTPUT_ROOT, 'config.json'),
    JSON.stringify(config, null, 2),
  );

  console.log(
    '[bundle-functions] wrote',
    entries.length,
    'functions to',
    OUTPUT_ROOT,
  );
}

main().catch((err) => {
  console.error('[bundle-functions]', err);
  process.exit(1);
});
