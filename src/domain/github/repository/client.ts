import { normalizeRestfulResponse } from "@/clients/http";
import HttpClient from "@/clients/http/HttpClient";

const httpClient = new HttpClient({
  baseUrl: `${process.env.DATA_API_URL}/v1/github/proxy`,
  headers: {
    Authorization: `Bearer ${process.env.DATA_API_TOKEN}`,
  },
  normalizer: normalizeRestfulResponse,
});

export default httpClient;
