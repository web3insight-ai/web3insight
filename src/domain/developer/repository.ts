import type { ResponseResult } from "@/types";
import { isNumeric } from "@/utils";

import { fetchUser, fetchUserById } from "../ossinsight/repository";
import type { Developer } from "./typing";

async function fetchOne(idOrUsername: number | string): Promise<ResponseResult<Developer | null>> {
  const { data, ...others } = isNumeric(idOrUsername) ? await fetchUserById(idOrUsername) : await fetchUser(<string>idOrUsername);
  
  return {
    ...others,
    data: others.success? {
      id: data.id,
      username: data.login,
      nickname: data.name,
      description: data.bio,
      avatar: data.avatar_url,
      location: data.location,
      social: {
        github: data.html_url,
        twitter: data.twitter_username,
        website: data.blog,
      },
    } : null,
  };
}

export { fetchOne };
