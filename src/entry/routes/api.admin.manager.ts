import { updateManager } from "~/admin/repository";

import { createServiceAdapter } from "../utils";

const { action, loader } = createServiceAdapter("PUT", updateManager);

export { action, loader };
