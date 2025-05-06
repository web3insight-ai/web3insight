import HttpClient from "@/clients/http/HttpClient";

const httpClient = new HttpClient({ baseUrl: process.env.RSS3_DSL_URL });

export default httpClient;
