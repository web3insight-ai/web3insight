import axios from "axios";

// Create an axios instance for Strapi API
const httpClient = axios.create({
  baseURL: process.env.STRAPI_API_URL || "http://localhost:1337",
  headers: {
    "Content-Type": "application/json",
  }
});

// Add API token to requests if available
if (process.env.STRAPI_API_TOKEN) {
  httpClient.defaults.headers.common["Authorization"] = `Bearer ${process.env.STRAPI_API_TOKEN}`;
}

export default httpClient;
