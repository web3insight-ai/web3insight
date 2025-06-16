import { fetchManageableRepositoryList } from "~/ecosystem/repository";

import { createServiceAdapter } from "../utils";

const { loader } = createServiceAdapter("GET", fetchManageableRepositoryList);

export { loader };
