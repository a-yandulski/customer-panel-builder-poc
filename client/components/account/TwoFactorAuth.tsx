import { useState } from 'react';
import { useTwoFactor } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  QrCode, 
  Key, 
  Copy, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  EyeOff,
  Smartphone
} from 'lucide-react';

interface TwoFactorStatusProps {
  enabled: boolean;
  onToggle: (enabled: boolean, password: string) => Promise<void>;
}

function TwoFactorStatus({ enabled, onToggle }: TwoFactorStatusProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (enabled) {
      setShowPasswordDialog(true);
    } else {
      setShowPasswordDialog(true);
    }
  };

  const handleConfirm = async () => {
    if (!password.trim()) return;
    
    try {
      setIsLoading(true);
      await onToggle(!enabled, password);
      setShowPasswordDialog(false);
      setPassword('');
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${enabled ? 'bg-green-100' : 'bg-gray-200'}`}>
            <Shield className={`h-5 w-5 ${enabled ? 'text-green-600' : 'text-gray-500'}`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              Authenticator App
            </h4>
            <p className="body-sm text-gray-600">
              {enabled
                ? 'Two-factor authentication is enabled'
                : 'Use an authenticator app for secure login'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {enabled && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="mr-1 h-3 w-3" />
              Enabled
            </Badge>
          )}
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            aria-label={enabled ? 'Disable two-factor authentication' : 'Enable two-factor authentication'}
          />
        </div>
      </div>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {enabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication'}
            </DialogTitle>
            <DialogDescription>
              {enabled 
                ? 'Enter your password to disable two-factor authentication. This will reduce your account security.'
                : 'Enter your password to enable two-factor authentication and enhance your account security.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Current Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {!enabled && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Compatible Apps
                  </span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Google Authenticator, Authy, Microsoft Authenticator, or any TOTP-compatible app.
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword('');
                }}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!password.trim() || isLoading}
                className={`flex-1 ${enabled ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'}`}
              >
                {isLoading ? 'Processing...' : enabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface QRCodeSetupProps {
  secretKey: string;
  qrCodeUrl: string;
  onVerify: (code: string) => Promise<void>;
}

function QRCodeSetup({ secretKey, qrCodeUrl, onVerify }: QRCodeSetupProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) return;
    
    try {
      setIsVerifying(true);
      await onVerify(verificationCode);
      setVerificationCode('');
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsVerifying(false);
    }
  };

  const copySecretKey = () => {
    navigator.clipboard.writeText(secretKey);
  };

  return (
    <div className="space-y-4">
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <QrCode className="mr-2 h-4 w-4" />
            Setup Authenticator App
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Authenticator App</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app or enter the secret key manually.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* QR Code */}
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-24 w-24 text-gray-400" />
                {/* In a real app, you'd use a QR code library to generate the actual QR code */}
              </div>
              <p className="text-sm text-gray-600">
                Scan this QR code with your authenticator app
              </p>
            </div>

            {/* Manual Entry */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Or enter this code manually:</Label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                  {secretKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copySecretKey}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Verification */}
            <div className="space-y-2">
              <Label htmlFor="verification-code">Enter verification code from your app:</Label>
              <div className="flex space-x-2">
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="text-center font-mono text-lg"
                  maxLength={6}
                />
                <Button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6 || isVerifying}
                >
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface BackupCodesProps {
  codes?: string[];
  onGenerate: (password: string) => Promise<void>;
}

function BackupCodes({ codes, onGenerate }: BackupCodesProps) {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!password.trim()) return;
    
    try {
      setIsGenerating(true);
      await onGenerate(password);
      setShowGenerateDialog(false);
      setPassword('');
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const downloadCodes = () => {
    if (!codes) return;
    
    const content = codes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-3">
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Key className="mr-2 h-4 w-4" />
              Generate Backup Codes
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Backup Codes</DialogTitle>
              <DialogDescription>
                This will invalidate any existing backup codes. Enter your password to generate new codes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="generate-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="generate-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowGenerateDialog(false);
                    setPassword('');
                  }}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!password.trim() || isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? 'Generating...' : 'Generate Codes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {codes && codes.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800 flex items-center">
              <Key className="mr-2 h-4 w-4" />
              Backup Codes
            </CardTitle>
            <CardDescription className="body-sm text-yellow-700">
              Save these codes in a secure location. Each code can only be used once.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm mb-4">
              {codes.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white p-2 rounded border"
                >
                  <span>{code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCode(code)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={downloadCodes}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Codes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function TwoFactorAuth() {
  const { isLoading, twoFactorData, toggleTwoFactor, verifyTwoFactor, generateBackupCodes } = useTwoFactor();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleToggle = async (enabled: boolean, password: string) => {
    const result = await toggleTwoFactor(enabled, password);
    setTwoFactorEnabled(result.twoFactorEnabled);
    return result;
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription className="body-sm">
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TwoFactorStatus 
          enabled={twoFactorEnabled} 
          onToggle={handleToggle} 
        />

        {twoFactorData?.twoFactorEnabled && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="body-sm text-green-700">
                Two-factor authentication is active
              </span>
            </div>

            {twoFactorData.secretKey && (
              <QRCodeSetup
                secretKey={twoFactorData.secretKey}
                qrCodeUrl={twoFactorData.qrCodeUrl}
                onVerify={verifyTwoFactor}
              />
            )}

            <BackupCodes 
              codes={twoFactorData.backupCodes}
              onGenerate={generateBackupCodes}
            />
          </div>
        )}

        {!twoFactorEnabled && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="body-sm text-yellow-800 font-semibold">
                Security Recommendation
              </span>
            </div>
            <p className="body-sm text-yellow-700 mt-1">
              Enable two-factor authentication to significantly improve your account security. 
              This adds an extra layer of protection even if your password is compromised.
            </p>
          </div>
        )}

        {/* Information Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">How Two-Factor Authentication Works</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Download an authenticator app on your phone</li>
                <li>• Scan the QR code or enter the secret key</li>
                <li>• Use the generated codes along with your password to login</li>
                <li>• Keep backup codes in a safe place for emergency access</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
