import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// Configure the service worker with all handlers
export const worker = setupWorker(...handlers);

// Enhanced logging for development
if (import.meta.env.DEV) {
  worker.events.on("request:start", ({ request }) => {
    console.log("🔄 MSW intercepted:", request.method, request.url);
  });

  worker.events.on("request:match", ({ request }) => {
    console.log("✅ MSW matched:", request.method, request.url);
  });

  worker.events.on("request:unhandled", ({ request }) => {
    console.log("⚠️ MSW unhandled:", request.method, request.url);
  });

  worker.events.on("response:mocked", ({ request, response }) => {
    console.log(
      "📨 MSW mocked response:",
      request.method,
      request.url,
      "→",
      response.status,
    );
  });
}
