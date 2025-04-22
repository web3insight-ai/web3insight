import axios from "axios";

import { getVar } from "../env";

const token = getVar("STRAPI_API_TOKEN");

// Create an axios instance for Strapi API
const httpClient = axios.create({
  baseURL: getVar("STRAPI_API_URL"),
  headers: {
    "Content-Type": "application/json",
  },
});

// Add API token to requests if available
if (token) {
  httpClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export default httpClient;
