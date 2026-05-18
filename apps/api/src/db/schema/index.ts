import * as apiTables from './api';
import * as dataTables from './data';

// Flat re-export so service code can do `import { api_caches } from '@/db/schema'`.
export * from './api';
export * from './data';

// Combined schema map handed to drizzle({ schema }) — enables the relational
// query API (`db.query.api_caches.findFirst({...})`) and reads in metadata.
export const schema = {
  ...apiTables,
  ...dataTables,
};

export type DB = typeof schema;
