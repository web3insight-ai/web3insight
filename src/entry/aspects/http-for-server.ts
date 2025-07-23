import type { DataValue } from "@/types";
import { type ResponseResult, isServerSide } from "@/clients/http";

import selfBuildClient from "~/api/repository/client";
import githubClient from "~/github/repository/client";
import ossinsightClient from "~/ossinsight/repository/client";

const serverAvailableHttpClients = [selfBuildClient, githubClient, ossinsightClient];

let alreadySet = false;

function handleResponse(res: ResponseResult, _: DataValue, rawRes: Response) {
  if (isServerSide()) {
    const outputText = `[HTTP] ${rawRes.status} ${rawRes.url}`;

    if (res.success) {
      console.log(outputText);
    } else {
      console.error(`${outputText}: ${res.message}`);
    }
  }

  return res;
}

function setInterceptorsForServerSideHttpClients() {
  if (alreadySet) {
    return;
  }

  serverAvailableHttpClients.forEach(httpClient => {
    httpClient.use(handleResponse);
  });

  alreadySet = true;
}

export default setInterceptorsForServerSideHttpClients;
