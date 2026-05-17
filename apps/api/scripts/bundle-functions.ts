import { build } from "esbuild";
import { rm } from "node:fs/promises";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

async function main() {
  const entries = [
    { in: "api/hono.ts", out: "api/hono.js" },
    { in: "api/cron/cache-clear.ts", out: "api/cron/cache-clear.js" },
  ];

  // Reason: clean previous bundle artifacts so esbuild metafile reflects only this run
  for (const e of entries) {
    await rm(join(ROOT, e.out), { force: true });
  }

  await Promise.all(
    entries.map(({ in: entry, out }) =>
      build({
        entryPoints: [join(ROOT, entry)],
        outfile: join(ROOT, out),
        bundle: true,
        platform: "node",
        target: "node22",
        format: "cjs",
        sourcemap: "inline",
        // Reason: NestJS decorators need experimentalDecorators + emitDecoratorMetadata.
        // esbuild honors these when set in the tsconfig it resolves, but also accept
        // them inline to be explicit.
        tsconfig: join(ROOT, "tsconfig.json"),
        // Reason: optional peer deps that aren't installed in this monorepo
        // (we don't use websockets/microservices/native pg/storage helpers).
        // Everything else (incl. @nestjs/swagger + class-validator) inlines.
        external: [
          "pg-native",
          "@nestjs/websockets/socket-module",
          "@nestjs/microservices",
          "@nestjs/microservices/microservices-module",
          "class-transformer/storage",
        ],
        // Reason: bundle every workspace dep + every npm dep into the output so
        // Vercel @vercel/node builder doesn't try to pnpm install in its sandbox
        // (workspace:* refs fail there). After bundling, the .js file has zero
        // runtime imports except pg-native.
        packages: "bundle",
        logLevel: "info",
      }),
    ),
  );
}

main().catch((err) => {
  console.error("[bundle-functions]", err);
  process.exit(1);
});
