import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useToast } from "@/components/ui/toast";
import { FormFieldError, ValidationErrorSummary } from "@/components/ui/error-states";
import { SettingsSaved, InlineSuccess } from "@/components/ui/success-states";
import { LoadingOverlay } from "@/components/ui/loading-states";
import { Button } from "@/components/ui/interactive-states";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Download,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Building,
  Globe,
  Activity,
  Smartphone,
  Monitor,
  Key,
  QrCode,
  Copy,
  ExternalLink,
  Save,
  Edit,
  Camera,
  Bell,
  Settings,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

type ActivityLogEntry = {
  id: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  suspicious: boolean;
};

type NotificationPreference = {
  id: string;
  category: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  description: string;
};

export default function Account() {
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [settingSaved, setSettingSaved] = useState("");
  const toast = useToast();

  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    company: "Example Corp",
    billingAddress: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States",
    },
    legalAddress: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States",
    },
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([
    {
      id: "service",
      category: "Service Updates",
      email: true,
      sms: false,
      push: true,
      description: "Domain renewals, hosting updates, maintenance notifications",
    },
    {
      id: "billing",
      category: "Billing & Payments",
      email: true,
      sms: true,
      push: true,
      description: "Invoices, payment confirmations, billing issues",
    },
    {
      id: "security",
      category: "Security Alerts",
      email: true,
      sms: true,
      push: true,
      description: "Login attempts, password changes, suspicious activity",
    },
    {
      id: "marketing",
      category: "Marketing & Promotions",
      email: false,
      sms: false,
      push: false,
      description: "Product updates, special offers, newsletters",
    },
  ]);

  const [activityLog] = useState<ActivityLogEntry[]>([
    {
      id: "1",
      action: "Successful login",
      timestamp: "Dec 12, 2024 2:30 PM",
      ipAddress: "192.168.1.100",
      location: "New York, NY, US",
      device: "Desktop",
      browser: "Chrome 120.0",
      suspicious: false,
    },
    {
      id: "2",
      action: "Password changed",
      timestamp: "Dec 10, 2024 9:15 AM",
      ipAddress: "192.168.1.100",
      location: "New York, NY, US",
      device: "Desktop",
      browser: "Chrome 120.0",
      suspicious: false,
    },
    {
      id: "3",
      action: "Login attempt (failed)",
      timestamp: "Dec 8, 2024 11:45 PM",
      ipAddress: "45.123.67.89",
      location: "Unknown Location",
      device: "Mobile",
      browser: "Safari 17.0",
      suspicious: true,
    },
    {
      id: "4",
      action: "Two-factor authentication enabled",
      timestamp: "Dec 5, 2024 3:20 PM",
      ipAddress: "192.168.1.100",
      location: "New York, NY, US",
      device: "Desktop",
      browser: "Chrome 120.0",
      suspicious: false,
    },
  ]);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(passwordData.new);

  const getStrengthColor = (strength: number) => {
    if (strength < 25) return "bg-error";
    if (strength < 50) return "bg-warning";
    if (strength < 75) return "bg-orange-500";
    return "bg-success";
  };

  const getStrengthText = (strength: number) => {
    if (strength < 25) return "Weak";
    if (strength < 50) return "Fair";
    if (strength < 75) return "Good";
    return "Strong";
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
    setBackupCodes(codes);
  };

  const handleSaveProfile = async () => {
    // Reset errors
    setValidationErrors([]);
    setFieldErrors({});

    // Validate form
    const errors: string[] = [];
    const fieldErrs: {[key: string]: string} = {};

    if (!profileData.name.trim()) {
      errors.push("Full name is required");
      fieldErrs.name = "Please enter your full name";
    }

    if (!profileData.email.trim()) {
      errors.push("Email address is required");
      fieldErrs.email = "Please enter a valid email address";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.push("Email address is invalid");
      fieldErrs.email = "Please enter a valid email address";
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setFieldErrors(fieldErrs);
      toast.error("Please fix the errors before saving", {
        title: "Validation Error"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random success/failure for demo
          if (Math.random() > 0.8) {
            reject(new Error("Network error: Unable to save profile"));
          } else {
            resolve(true);
          }
        }, 2000);
      });

      setIsLoading(false);
      setIsEditing(false);
      setShowSuccessMessage(true);

      toast.success("Profile updated successfully!", {
        title: "Changes Saved"
      });

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccessMessage(false), 3000);

    } catch (error) {
      setIsLoading(false);
      toast.error(error instanceof Error ? error.message : "Failed to save profile", {
        title: "Save Failed",
        action: {
          label: "Try Again",
          onClick: handleSaveProfile
        }
      });
    }
  };

  const handleNotificationChange = (id: string, type: 'email' | 'sms' | 'push', value: boolean) => {
    setNotificationPreferences(prev =>
      prev.map(pref =>
        pref.id === id ? { ...pref, [type]: value } : pref
      )
    );
  };

  const handleTwoFactorToggle = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    setSettingSaved(enabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled");

    toast.success(
      enabled ? "Two-factor authentication has been enabled" : "Two-factor authentication has been disabled",
      {
        title: "Security Setting Updated"
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1 text-gray-900">Account & Security</h1>
            <p className="body text-gray-600 mt-1">
              Manage your profile information, security settings, and privacy preferences
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-success text-white">
              <Shield className="mr-1 h-3 w-3" />
              Account Verified
            </Badge>
          </div>
        </div>

        {/* Account Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Information */}
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5 text-primary" />
                      Profile Information
                    </CardTitle>
                    <CardDescription className="body-sm">
                      Update your personal information and contact details
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <ValidationErrorSummary
                    errors={validationErrors}
                    onDismiss={() => setValidationErrors([])}
                  />
                )}

                {/* Success Message */}
                {showSuccessMessage && (
                  <InlineSuccess
                    message="Profile updated successfully!"
                    onDismiss={() => setShowSuccessMessage(false)}
                  />
                )}

                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      JD
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{profileData.name}</h3>
                    <p className="body-sm text-gray-600">{profileData.email}</p>
                    <p className="body-sm text-gray-500">Member since Jan 2022</p>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="body-sm font-semibold flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => {
                        setProfileData({...profileData, name: e.target.value});
                        // Clear field error when user starts typing
                        if (fieldErrors.name) {
                          setFieldErrors(prev => ({...prev, name: ""}));
                        }
                      }}
                      disabled={!isEditing}
                      className={fieldErrors.name ? "form-field-error" : "form-field-focus"}
                    />
                    <FormFieldError error={fieldErrors.name} />
                  </div>

                  <div className="space-y-2">
                    <Label className="body-sm font-semibold flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      value={profileData.email}
                      onChange={(e) => {
                        setProfileData({...profileData, email: e.target.value});
                        // Clear field error when user starts typing
                        if (fieldErrors.email) {
                          setFieldErrors(prev => ({...prev, email: ""}));
                        }
                      }}
                      disabled={!isEditing}
                      className={fieldErrors.email ? "form-field-error" : "form-field-focus"}
                    />
                    <FormFieldError error={fieldErrors.email} />
                  </div>

                  <div className="space-y-2">
                    <Label className="body-sm font-semibold flex items-center">
                      <Phone className="mr-2 h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="body-sm font-semibold flex items-center">
                      <Building className="mr-2 h-4 w-4" />
                      Company
                    </Label>
                    <Input
                      value={profileData.company}
                      onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <LoadingOverlay isLoading={isLoading}>
                    <div className="flex space-x-3">
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={handleSaveProfile}
                        loading={isLoading}
                        loadingText="Saving..."
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                        Cancel
                      </Button>
                    </div>
                  </LoadingOverlay>
                )}
              </CardContent>
            </Card>

            {/* Address Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Billing Address */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    Billing Address
                  </CardTitle>
                  <CardDescription className="body-sm">
                    Primary address for billing and invoices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="body-sm font-semibold">Street Address</Label>
                    <Input
                      value={profileData.billingAddress.street}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        billingAddress: { ...profileData.billingAddress, street: e.target.value }
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="body-sm font-semibold">City</Label>
                      <Input
                        value={profileData.billingAddress.city}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          billingAddress: { ...profileData.billingAddress, city: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="body-sm font-semibold">State</Label>
                      <Select
                        value={profileData.billingAddress.state}
                        onValueChange={(value) => setProfileData({
                          ...profileData,
                          billingAddress: { ...profileData.billingAddress, state: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="body-sm font-semibold">ZIP Code</Label>
                      <Input
                        value={profileData.billingAddress.zipCode}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          billingAddress: { ...profileData.billingAddress, zipCode: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="body-sm font-semibold">Country</Label>
                      <Select
                        value={profileData.billingAddress.country}
                        onValueChange={(value) => setProfileData({
                          ...profileData,
                          billingAddress: { ...profileData.billingAddress, country: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="body-sm text-success">Address verified</span>
                  </div>
                </CardContent>
              </Card>

              {/* Legal Address */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5 text-primary" />
                    Legal Address
                  </CardTitle>
                  <CardDescription className="body-sm">
                    Legal address for contracts and documentation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="same-as-billing"
                      checked={sameAsBilling}
                      onCheckedChange={(checked) => setSameAsBilling(checked as boolean)}
                    />
                    <Label htmlFor="same-as-billing" className="body-sm">
                      Same as billing address
                    </Label>
                  </div>
                  
                  {!sameAsBilling && (
                    <>
                      <div className="space-y-2">
                        <Label className="body-sm font-semibold">Street Address</Label>
                        <Input
                          value={profileData.legalAddress.street}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            legalAddress: { ...profileData.legalAddress, street: e.target.value }
                          })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="body-sm font-semibold">City</Label>
                          <Input
                            value={profileData.legalAddress.city}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              legalAddress: { ...profileData.legalAddress, city: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="body-sm font-semibold">State</Label>
                          <Select
                            value={profileData.legalAddress.state}
                            onValueChange={(value) => setProfileData({
                              ...profileData,
                              legalAddress: { ...profileData.legalAddress, state: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NY">New York</SelectItem>
                              <SelectItem value="CA">California</SelectItem>
                              <SelectItem value="TX">Texas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="body-sm font-semibold">ZIP Code</Label>
                          <Input
                            value={profileData.legalAddress.zipCode}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              legalAddress: { ...profileData.legalAddress, zipCode: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="body-sm font-semibold">Country</Label>
                          <Select
                            value={profileData.legalAddress.country}
                            onValueChange={(value) => setProfileData({
                              ...profileData,
                              legalAddress: { ...profileData.legalAddress, country: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Password Security */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5 text-primary" />
                  Password & Authentication
                </CardTitle>
                <CardDescription className="body-sm">
                  Manage your password and two-factor authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Password Strength */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="body-sm font-semibold">Current Password Strength</span>
                    <Badge className="bg-success text-white">Strong</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                  <p className="body-sm text-gray-600 mt-2">
                    Last changed: Dec 10, 2024
                  </p>
                </div>

                {/* Change Password */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Change Password</h4>
                  
                  <div className="space-y-2">
                    <Label className="body-sm font-semibold">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                        placeholder="Enter current password"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="body-sm font-semibold">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                        placeholder="Enter new password"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordData.new && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="body-sm text-gray-600">Password Strength:</span>
                          <span className={`body-sm font-semibold ${
                            passwordStrength >= 75 ? 'text-success' : 
                            passwordStrength >= 50 ? 'text-warning' : 'text-error'
                          }`}>
                            {getStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${getStrengthColor(passwordStrength)}`}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="body-sm font-semibold">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                        placeholder="Confirm new password"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordData.confirm && passwordData.new !== passwordData.confirm && (
                      <p className="body-sm text-error">Passwords do not match</p>
                    )}
                  </div>

                  <Button className="bg-primary hover:bg-primary/90">
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
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
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${twoFactorEnabled ? 'bg-success/10' : 'bg-gray-200'}`}>
                      <Shield className={`h-5 w-5 ${twoFactorEnabled ? 'text-success' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Authenticator App</h4>
                      <p className="body-sm text-gray-600">
                        {twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Use an authenticator app for secure login'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={handleTwoFactorToggle}
                  />
                </div>

                {twoFactorEnabled && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="body-sm text-success">Two-factor authentication is active</span>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <QrCode className="mr-2 h-4 w-4" />
                            View QR Code
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Setup Authenticator App</DialogTitle>
                            <DialogDescription>
                              Scan this QR code with your authenticator app
                            </DialogDescription>
                          </DialogHeader>
                          <div className="text-center space-y-4">
                            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                              <QrCode className="h-24 w-24 text-gray-400" />
                            </div>
                            <p className="body-sm text-gray-600">
                              Or enter this code manually: <code className="bg-gray-100 px-2 py-1 rounded">JBSWY3DPEHPK3PXP</code>
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline"
                        onClick={generateBackupCodes}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Generate Backup Codes
                      </Button>
                    </div>

                    {backupCodes.length > 0 && (
                      <Card className="bg-warning/5 border-warning/20">
                        <CardHeader>
                          <CardTitle className="text-sm text-warning">Backup Codes</CardTitle>
                          <CardDescription className="body-sm">
                            Save these codes in a secure location. Each code can only be used once.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                            {backupCodes.map((code, index) => (
                              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                                <span>{code}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(code)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button variant="outline" className="w-full mt-4">
                            <Download className="mr-2 h-4 w-4" />
                            Download Codes
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {!twoFactorEnabled && (
                  <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span className="body-sm text-warning font-semibold">Security Recommendation</span>
                    </div>
                    <p className="body-sm text-gray-600 mt-1">
                      Enable two-factor authentication to significantly improve your account security.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-primary" />
                  Security Activity Log
                </CardTitle>
                <CardDescription className="body-sm">
                  Monitor login attempts and security-related activities on your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLog.map((entry) => (
                    <div key={entry.id} className={`p-4 rounded-lg border ${
                      entry.suspicious ? 'bg-error/5 border-error/20' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-full ${
                            entry.suspicious 
                              ? 'bg-error/10 text-error' 
                              : entry.action.includes('failed')
                                ? 'bg-warning/10 text-warning'
                                : 'bg-success/10 text-success'
                          }`}>
                            {entry.device === 'Desktop' ? (
                              <Monitor className="h-4 w-4" />
                            ) : (
                              <Smartphone className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{entry.action}</h4>
                            <div className="space-y-1 body-sm text-gray-600">
                              <p>{entry.timestamp}</p>
                              <p>IP: {entry.ipAddress} • {entry.location}</p>
                              <p>{entry.device} • {entry.browser}</p>
                            </div>
                          </div>
                        </div>
                        {entry.suspicious && (
                          <Badge className="bg-error text-white">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Suspicious
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Full Activity Log
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            {/* Notification Preferences */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="body-sm">
                  Choose how you want to receive updates and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {notificationPreferences.map((pref) => (
                    <div key={pref.id} className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{pref.category}</h4>
                        <p className="body-sm text-gray-600">{pref.description}</p>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${pref.id}-email`}
                            checked={pref.email}
                            onCheckedChange={(checked) => 
                              handleNotificationChange(pref.id, 'email', checked as boolean)
                            }
                          />
                          <Label htmlFor={`${pref.id}-email`} className="body-sm">
                            Email
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${pref.id}-sms`}
                            checked={pref.sms}
                            onCheckedChange={(checked) => 
                              handleNotificationChange(pref.id, 'sms', checked as boolean)
                            }
                          />
                          <Label htmlFor={`${pref.id}-sms`} className="body-sm">
                            SMS
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${pref.id}-push`}
                            checked={pref.push}
                            onCheckedChange={(checked) => 
                              handleNotificationChange(pref.id, 'push', checked as boolean)
                            }
                          />
                          <Label htmlFor={`${pref.id}-push`} className="body-sm">
                            Push
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Controls */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-primary" />
                  Data & Privacy Controls
                </CardTitle>
                <CardDescription className="body-sm">
                  Manage your personal data and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">Export Your Data</h4>
                      <p className="body-sm text-gray-600">
                        Download a copy of your account data and activity
                      </p>
                    </div>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Request Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-error/5 border border-error/20 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-error">Delete Account</h4>
                      <p className="body-sm text-gray-600">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-error text-error hover:bg-error/10">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-error">Delete Account</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-error/5 border border-error/20 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-error" />
                              <span className="body-sm font-semibold text-error">Warning</span>
                            </div>
                            <ul className="body-sm text-gray-600 space-y-1">
                              <li>• All your domains will be transferred to a holding account</li>
                              <li>• Active services will be cancelled</li>
                              <li>• Billing history will be retained for legal purposes</li>
                              <li>• This action cannot be reversed</li>
                            </ul>
                          </div>
                          <div className="flex space-x-3">
                            <Button variant="outline" className="flex-1">
                              Cancel
                            </Button>
                            <Button className="flex-1 bg-error hover:bg-error/90">
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings Saved Notification */}
      <SettingsSaved
        setting={settingSaved}
        visible={!!settingSaved}
        onHide={() => setSettingSaved("")}
      />
    </AppShell>
  );
}
