import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { contract } from '@web3insight/api-contract';

let cachedSpec: object | null = null;

export async function getOpenApiSpec(): Promise<object> {
  if (cachedSpec) return cachedSpec;
  const generator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
  });
  const spec = (await generator.generate(contract, {
    info: {
      title: 'Web3Insight API',
      version: '2.0.0',
      description:
        'Hono runtime — oRPC contract-first API for Web3Insight ecosystem analytics. ' +
        'Pass `Authorization: Bearer <JWT>` for any endpoint that returns user-scoped data.',
    },
    // Reason: Scalar "Try it" sends HTTP requests against the URLs in the
    // spec; oRPC contract paths are REST-shaped (e.g. /repos/total) and
    // served by the OpenAPIHandler shim under /v1. /rpc is the binary
    // oRPC protocol and would 404 every "Try it" request.
    servers: [
      { url: '/v1', description: 'REST compatibility shim (OpenAPIHandler)' },
    ],
  })) as Record<string, unknown>;

  // Reason: oRPC's OpenAPIGenerator doesn't surface security schemes from
  // contract metadata, so the Scalar Try-It form has no Authorization input.
  // Inject a global bearerAuth scheme post-hoc — anonymous calls still
  // succeed since the auth middleware is best-effort (see auth.ts:41-44),
  // but the input now lets external users paste their JWT.
  const components = (spec.components ?? {}) as Record<string, unknown>;
  const securitySchemes = (components.securitySchemes ?? {}) as Record<
    string,
    unknown
  >;
  spec.components = {
    ...components,
    securitySchemes: {
      ...securitySchemes,
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Service token (`DATA_API_TOKEN`) or a user JWT minted by `auth.privyTokenAuth`. Most read endpoints are also reachable anonymously.',
      },
    },
  };
  spec.security = [{ bearerAuth: [] }];

  cachedSpec = spec;
  return cachedSpec;
}
