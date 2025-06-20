import { fetchOne } from "~/event/repository";

import { createServiceAdapter } from "../utils";

const { loader } = createServiceAdapter("GET", fetchOne, ({ params }) => params.id);

export { loader };
