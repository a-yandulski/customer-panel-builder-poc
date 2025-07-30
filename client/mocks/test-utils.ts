import { http, HttpResponse } from 'msw';
import { worker } from './browser';

// Test scenario utilities for easy error testing
export const testScenarios = {
  // Authentication scenarios
  auth: {
    // Force all auth requests to return 401
    forceUnauthorized: () => {
      worker.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }),
        http.post('/api/auth/refresh', () => {
          return HttpResponse.json(
            { error: 'Token expired' },
            { status: 401 }
          );
        })
      );
    },
    
    // Force all auth requests to timeout
    forceTimeout: () => {
      worker.use(
        http.post('/api/auth/login', async () => {
          await new Promise(resolve => setTimeout(resolve, 10000));
          return HttpResponse.json({ token: 'timeout-test' });
        })
      );
    },
    
    // Reset to normal auth behavior
    reset: () => {
      worker.resetHandlers();
    },
  },
  
  // API scenarios
  api: {
    // Force all API calls to return 500 errors
    forceServerError: () => {
      worker.use(
        http.get('/api/*', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          );
        }),
        http.post('/api/*', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          );
        }),
        http.put('/api/*', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          );
        }),
        http.delete('/api/*', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );
    },
    
    // Force all API calls to be rate limited
    forceRateLimit: () => {
      worker.use(
        http.get('/api/*', () => {
          return HttpResponse.json(
            { error: 'Rate limit exceeded' },
            { 
              status: 429,
              headers: {
                'Retry-After': '60',
                'X-RateLimit-Limit': '100',
                'X-RateLimit-Remaining': '0',
              },
            }
          );
        })
      );
    },
    
    // Force network errors
    forceNetworkError: () => {
      worker.use(
        http.get('/api/*', () => {
          throw new Error('Network Error');
        }),
        http.post('/api/*', () => {
          throw new Error('Network Error');
        })
      );
    },
    
    // Make all requests extremely slow
    forceSlowNetwork: (delay = 5000) => {
      worker.use(
        http.get('/api/*', async () => {
          await new Promise(resolve => setTimeout(resolve, delay));
          return HttpResponse.json({ message: 'Slow response' });
        })
      );
    },
  },
  
  // Domain-specific scenarios
  domains: {
    // Make domain list always empty
    forceEmptyList: () => {
      worker.use(
        http.get('/api/domains', () => {
          return HttpResponse.json({
            domains: [],
            pagination: { page: 1, totalPages: 0, totalItems: 0 },
          });
        })
      );
    },
    
    // Force validation errors on domain updates
    forceValidationErrors: () => {
      worker.use(
        http.put('/api/domains/:id', () => {
          return HttpResponse.json(
            {
              error: 'Validation failed',
              details: {
                name: ['Invalid domain name'],
                dns: ['Invalid DNS configuration'],
              },
            },
            { status: 400 }
          );
        })
      );
    },
  },
  
  // Billing scenarios
  billing: {
    // Force payment failures
    forcePaymentFailure: () => {
      worker.use(
        http.post('/api/billing/payments', () => {
          return HttpResponse.json(
            { error: 'Payment declined' },
            { status: 402 }
          );
        })
      );
    },
    
    // Force billing service unavailable
    forceServiceUnavailable: () => {
      worker.use(
        http.get('/api/billing/*', () => {
          return HttpResponse.json(
            { error: 'Billing service maintenance' },
            { status: 503 }
          );
        })
      );
    },
  },
  
  // Reset all scenarios
  reset: () => {
    worker.resetHandlers();
    console.log('🔄 All test scenarios reset to defaults');
  },
};

// Utility to simulate progressive loading failures
export const simulateProgressiveFailure = (endpoint: string, stages: number[] = [200, 500, 503, 200]) => {
  let callCount = 0;
  
  worker.use(
    http.get(endpoint, () => {
      const status = stages[callCount % stages.length];
      callCount++;
      
      if (status === 200) {
        return HttpResponse.json({ message: 'Success', callCount });
      }
      
      return HttpResponse.json(
        { error: `Simulated error ${status}`, callCount },
        { status }
      );
    })
  );
};

// Utility to log all intercepted requests
export const enableRequestLogging = () => {
  worker.events.on('request:start', ({ request }) => {
    console.log(`🔍 [${new Date().toISOString()}] ${request.method} ${request.url}`);
  });
  
  worker.events.on('response:mocked', ({ request, response }) => {
    console.log(`📨 [${new Date().toISOString()}] ${request.method} ${request.url} → ${response.status}`);
  });
};

// Utility to disable all mocking (useful for testing real API)
export const disableMocking = () => {
  worker.stop();
  console.log('🚫 MSW stopped - requests will hit real API');
};

// Utility to re-enable mocking
export const enableMocking = async () => {
  await worker.start();
  console.log('✅ MSW restarted - requests will be mocked');
};

// Export for global access in browser console
if (typeof window !== 'undefined') {
  (window as any).mswTestScenarios = testScenarios;
  (window as any).mswUtils = {
    simulateProgressiveFailure,
    enableRequestLogging,
    disableMocking,
    enableMocking,
  };
  
  console.log('🧪 MSW test utilities available on window.mswTestScenarios and window.mswUtils');
}
