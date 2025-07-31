import React from 'react';
import { useToast } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';

export default function NotificationTest() {
  const { showToast } = useToast();

  const testSuccess = () => {
    showToast({
      type: 'success',
      title: 'Test Success',
      message: 'This is a success toast notification!',
      duration: 3000,
    });
  };

  const testError = () => {
    showToast({
      type: 'error',
      title: 'Test Error',
      message: 'This is an error toast notification!',
      duration: 5000,
    });
  };

  const testWarning = () => {
    showToast({
      type: 'warning',
      title: 'Test Warning',
      message: 'This is a warning toast notification!',
      duration: 4000,
    });
  };

  const testInfo = () => {
    showToast({
      type: 'info',
      title: 'Test Info',
      message: 'This is an info toast notification!',
      duration: 3000,
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Notification System Test</h3>
      <div className="flex space-x-2">
        <Button onClick={testSuccess} className="bg-green-600 hover:bg-green-700">
          Test Success
        </Button>
        <Button onClick={testError} className="bg-red-600 hover:bg-red-700">
          Test Error
        </Button>
        <Button onClick={testWarning} className="bg-yellow-600 hover:bg-yellow-700">
          Test Warning
        </Button>
        <Button onClick={testInfo} className="bg-blue-600 hover:bg-blue-700">
          Test Info
        </Button>
      </div>
    </div>
  );
}
