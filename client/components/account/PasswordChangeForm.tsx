import { useState } from 'react';
import { usePasswordChange, PasswordFormData } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: 'At least 8 characters long' },
  { regex: /[a-z]/, text: 'One lowercase letter' },
  { regex: /[A-Z]/, text: 'One uppercase letter' },
  { regex: /\d/, text: 'One number' },
  { regex: /[!@#$%^&*]/, text: 'One special character (!@#$%^&*)' },
];

export default function PasswordChangeForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { 
    isLoading, 
    form, 
    changePassword, 
    getPasswordStrength, 
    getStrengthLabel, 
    getStrengthColor 
  } = usePasswordChange();

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword(data);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const currentPassword = form.watch('currentPassword');
  const newPassword = form.watch('newPassword');
  const confirmPassword = form.watch('confirmPassword');
  
  const passwordStrength = getPasswordStrength(newPassword || '');
  const strengthLabel = getStrengthLabel(passwordStrength);
  const strengthColor = getStrengthColor(passwordStrength);

  const passwordRequirementsMet = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: req.regex.test(newPassword || ''),
  }));

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lock className="mr-2 h-5 w-5 text-primary" />
          Change Password
        </CardTitle>
        <CardDescription className="body-sm">
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <Label className="body-sm font-semibold" htmlFor="currentPassword">
              Current Password *
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                {...form.register('currentPassword')}
                className={form.formState.errors.currentPassword ? 'border-red-500' : ''}
                placeholder="Enter your current password"
                aria-describedby={form.formState.errors.currentPassword ? 'current-password-error' : undefined}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                tabIndex={-1}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showCurrentPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
            {form.formState.errors.currentPassword && (
              <p id="current-password-error" className="text-sm text-red-600" role="alert">
                {form.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label className="body-sm font-semibold" htmlFor="newPassword">
              New Password *
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                {...form.register('newPassword')}
                className={form.formState.errors.newPassword ? 'border-red-500' : ''}
                placeholder="Enter your new password"
                aria-describedby={form.formState.errors.newPassword ? 'new-password-error' : 'password-requirements'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showNewPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
            {form.formState.errors.newPassword && (
              <p id="new-password-error" className="text-sm text-red-600" role="alert">
                {form.formState.errors.newPassword.message}
              </p>
            )}

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Password Strength:</span>
                    <span className={`text-sm font-semibold ${
                      passwordStrength >= 75 
                        ? 'text-green-600' 
                        : passwordStrength >= 50 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                    }`}>
                      {strengthLabel}
                    </span>
                  </div>
                  <Progress 
                    value={passwordStrength} 
                    className="h-2"
                    // className={`h-2 ${strengthColor}`}
                  />
                </div>

                {/* Password Requirements */}
                <div id="password-requirements" className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
                  <ul className="space-y-1" role="list">
                    {passwordRequirementsMet.map((req, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        {req.met ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                          {req.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label className="body-sm font-semibold" htmlFor="confirmPassword">
              Confirm New Password *
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...form.register('confirmPassword')}
                className={form.formState.errors.confirmPassword ? 'border-red-500' : ''}
                placeholder="Confirm your new password"
                aria-describedby={form.formState.errors.confirmPassword ? 'confirm-password-error' : undefined}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showConfirmPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p id="confirm-password-error" className="text-sm text-red-600" role="alert">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
            {confirmPassword && newPassword && newPassword !== confirmPassword && !form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-600" role="alert">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={
                isLoading || 
                !form.formState.isDirty || 
                passwordStrength < 75 ||
                newPassword !== confirmPassword ||
                !currentPassword
              }
            >
              <Lock className="mr-2 h-4 w-4" />
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>

        {/* Security Tips */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Password Security Tips</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Use a unique password that you don't use on other websites</li>
                <li>• Consider using a password manager to generate and store strong passwords</li>
                <li>• Never share your password with anyone</li>
                <li>• Change your password immediately if you suspect it's been compromised</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
