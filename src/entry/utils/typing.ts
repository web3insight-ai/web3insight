import type { ActionFunctionArgs } from "@remix-run/node";
import type { DataValue, ResponseResult } from "@/types";

type RequestMethod = "OPTIONS" | "GET" | "POST" | "PUT" | "DELETE";
type AllowedMethods = RequestMethod | "*" | RequestMethod[];

type RepositoryService = (...args: DataValue[]) => Promise<ResponseResult>;

type RepositoryServiceMap = Partial<Record<RequestMethod, RepositoryService>>;

type RepositoryServiceAdapter = {
  loader: (ctx: ActionFunctionArgs) => Promise<DataValue>;
  action?: (ctx: ActionFunctionArgs) => Promise<DataValue>;
};

export type { RequestMethod, AllowedMethods, RepositoryService, RepositoryServiceMap, RepositoryServiceAdapter };
