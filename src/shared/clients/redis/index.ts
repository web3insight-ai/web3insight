import { Redis } from "ioredis";

import { getVar } from "../../utils/env";

const redis = new Redis(getVar("REDIS_URL") as string);

export default redis;
