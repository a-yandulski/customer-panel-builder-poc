// MSW Configuration
export const MSW_CONFIG = {
  // Enable/disable MSW
  enabled: import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === 'true',
  
  // Default delays for responses (in milliseconds)
  delays: {
    min: 100,
    max: 800,
    payment: 1500, // Longer delays for payment processing
    upload: 2000,  // File uploads
  },
  
  // Failure rates for intermittent errors (percentage)
  failureRates: {
    network: 3,      // 3% chance of network timeouts
    server: 8,       // 8% chance of 500 errors
    rateLimit: 5,    // 5% chance of rate limiting
    payment: 5,      // 5% chance of payment gateway errors
    flaky: 50,       // 50% for dedicated flaky endpoint
  },
  
  // Rate limiting configuration
  rateLimit: {
    window: 60000,   // 1 minute window
    maxRequests: 100,
    retryAfter: 60,  // seconds
  },
  
  // Mock user data
  mockUser: {
    id: '1',
    email: 'user@example.com',
    name: 'John Doe',
    role: 'customer',
  },
  
  // Authentication tokens
  tokens: {
    valid: 'mock-jwt-token',
    expired: 'expired-token',
    invalid: 'invalid-token',
  },
  
  // Test accounts for different scenarios
  testAccounts: {
    valid: { email: 'user@example.com', password: 'password123' },
    invalid: { email: 'invalid@example.com', password: 'wrongpassword' },
    locked: { email: 'locked@example.com', password: 'password123' },
  },
  
  // Special test domains
  testDomains: {
    notFound: 'nonexistent',
    restricted: 'restricted-domain',
  },
  
  // Special test payment methods
  testPaymentMethods: {
    declined: 'declined-card',
    valid: 'valid-card',
  },
} as const;

// Utility function to check if MSW should be enabled
export const shouldEnableMSW = (): boolean => {
  // Enable in development by default
  if (import.meta.env.DEV) return true;
  
  // Enable if explicitly set via environment variable
  if (import.meta.env.VITE_ENABLE_MSW === 'true') return true;
  
  // Enable if URL contains msw=true parameter (for testing in production-like environments)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('msw') === 'true';
  }
  
  return false;
};

// Utility to get random delay within configured range
export const getRandomDelay = (type: keyof typeof MSW_CONFIG.delays = 'min'): number => {
  const { min, max } = MSW_CONFIG.delays;
  const specific = MSW_CONFIG.delays[type];
  
  if (typeof specific === 'number' && type !== 'min' && type !== 'max') {
    return specific + Math.floor(Math.random() * 200); // Add some variance
  }
  
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Utility to determine if a request should fail
export const shouldFail = (type: keyof typeof MSW_CONFIG.failureRates): boolean => {
  const rate = MSW_CONFIG.failureRates[type];
  return Math.random() * 100 < rate;
};
