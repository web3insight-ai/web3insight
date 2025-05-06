import HttpClient from "@/clients/http/HttpClient";

const httpClient = new HttpClient({ baseUrl: process.env.OSSINSIGHT_URL });

export default httpClient;
