import { normalizeRestfulResponse } from "@/clients/http";
import HttpClient from "@/clients/http/HttpClient";

const httpClient = new HttpClient({
  baseUrl: process.env.RSSHUB_URL,
  normalizer: normalizeRestfulResponse,
});

export default httpClient;
