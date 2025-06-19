import type { AppRouter } from "@/server"
import { createClient } from "jstack"

/**
 * Your type-safe API client
 * @see https://jstack.app/docs/backend/api-client
 */
export const client = createClient<AppRouter>({
  baseUrl: `${getBaseUrl()}/api`,
})

function getBaseUrl() {
  // In production, use the production worker
  if (process.env.NODE_ENV === "production") {
    console.log("production", process.env.CF_WORKERS_URL)
    return process.env.CF_WORKERS_URL
  }
 
  // Locally, use wrangler backend
  return `http://localhost:8080`
}
