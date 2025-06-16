import { updateManageableRepositoryMark } from "~/ecosystem/repository";

import { createServiceAdapter } from "../utils";

const { action, loader } = createServiceAdapter("PUT", updateManageableRepositoryMark);

export { action, loader };
