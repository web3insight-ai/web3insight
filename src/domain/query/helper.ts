import type { ResponseResult } from "@/types";

import type { StrapiQuery } from "../strapi/typing";
import type { Query } from "./typing";

enum ErrorType {
  Basic = "Basic",
  SigninNeeded = "SigninNeeded",
  ReachMaximized = "ReachMaximized",
}

function resolveQueryListResponseResult(
  { data, ...others }: ResponseResult<StrapiQuery[]>,
): ResponseResult<Query[]> {
  return {
    ...others,
      data: data.map(({ id, documentId, query }) => ({
        id: id.toString(),
        documentId,
        query,
      }),
    )
  };
}

export { ErrorType, resolveQueryListResponseResult };
