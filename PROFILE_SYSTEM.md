# Profile and Account Management System

This document provides a comprehensive overview of the profile and account management system implemented in the Customer Panel application.

## Overview

The profile and account management system provides users with comprehensive control over their personal information, security settings, and account preferences. The system is built with React Hook Form for validation, TypeScript for type safety, and MSW for realistic API simulation.

## Architecture

### Core Components

#### Hooks (`client/hooks/useProfile.ts`)

- **useProfile()** - Manages user profile data (name, email, phone, company)
- **useAddress()** - Handles billing and legal address management
- **usePasswordChange()** - Provides password change functionality with strength validation
- **useTwoFactor()** - Manages two-factor authentication setup and verification
- **useSecurity()** - Fetches and displays security status information

#### Form Components

- **ProfileForm** (`client/components/account/ProfileForm.tsx`) - Personal information editing
- **AddressForm** (`client/components/account/AddressForm.tsx`) - Billing and legal address management
- **PasswordChangeForm** (`client/components/account/PasswordChangeForm.tsx`) - Password change with strength meter
- **TwoFactorAuth** (`client/components/account/TwoFactorAuth.tsx`) - 2FA setup and management
- **SecurityStatus** (`client/components/account/SecurityStatus.tsx`) - Security overview and recommendations

#### Main Page

- **Account** (`client/pages/Account.tsx`) - Main account management interface with tabbed navigation

### API Endpoints

All profile-related endpoints are implemented in MSW handlers (`client/mocks/handlers.ts`):

#### Profile Management

- `GET /api/user/profile` - Fetch user profile information
- `PUT /api/user/profile` - Update user profile with validation

#### Address Management

- `GET /api/user/address` - Fetch billing and legal addresses
- `PUT /api/user/address` - Update addresses with validation

#### Security & Authentication

- `POST /api/user/password` - Change password with security checks
- `POST /api/user/2fa/toggle` - Enable/disable two-factor authentication
- `POST /api/user/2fa/verify` - Verify 2FA setup codes
- `POST /api/user/2fa/backup-codes` - Generate new backup codes
- `GET /api/user/security` - Get security status overview

## Features

### 1. Profile Management

- **Personal Information**: Name, email, phone, company
- **Real-time Validation**: Using React Hook Form with Zod schemas
- **Email Verification**: Status display and verification triggers
- **Phone Verification**: SMS verification workflow
- **Avatar Management**: Profile picture upload (UI ready)

### 2. Address Management

- **Billing Address**: Required primary address for billing
- **Legal Address**: Optional separate legal address for contracts
- **Address Validation**: Real-time validation with error messaging
- **Country/State Selection**: Dropdown components with comprehensive lists
- **Address Verification**: Backend validation and verification status

### 3. Security Settings

- **Password Management**:
  - Current password verification
  - Strong password requirements
  - Real-time strength meter
  - Password history validation
- **Two-Factor Authentication**:
  - QR code setup for authenticator apps
  - Backup code generation and management
  - Verification workflow
  - Enable/disable with password confirmation

### 4. Security Dashboard

- **Security Score**: Overall account security rating
- **Activity Monitoring**: Login history and suspicious activity detection
- **Security Recommendations**: Personalized security improvement suggestions
- **Session Management**: Active session tracking

### 5. Privacy Controls

- **Notification Preferences**: Email, SMS, and push notification settings
- **Data Export**: Account data download functionality
- **Account Deletion**: Secure account deletion workflow

## Validation & Error Handling

### Form Validation

All forms use React Hook Form with Zod schemas for validation:

```typescript
// Profile validation schema
const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number")
    .optional(),
  company: z
    .string()
    .max(100, "Company name must be less than 100 characters")
    .optional(),
});
```

### Error Scenarios

The MSW handlers simulate realistic error scenarios:

- **401 Unauthorized**: Invalid or expired tokens
- **400 Bad Request**: Validation failures with field-specific errors
- **409 Conflict**: Email already in use, password reuse violations
- **422 Unprocessable Entity**: Address validation failures
- **429 Too Many Requests**: Rate limiting for security operations
- **500 Internal Server Error**: Random server failures for testing
- **503 Service Unavailable**: Service maintenance scenarios

### Accessibility Features

- **ARIA Labels**: Comprehensive labeling for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling in modals and forms
- **Error Announcements**: Screen reader compatible error messaging
- **Color Contrast**: WCAG compliant color schemes
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## Security Features

### Password Security

- **Strength Requirements**:
  - Minimum 8 characters
  - Upper and lowercase letters
  - Numbers and special characters
- **Strength Meter**: Real-time visual feedback
- **Password History**: Prevents reuse of recent passwords
- **Secure Storage**: Passwords never stored in plain text

### Two-Factor Authentication

- **TOTP Support**: Compatible with Google Authenticator, Authy, etc.
- **Backup Codes**: 8 single-use backup codes for emergency access
- **QR Code Setup**: Visual setup process for authenticator apps
- **Recovery Process**: Secure account recovery with backup codes

### Session Security

- **Active Session Tracking**: Monitor login sessions across devices
- **Suspicious Activity Detection**: Flag unusual login patterns
- **Automatic Logout**: Session timeout for security
- **Device Management**: View and revoke device access

## Responsive Design

### Mobile Optimization

- **Mobile-First Design**: Optimized for small screens
- **Touch-Friendly**: Large tap targets and gestures
- **Responsive Forms**: Adaptive form layouts
- **Mobile Navigation**: Simplified navigation for mobile devices

### Tablet Support

- **Medium Screen Layout**: Optimized for tablet viewing
- **Touch Interface**: Tablet-specific interactions
- **Landscape/Portrait**: Adaptive layouts for orientation changes

### Desktop Experience

- **Full Feature Set**: Complete functionality on desktop
- **Keyboard Shortcuts**: Power user keyboard navigation
- **Multi-Column Layouts**: Efficient use of screen space

## API Integration

### Authentication

All API calls require authentication via Bearer token:

```typescript
const getAuthToken = () => {
  return localStorage.getItem("fake_auth_token") || "mock-token";
};

const response = await fetch("/api/user/profile", {
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
    "Content-Type": "application/json",
  },
});
```

### Error Handling

Consistent error handling across all API calls:

```typescript
if (!response.ok) {
  const errorData = await response.json();

  if (errorData.details) {
    // Handle field-specific validation errors
    Object.entries(errorData.details).forEach(([field, messages]) => {
      form.setError(field, {
        message: (messages as string[])[0],
      });
    });
  }

  throw new Error(errorData.error || "Operation failed");
}
```

## Usage Examples

### Basic Profile Update

```typescript
import { useProfile } from '@/hooks/useProfile';

function MyComponent() {
  const { form, updateProfile } = useProfile();

  const onSubmit = async (data) => {
    try {
      await updateProfile(data);
      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      <button type="submit">Save</button>
    </form>
  );
}
```

### Password Change with Validation

```typescript
import { usePasswordChange } from '@/hooks/useProfile';

function PasswordForm() {
  const { form, changePassword, getPasswordStrength } = usePasswordChange();

  const newPassword = form.watch('newPassword');
  const strength = getPasswordStrength(newPassword || '');

  return (
    <form onSubmit={form.handleSubmit(changePassword)}>
      <input
        type="password"
        {...form.register('newPassword')}
      />
      <div>Strength: {strength}%</div>
      <button type="submit">Change Password</button>
    </form>
  );
}
```

### Two-Factor Authentication Setup

```typescript
import { useTwoFactor } from '@/hooks/useProfile';

function TwoFactorSetup() {
  const { toggleTwoFactor, verifyTwoFactor } = useTwoFactor();

  const handleEnable = async () => {
    const result = await toggleTwoFactor(true, password);
    // Handle QR code and setup process
  };

  return (
    <div>
      <button onClick={handleEnable}>Enable 2FA</button>
    </div>
  );
}
```

## Testing

### Unit Tests

Test individual components and hooks:

```typescript
import { renderHook } from "@testing-library/react";
import { useProfile } from "@/hooks/useProfile";

test("should fetch profile data", async () => {
  const { result } = renderHook(() => useProfile());

  await waitFor(() => {
    expect(result.current.profile).toBeDefined();
  });
});
```

### Integration Tests

Test complete user flows:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileForm from '@/components/account/ProfileForm';

test('should update profile successfully', async () => {
  render(<ProfileForm />);

  fireEvent.change(screen.getByLabelText('Full Name'), {
    target: { value: 'John Doe' }
  });

  fireEvent.click(screen.getByText('Save Changes'));

  await waitFor(() => {
    expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
  });
});
```

## Performance Considerations

### Form Optimization

- **Debounced Validation**: Prevent excessive API calls during typing
- **Optimistic Updates**: Immediate UI feedback before server confirmation
- **Lazy Loading**: Load components only when needed
- **Memoization**: Cache expensive calculations

### API Optimization

- **Request Batching**: Combine related API calls
- **Caching**: Cache profile data to reduce API calls
- **Error Boundaries**: Graceful degradation on API failures
- **Retry Logic**: Automatic retry for transient failures

## Future Enhancements

### Planned Features

1. **Social Login Integration**: OAuth with Google, Facebook, etc.
2. **Advanced 2FA**: WebAuthn/FIDO2 support
3. **Profile Picture Upload**: Direct image upload functionality
4. **Audit Logging**: Comprehensive activity logging
5. **Data Portability**: Enhanced export/import capabilities

### Technical Improvements

1. **Real-time Validation**: WebSocket-based real-time validation
2. **Progressive Web App**: Offline functionality
3. **Advanced Analytics**: User behavior tracking
4. **Internationalization**: Multi-language support
5. **Advanced Security**: Biometric authentication

## Troubleshooting

### Common Issues

#### Profile Update Fails

- Check network connectivity
- Verify authentication token validity
- Review validation errors in form state
- Check MSW handler responses in developer tools

#### 2FA Setup Problems

- Ensure system time is synchronized
- Verify authenticator app compatibility
- Check QR code generation
- Review backup code generation

#### Address Validation Errors

- Verify address format requirements
- Check country/state selection
- Review postal code format
- Ensure all required fields are filled

### Debug Mode

Enable debug logging in development:

```typescript
// Set in environment variables
VITE_DEBUG_PROFILE = true;

// Or in code
const DEBUG = import.meta.env.VITE_DEBUG_PROFILE === "true";

if (DEBUG) {
  console.log("Profile data:", profileData);
}
```

## Contributing

### Code Style

- Use TypeScript for all new code
- Follow React Hook Form patterns for forms
- Implement comprehensive error handling
- Add proper accessibility attributes
- Write unit tests for new components

### Pull Request Process

1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit pull request with description
5. Address review feedback

## Security Considerations

### Data Protection

- Never log sensitive information
- Use HTTPS for all API communications
- Implement proper session management
- Follow OWASP security guidelines

### Privacy Compliance

- Implement data retention policies
- Provide data export functionality
- Allow account deletion
- Respect user privacy preferences

### Vulnerability Management

- Regular security audits
- Dependency vulnerability scanning
- Penetration testing
- Security incident response plan
