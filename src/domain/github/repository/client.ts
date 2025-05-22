import { normalizeRestfulResponse } from "@/clients/http";
import HttpClient from "@/clients/http/HttpClient";

const httpClient = new HttpClient({
  baseUrl: "https://api.github.com",
  normalizer: normalizeRestfulResponse,
});

export default httpClient;
