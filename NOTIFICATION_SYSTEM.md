# Notification System Documentation

This document provides a comprehensive overview of the notification system implemented in the Customer Panel application.

## Overview

The notification system provides users with real-time updates about important events, including support ticket updates, billing notifications, security alerts, domain renewals, and system maintenance. The system includes a bell icon with unread count, dropdown notification panel, toast notifications, WebSocket simulation for real-time updates, and comprehensive notification management.

## Architecture

### Core Components

#### Context and Hooks (`client/contexts/NotificationContext.tsx`)
- **NotificationProvider** - Global state management for notifications
- **useNotifications()** - Main hook for notification state and actions  
- **useToast()** - Hook specifically for toast notifications
- **MockWebSocket** - Simulates real-time WebSocket connections

#### UI Components
- **NotificationCenter** (`client/components/NotificationCenter.tsx`) - Bell icon with dropdown panel
- **ToastContainer** (`client/components/notifications/ToastContainer.tsx`) - Toast notification system
- **NotificationPreferences** (`client/components/notifications/NotificationPreferences.tsx`) - Settings interface
- **Notifications Page** (`client/pages/Notifications.tsx`) - Full notification management page

#### MSW Handlers (`client/mocks/handlers.ts`)
- Comprehensive API simulation with realistic error scenarios
- WebSocket-like real-time notification generation
- Pagination, filtering, and search support

## Features

### 1. Notification Bell Component
- **Unread Count Badge**: Shows number of unread notifications
- **Visual Indicators**: Different icons for read/unread states
- **Connection Status**: Shows WebSocket connection status
- **Animated Feedback**: Bell animation on new notifications
- **Dropdown Panel**: Comprehensive notification list with actions

### 2. Real-time Updates
- **WebSocket Simulation**: Mock WebSocket for real-time notifications
- **Auto-reconnection**: Handles connection failures with exponential backoff
- **Live Notification Generation**: Simulates realistic notification patterns
- **Connection Monitoring**: Visual feedback for connection status

### 3. Toast Notification System
- **Multiple Types**: Success, error, warning, info toasts
- **Auto-dismiss**: Configurable timeout durations
- **Manual Dismiss**: Click to close functionality
- **Action Buttons**: Optional action buttons with callbacks
- **Stacking**: Proper positioning and stacking management
- **Accessibility**: Screen reader announcements and ARIA support

### 4. Notification Management
- **Mark as Read/Unread**: Individual and bulk operations
- **Delete Notifications**: Individual and bulk deletion
- **Filter and Search**: Category, type, and text search
- **Pagination**: Efficient loading of large notification lists
- **Categories**: Security, billing, support, domain, system, marketing

### 5. Notification Preferences
- **Channel Configuration**: Email, push, SMS per category
- **Quick Settings**: Sound, browser notifications, grouping
- **Quiet Hours**: Customizable do-not-disturb periods
- **Email Digest**: Configurable summary frequency
- **Advanced Options**: Notification limits, custom schedules

### 6. Persistence and Sync
- **Local Storage**: Offline notification persistence
- **Server Sync**: Automatic synchronization on app load
- **Optimistic Updates**: Immediate UI feedback
- **Error Recovery**: Graceful handling of sync failures

## API Endpoints

All notification endpoints are implemented in MSW handlers with realistic error scenarios:

### Core Endpoints
- `GET /api/notifications/unreadCount` - Get unread notification count
- `GET /api/notifications` - List notifications with pagination/filtering
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/:id/unread` - Mark notification as unread
- `POST /api/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

### Preferences
- `GET /api/notifications/preferences` - Get user preferences
- `PUT /api/notifications/preferences` - Update preferences

### Error Scenarios
- **401 Unauthorized**: Invalid or expired tokens
- **429 Too Many Requests**: Rate limiting with retry headers
- **500 Internal Server Error**: Random server failures
- **503 Service Unavailable**: Service maintenance simulation
- **408 Request Timeout**: Network timeout simulation

## Data Models

### Notification Interface
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  category: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}
```

### Toast Interface
```typescript
interface Toast {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

## Usage Examples

### Basic Notification Display
```typescript
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <div>
      <span>Unread: {unreadCount}</span>
      {notifications.map(notification => (
        <div key={notification.id} onClick={() => markAsRead(notification.id)}>
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
}
```

### Showing Toast Notifications
```typescript
import { useToast } from '@/contexts/NotificationContext';

function MyComponent() {
  const { showToast } = useToast();
  
  const handleSuccess = () => {
    showToast({
      type: 'success',
      title: 'Operation Successful',
      message: 'Your changes have been saved.',
      duration: 5000,
      action: {
        label: 'View Details',
        onClick: () => navigate('/details'),
      },
    });
  };
  
  return <button onClick={handleSuccess}>Save</button>;
}
```

### Using the Toast Hook
```typescript
import { useToastNotification } from '@/components/notifications/ToastContainer';

function MyComponent() {
  const toast = useToastNotification();
  
  const handleError = () => {
    toast.error('Failed to save changes', {
      duration: 10000,
      action: {
        label: 'Retry',
        onClick: handleRetry,
      },
    });
  };
  
  return <button onClick={handleError}>Test Error</button>;
}
```

### Notification Filtering
```typescript
const { fetchNotifications } = useNotifications();

// Fetch only unread security notifications
fetchNotifications({
  category: 'security',
  onlyUnread: true,
  page: 1,
  limit: 20,
});
```

## Accessibility Features

### Screen Reader Support
- **ARIA Live Regions**: Toast announcements for screen readers
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Role Attributes**: Proper roles for alerts and notifications
- **Semantic HTML**: Proper heading structure and landmarks

### Keyboard Navigation
- **Tab Navigation**: Full keyboard accessibility in dropdown
- **Enter/Space**: Activation of notification items
- **Escape**: Close dropdown and modals
- **Arrow Keys**: Navigation within notification lists

### Visual Accessibility
- **High Contrast**: WCAG compliant color schemes
- **Focus Indicators**: Clear focus rings on interactive elements
- **Animation Preferences**: Respects reduced motion preferences
- **Text Scaling**: Responsive to browser text size settings

## Responsive Design

### Mobile Optimization
- **Touch-Friendly**: Large tap targets for mobile devices
- **Responsive Layouts**: Adaptive notification panel sizing
- **Mobile Gestures**: Swipe actions for notification management
- **Compact Display**: Optimized notification cards for small screens

### Desktop Features
- **Hover States**: Rich hover interactions
- **Keyboard Shortcuts**: Power user keyboard support
- **Multi-Column**: Efficient use of screen space
- **Context Menus**: Right-click actions where appropriate

## Real-time Features

### WebSocket Simulation
```typescript
class MockWebSocket {
  connect() {
    // Simulate real-time connection
    this.intervalId = setInterval(() => {
      if (Math.random() > 0.7) {
        this.simulateNotification();
      }
    }, 30000 + Math.random() * 30000);
  }
  
  simulateNotification() {
    // Generate realistic notifications
    const notification = generateRandomNotification();
    this.callbacks.forEach(callback => callback(notification));
  }
}
```

### Connection Management
- **Auto-reconnection**: Exponential backoff on connection loss
- **Connection Status**: Visual indicators for connection state
- **Offline Handling**: Graceful degradation when offline
- **Error Recovery**: Automatic retry mechanisms

## Configuration

### Environment Variables
```bash
# Notification settings
VITE_NOTIFICATION_WEBSOCKET_URL=ws://localhost:3001/notifications
VITE_NOTIFICATION_POLL_INTERVAL=30000
VITE_NOTIFICATION_MAX_RETRIES=3
VITE_NOTIFICATION_RETRY_DELAY=2000
```

### Default Settings
```typescript
const DEFAULT_PREFERENCES = {
  email: {
    security: true,
    billing: true,
    support: true,
    marketing: false,
    system: true,
  },
  push: {
    security: true,
    billing: true,
    support: false,
    marketing: false,
    system: true,
  },
  sms: {
    security: true,
    billing: false,
    support: false,
    marketing: false,
    system: false,
  },
};
```

## Performance Optimization

### Lazy Loading
- **Component Splitting**: Lazy load notification preferences
- **Image Optimization**: Efficient loading of notification icons
- **Virtual Scrolling**: Handle large notification lists efficiently

### Caching
- **Local Storage**: Cache notifications for offline access
- **Memory Caching**: In-memory notification state management
- **Request Deduplication**: Prevent duplicate API calls

### Efficient Updates
- **Optimistic Updates**: Immediate UI feedback
- **Batch Operations**: Group multiple operations
- **Debounced Actions**: Prevent excessive API calls

## Error Handling

### API Errors
```typescript
try {
  await markAsRead(notificationId);
} catch (error) {
  showToast({
    type: 'error',
    message: 'Failed to mark notification as read',
    action: {
      label: 'Retry',
      onClick: () => markAsRead(notificationId),
    },
  });
}
```

### Connection Errors
- **Retry Logic**: Exponential backoff for failed connections
- **Fallback Modes**: Polling when WebSocket unavailable
- **User Feedback**: Clear error messages and recovery options

### Validation Errors
- **Form Validation**: Client-side preference validation
- **Server Validation**: Handle API validation errors
- **User Guidance**: Clear error messages and correction hints

## Testing

### Unit Tests
```typescript
import { renderHook } from '@testing-library/react';
import { useNotifications } from '@/contexts/NotificationContext';

test('should fetch notifications', async () => {
  const { result } = renderHook(() => useNotifications());
  
  await act(async () => {
    await result.current.fetchNotifications();
  });
  
  expect(result.current.notifications.length).toBeGreaterThan(0);
});
```

### Integration Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationCenter from '@/components/NotificationCenter';

test('should show unread count', () => {
  render(<NotificationCenter />);
  
  const badge = screen.getByText('3');
  expect(badge).toBeInTheDocument();
});
```

### E2E Tests
```typescript
test('notification workflow', async () => {
  // Open notification center
  await page.click('[aria-label*="Notifications"]');
  
  // Mark notification as read
  await page.click('[aria-label*="Mark as read"]');
  
  // Verify unread count decreased
  const badge = await page.textContent('.notification-badge');
  expect(badge).toBe('2');
});
```

## Security Considerations

### Authentication
- **JWT Validation**: All notification endpoints require valid tokens
- **Permission Checks**: Scope-based access control
- **Rate Limiting**: Prevent abuse with configurable limits

### Data Privacy
- **Sensitive Information**: No sensitive data in notifications
- **User Consent**: Preference-based notification delivery
- **Data Retention**: Configurable notification retention policies

### XSS Prevention
- **Content Sanitization**: Safe rendering of notification content
- **Input Validation**: Server-side validation of preferences
- **CSP Headers**: Content Security Policy enforcement

## Monitoring and Analytics

### Metrics Collection
- **Delivery Rates**: Track notification delivery success
- **Engagement Metrics**: Click-through rates and actions
- **Performance Metrics**: Load times and error rates
- **User Preferences**: Preference distribution analytics

### Error Tracking
- **Error Logging**: Comprehensive error capture
- **Performance Monitoring**: Real-time performance metrics
- **User Feedback**: Error reporting and feedback collection

## Deployment Considerations

### Production Setup
- **Environment Config**: Production-specific settings
- **CDN Integration**: Efficient asset delivery
- **Monitoring Setup**: Error tracking and performance monitoring
- **Backup Strategies**: Data backup and recovery plans

### Scaling
- **Database Optimization**: Efficient notification queries
- **Caching Strategies**: Redis for notification caching
- **Load Balancing**: Distribute notification processing
- **WebSocket Scaling**: Horizontal scaling for real-time features

## Future Enhancements

### Planned Features
1. **Rich Notifications**: Support for images and rich content
2. **Notification Templates**: Customizable notification templates
3. **Advanced Filtering**: Custom filter criteria and saved filters
4. **Notification Scheduling**: Schedule notifications for later delivery
5. **Integration APIs**: Third-party service integrations

### Technical Improvements
1. **Real WebSocket**: Replace mock with actual WebSocket implementation
2. **Push Notifications**: Native browser and mobile push notifications
3. **Offline Support**: Full offline notification management
4. **Advanced Analytics**: Detailed notification analytics dashboard
5. **A/B Testing**: Notification content and timing optimization

## Troubleshooting

### Common Issues

#### Notifications Not Loading
- Check network connectivity
- Verify authentication token validity
- Review browser console for API errors
- Check MSW service worker registration

#### WebSocket Connection Issues
- Verify WebSocket URL configuration
- Check for network proxy issues
- Review connection retry logic
- Monitor connection status indicators

#### Toast Notifications Not Appearing
- Check toast container rendering
- Verify toast permission settings
- Review browser notification permissions
- Check for DOM container conflicts

### Debug Mode
Enable debug logging in development:

```typescript
// Set in environment variables
VITE_DEBUG_NOTIFICATIONS=true

// Or in code
const DEBUG = import.meta.env.VITE_DEBUG_NOTIFICATIONS === 'true';

if (DEBUG) {
  console.log('Notification data:', notifications);
  console.log('WebSocket status:', isConnected);
}
```

## Contributing

### Code Style
- Use TypeScript for all notification components
- Follow React Hook patterns for state management
- Implement comprehensive error handling
- Add proper accessibility attributes
- Write unit tests for new features

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit pull request with description
5. Address review feedback

## License and Security

### Data Protection
- Follow GDPR compliance for notification data
- Implement proper data retention policies
- Provide user control over notification data
- Ensure secure data transmission

### Security Best Practices
- Regular security audits
- Dependency vulnerability scanning
- Secure API endpoint implementation
- User privacy protection measures
