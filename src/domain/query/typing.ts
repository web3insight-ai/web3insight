import type { StrapiQuery } from "../strapi/typing";

type Query = Pick<StrapiQuery, "documentId" | "query"> & {
  id: string;
};

export type { Query };
