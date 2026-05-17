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
    servers: [{ url: '/rpc', description: 'Hono RPC endpoint' }],
  });
  return cachedSpec;
}
