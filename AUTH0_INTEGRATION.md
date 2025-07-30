# Auth0 Integration Guide

This document provides a comprehensive guide for the Auth0 integration implemented in the Customer Panel application.

## Overview

The application now includes complete Auth0 integration with:

- **Secure Authentication**: Enterprise-grade Auth0 Universal Login
- **Protected Routes**: Role-based access control for different sections
- **Responsive Navigation**: Mobile-first design with accessible drawer navigation
- **Token Management**: Automatic token refresh and API integration
- **Mock Development**: MSW integration for local development

## Features Implemented

### 🔐 Authentication System

- Auth0 Universal Login integration
- JWT token management with automatic refresh
- Secure logout with session cleanup
- Protected route wrapper with role-based access

### 🎨 User Interface

- Responsive navigation bar with user profile dropdown
- Mobile drawer with slide-out navigation (300ms ease-out animations)
- User avatar display with fallback initials
- Loading states for authentication checks

### ♿ Accessibility Features

- Full keyboard navigation support
- ARIA roles and labels for screen readers
- Focus trap in mobile drawer
- Escape key to close drawer
- Tab navigation between elements

### 🛡️ Security Features

- Token storage in Auth0's secure cache
- Automatic token refresh before expiration
- API request interceptors with token injection
- Logout with complete session cleanup

## File Structure

```
client/
├── contexts/
│   └── AuthContext.tsx          # Auth0 provider and hooks
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx   # Route protection component
│   └── layout/
│       ├── AppShell.tsx         # Main layout wrapper
│       └── TopNavigation.tsx    # Navigation with Auth0 integration
├── lib/
│   └── api.ts                   # API client with token management
├── pages/
│   ├── Login.tsx                # Auth0 Universal Login page
│   └── Dashboard.tsx            # Protected dashboard with user data
└���─ mocks/
    └── handlers.ts              # MSW mock handlers for Auth0
```

## Environment Configuration

### Required Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id_here
VITE_AUTH0_AUDIENCE=https://api.customerpanel.example.com

# Development Mode
VITE_APP_MODE=development  # Use 'production' for live Auth0
```

### Auth0 Dashboard Setup

1. **Create Auth0 Application**:

   - Application Type: Single Page Application
   - Allowed Callback URLs: `http://localhost:8080`
   - Allowed Logout URLs: `http://localhost:8080`
   - Allowed Web Origins: `http://localhost:8080`

2. **Configure API**:
   - Create an API with identifier: `https://api.customerpanel.example.com`
   - Add required scopes:
     - `profile:read`, `profile:write`
     - `domains:read`, `domains:write`
     - `invoices:read`
     - `tickets:read`, `tickets:write`
     - `notifications:read`

## Usage Examples

### Using the Auth Hook

```tsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={loginWithRedirect}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={() => logout({ returnTo: window.location.origin })}>
        Logout
      </button>
    </div>
  );
}
```

### Making Authenticated API Calls

```tsx
import { useApi } from "@/lib/api";

function DataComponent() {
  const { api } = useApi();

  const fetchUserData = async () => {
    try {
      const userData = await api.get("/user/profile");
      console.log(userData);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return <button onClick={fetchUserData}>Load Data</button>;
}
```

### Protecting Routes

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Protect entire route
<Route
  path="/billing"
  element={
    <ProtectedRoute requiredScopes={["invoices:read"]}>
      <BillingPage />
    </ProtectedRoute>
  }
/>

// Protect component with custom scopes
<ProtectedRoute requiredScopes={["domains:write"]}>
  <DomainEditForm />
</ProtectedRoute>
```

## Development vs Production

### Development Mode (Default)

- Uses MSW (Mock Service Worker) for Auth0 API responses
- Mock user data for testing
- No actual Auth0 authentication required
- Perfect for local development and testing

### Production Mode

- Set `VITE_APP_MODE=production` in environment
- Uses real Auth0 authentication
- Requires valid Auth0 configuration
- Full security and token management

## Navigation Features

### Desktop Navigation

- Horizontal navigation bar with hover effects
- User profile dropdown with avatar
- Active route highlighting
- Notification center integration

### Mobile Navigation

- Hamburger menu with slide-out drawer
- Touch-friendly 44px minimum touch targets
- User profile section in drawer footer
- Quick actions section
- Backdrop overlay with fade transition

### Accessibility

- **Keyboard Navigation**: Full tab support through all interactive elements
- **Screen Readers**: ARIA labels and roles for all navigation elements
- **Focus Management**: Focus trap in mobile drawer, restore focus on close
- **High Contrast**: Proper color contrast ratios for all text
- **Motion**: Respects `prefers-reduced-motion` for animations

## Testing

### Manual Testing Checklist

- [ ] Login redirects to Auth0 Universal Login
- [ ] Successful login redirects to dashboard
- [ ] Protected routes require authentication
- [ ] User profile displays in navigation
- [ ] Mobile drawer opens/closes correctly
- [ ] Logout clears session and redirects
- [ ] Token refresh works automatically
- [ ] API calls include authentication headers

### Mock Data Testing

- Default mock user: John Doe (john.doe@example.com)
- Mock authentication flows
- Simulated token refresh scenarios
- Error handling for failed requests

## Security Considerations

### Token Storage

- Tokens stored in Auth0's secure cache (not localStorage)
- Automatic token refresh before expiration
- Secure transmission over HTTPS only

### API Security

- All API requests include Bearer token
- Automatic retry with token refresh on 401 errors
- Request timeout and error handling

### Route Protection

- Client-side route protection for UX
- Server-side validation required for security
- Role-based access control support

## Troubleshooting

### Common Issues

1. **"Authentication Error" on Login**

   - Check Auth0 domain and client ID in environment variables
   - Verify callback URLs in Auth0 dashboard
   - Ensure HTTPS in production

2. **Token Refresh Failures**

   - Check Auth0 API configuration
   - Verify audience parameter matches API identifier
   - Review browser console for detailed errors

3. **Mobile Drawer Not Working**

   - Check for JavaScript errors in console
   - Verify touch event handlers are working
   - Test keyboard accessibility (Tab/Escape keys)

4. **API Calls Failing**
   - Verify token is being included in requests
   - Check network tab for request details
   - Ensure API endpoints match expected format

### Debug Mode

Enable debug logging by setting `VITE_DEBUG=true` in environment variables.

## Next Steps

### Recommended Enhancements

1. **Multi-Factor Authentication**: Enable MFA in Auth0 dashboard
2. **Social Logins**: Add Google, Microsoft, or other social providers
3. **Role-Based UI**: Show/hide features based on user roles
4. **Session Management**: Implement session timeout warnings
5. **Analytics**: Track authentication events and user flows

### Performance Optimizations

1. **Code Splitting**: Lazy load authentication components
2. **Caching**: Implement user data caching strategies
3. **Preloading**: Preload protected routes after authentication
4. **Bundle Optimization**: Tree-shake unused Auth0 features

This integration provides a solid foundation for enterprise-grade authentication while maintaining excellent user experience and accessibility standards.
