# Mock Service Worker (MSW) Setup

This directory contains a comprehensive Mock Service Worker setup for testing various API scenarios, including error conditions, network failures, and edge cases.

## Features

- **Comprehensive Error Scenarios**: 400, 401, 403, 404, 429, 500+ HTTP status codes
- **Network Simulation**: Timeouts, intermittent failures, slow networks
- **Rate Limiting**: Configurable rate limits with proper headers
- **Authentication Testing**: Token expiration, invalid credentials, account lockouts
- **Realistic Delays**: Configurable response delays for different operation types
- **Test Utilities**: Easy-to-use functions for specific test scenarios

## Files Structure

```
client/mocks/
├── handlers.ts       # Main MSW request handlers
├── browser.ts        # Browser MSW setup
├── config.ts         # Configuration and utilities
├── setup.ts          # MSW initialization
├── test-utils.ts     # Testing utilities and scenarios
└── README.md         # This documentation
```

## Getting Started

MSW is automatically initialized when the app starts in development mode. Look for the console message:

```
🎭 MSW started successfully
```

## Available Test Scenarios

### Authentication

| Scenario            | Email                 | Password        | Expected Result  |
| ------------------- | --------------------- | --------------- | ---------------- |
| Valid login         | `user@example.com`    | `password123`   | 200 Success      |
| Invalid credentials | `invalid@example.com` | `wrongpassword` | 401 Unauthorized |
| Locked account      | `locked@example.com`  | `password123`   | 403 Forbidden    |

### Domain Management

| Domain ID           | Expected Result            |
| ------------------- | -------------------------- |
| `1`, `2`, `3`       | 200 Success                |
| `nonexistent`       | 404 Not Found              |
| `restricted-domain` | 403 Forbidden (on updates) |

### Payment Processing

| Payment Method  | Expected Result      |
| --------------- | -------------------- |
| `valid-card`    | 200 Success          |
| `declined-card` | 402 Payment Required |

### Test Endpoints

| Endpoint                  | Purpose                            |
| ------------------------- | ---------------------------------- |
| `/api/test/network-error` | Always throws network error        |
| `/api/test/timeout`       | 30-second delay (triggers timeout) |
| `/api/test/flaky`         | 50% failure rate                   |

## Using Test Utilities

The test utilities are available globally in the browser console:

```javascript
// Force all auth requests to return 401
window.mswTestScenarios.auth.forceUnauthorized();

// Force all API requests to return 500 errors
window.mswTestScenarios.api.forceServerError();

// Force all API requests to be rate limited
window.mswTestScenarios.api.forceRateLimit();

// Force network errors on all requests
window.mswTestScenarios.api.forceNetworkError();

// Make all requests slow (5 second delay)
window.mswTestScenarios.api.forceSlowNetwork(5000);

// Reset all scenarios to defaults
window.mswTestScenarios.reset();
```

### Progressive Failure Testing

Test how your app handles services that fail intermittently:

```javascript
// Simulate an endpoint that fails in stages: Success → Error → Service Unavailable → Success
window.mswUtils.simulateProgressiveFailure(
  "/api/domains",
  [200, 500, 503, 200],
);
```

### Request Logging

Enable detailed request logging:

```javascript
window.mswUtils.enableRequestLogging();
```

## Error Response Examples

### Validation Error (400)

```json
{
  "error": "Validation failed",
  "details": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Rate Limit (429)

```json
{
  "error": "Rate limit exceeded"
}
```

Headers: `Retry-After: 60`, `X-RateLimit-Limit: 100`, `X-RateLimit-Remaining: 0`

### Server Error (500)

```json
{
  "error": "Internal server error. Please try again later."
}
```

## Configuration

Edit `client/mocks/config.ts` to adjust:

- **Failure Rates**: Percentage chance of different error types
- **Response Delays**: Min/max delays for different operations
- **Rate Limiting**: Request limits and time windows
- **Mock Data**: Default user, domain, and billing data

## Intermittent Failures

The handlers include realistic intermittent failure patterns:

- **Network timeouts**: 3% chance
- **Server errors**: 8% chance
- **Rate limiting**: 5% chance
- **Payment failures**: 5% chance

## Disabling MSW

### Via Environment Variable

Set `VITE_ENABLE_MSW=false` in your `.env` file.

### Via URL Parameter

Add `?msw=false` to the URL.

### Programmatically

```javascript
window.mswUtils.disableMocking();
```

## Production Usage

MSW is disabled in production by default. To enable for testing:

1. Set `VITE_ENABLE_MSW=true` environment variable, or
2. Add `?msw=true` to the URL

## Best Practices

1. **Test Error Handling**: Use the error scenarios to ensure your app gracefully handles failures
2. **Test Loading States**: Use slow network simulation to test loading indicators
3. **Test Rate Limiting**: Verify your app properly handles 429 responses
4. **Test Authentication**: Ensure expired tokens are handled correctly
5. **Test Network Failures**: Verify offline/network error scenarios work properly

## Troubleshooting

### MSW Not Starting

- Check console for error messages
- Ensure `/public/mockServiceWorker.js` exists
- Verify browser supports Service Workers

### Requests Not Being Intercepted

- Check if the request URL matches the handlers
- Look for "unhandled request" warnings in console
- Verify MSW is enabled in current environment

### Performance Issues

- Reduce delay ranges in config
- Lower failure rates for faster testing
- Use `reset()` to clear any stuck scenarios
