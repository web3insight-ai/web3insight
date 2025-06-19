import { fetchContestantList, insertContestantList } from "~/event/repository";

import { createServiceAdapter } from "../utils";

const { loader, action } = createServiceAdapter({
  GET: fetchContestantList,
  POST: insertContestantList,
});

export { loader, action };
