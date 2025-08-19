import HttpClient from './HttpClient';

// Create default HTTP client instance
const defaultHttpClient = new HttpClient({
  timeout: 10000,
});

export default defaultHttpClient;
