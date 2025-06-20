import { fetchList, insertOne } from "~/event/repository";

import { createServiceAdapter } from "../utils";

const { loader, action } = createServiceAdapter({
  GET: fetchList,
  POST: insertOne,
});

export { loader, action };
