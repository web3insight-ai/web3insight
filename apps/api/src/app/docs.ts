import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { contract } from '@web3insight/api-contract';

let cachedSpec: object | null = null;

export async function getOpenApiSpec(): Promise<object> {
  if (cachedSpec) return cachedSpec;
  const generator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
  });
  cachedSpec = await generator.generate(contract, {
    info: {
      title: 'Web3Insight API',
      version: '2.0.0',
      description:
        'Hono runtime — oRPC contract-first API for Web3Insight ecosystem analytics.',
    },
    // Reason: Scalar "Try it" sends HTTP requests against the URLs in the
    // spec; oRPC contract paths are REST-shaped (e.g. /repos/total) and
    // served by the OpenAPIHandler shim under /v1. /rpc is the binary
    // oRPC protocol and would 404 every "Try it" request.
    servers: [
      { url: '/v1', description: 'REST compatibility shim (OpenAPIHandler)' },
    ],
  });
  return cachedSpec;
}
