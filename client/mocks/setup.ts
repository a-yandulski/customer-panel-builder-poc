import { worker } from "./browser";
import { shouldEnableMSW } from "./config";
import "./test-utils"; // Import test utilities for global access

// Get the base path for the service worker
const getServiceWorkerUrl = (): string => {
  const basePath = import.meta.env.BASE_URL || '/';
  return `${basePath}mockServiceWorker.js`.replace(/\/+/g, '/');
};

// Initialize MSW
export const setupMSW = async (): Promise<void> => {
  if (!shouldEnableMSW()) {
    console.log("🚫 MSW disabled");
    return;
  }

  try {
    await worker.start({
      onUnhandledRequest: "warn", // Warn about unhandled requests
      serviceWorker: {
        url: getServiceWorkerUrl(),
      },
    });

    console.log("🎭 MSW started successfully");
    console.log(`📋 Service Worker URL: ${getServiceWorkerUrl()}`);
    console.log("📋 Available test scenarios:");
    console.log("  • Login with invalid@example.com (401 Unauthorized)");
    console.log("  • Login with locked@example.com (403 Forbidden)");
    console.log('  • Domain ID "nonexistent" (404 Not Found)');
    console.log('  • Domain ID "restricted-domain" (403 Forbidden)');
    console.log('  • Payment method "declined-card" (402 Payment Required)');
    console.log("  • /api/test/network-error (Network Error)");
    console.log("  • /api/test/timeout (Request Timeout)");
    console.log("  • /api/test/flaky (50% failure rate)");
  } catch (error) {
    console.error("❌ Failed to start MSW:", error);
  }
};

// Stop MSW (useful for testing)
export const stopMSW = (): void => {
  if (worker) {
    worker.stop();
    console.log("🛑 MSW stopped");
  }
};

// Reset MSW handlers (useful for testing)
export const resetMSW = (): void => {
  if (worker) {
    worker.resetHandlers();
    console.log("🔄 MSW handlers reset");
  }
};

// Export worker for advanced usage
export { worker };
