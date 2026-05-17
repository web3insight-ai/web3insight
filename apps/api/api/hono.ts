import { createApp } from '../src/app/create-app';
import { getContainer } from '../src/app/container';
import { env } from '../src/config/env';

const app = createApp({
  container: getContainer(env),
  jwtSecret: env.JWT_SECRET,
});

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const original = url.searchParams.get('path');
  if (original) {
    url.searchParams.delete('path');
    url.pathname = original.startsWith('/') ? original : `/${original}`;
    return app.fetch(new Request(url, req));
  }
  return app.fetch(req);
}

export const config = {
  runtime: 'nodejs',
};
