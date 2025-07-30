// Production fallback - stub MSW functions when not available
export const setupMSW = async (): Promise<void> => {
  console.log("🚫 MSW disabled in production build");
  return Promise.resolve();
};

export const stopMSW = (): void => {
  // No-op in production
};

export const resetMSW = (): void => {
  // No-op in production
};

export const worker = null;
