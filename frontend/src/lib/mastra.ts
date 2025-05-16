import { MastraClient } from "@mastra/client-js";

// Initialize the client with development configuration
export const mastraClient = new MastraClient({
  baseUrl: process.env.NEXT_PUBLIC_MASTRA_API_URL || "http://localhost:4111",
  retries: 3,
  backoffMs: 300,
  maxBackoffMs: 5000,
  headers: {
    "X-Development": "true",
  },
});
