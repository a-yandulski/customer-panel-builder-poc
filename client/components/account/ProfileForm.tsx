import { useState } from "react";
import { useProfile, ProfileFormData } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingOverlay } from "@/components/ui/loading-states";
import {
  User,
  Mail,
  Phone,
  Building,
  Edit,
  Save,
  Camera,
  CheckCircle,
} from "lucide-react";

export default function ProfileForm() {
  const [isEditing, setIsEditing] = useState(false);
  const { profile, isLoading, form, updateProfile } = useProfile();

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
          <div className="flex items-center space-x-3">
            {profile?.emailVerified && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              disabled={form.formState.isSubmitting}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </div>
            {isEditing && (
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                type="button"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {profile?.name || "User Name"}
            </h3>
            <p className="body-sm text-gray-600">{profile?.email}</p>
            <p className="body-sm text-gray-500">
              Member since{" "}
              {profile?.memberSince
                ? new Date(profile.memberSince).toLocaleDateString()
                : "Unknown"}
            </p>
            {profile?.lastLogin && (
              <p className="body-sm text-gray-500">
                Last login: {new Date(profile.lastLogin).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label
                className="body-sm font-semibold flex items-center"
                htmlFor="name"
              >
                <User className="mr-2 h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="name"
                {...form.register("name")}
                disabled={!isEditing}
                className={form.formState.errors.name ? "border-red-500" : ""}
                placeholder="Enter your full name"
                aria-describedby={
                  form.formState.errors.name ? "name-error" : undefined
                }
              />
              {form.formState.errors.name && (
                <p
                  id="name-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label
                className="body-sm font-semibold flex items-center"
                htmlFor="email"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                disabled={!isEditing}
                className={form.formState.errors.email ? "border-red-500" : ""}
                placeholder="Enter your email address"
                aria-describedby={
                  form.formState.errors.email ? "email-error" : undefined
                }
              />
              {form.formState.errors.email && (
                <p
                  id="email-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {form.formState.errors.email.message}
                </p>
              )}
              {!profile?.emailVerified && (
                <p className="text-sm text-yellow-600">
                  Email not verified.{" "}
                  <button type="button" className="underline">
                    Send verification email
                  </button>
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label
                className="body-sm font-semibold flex items-center"
                htmlFor="phone"
              >
                <Phone className="mr-2 h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                {...form.register("phone")}
                disabled={!isEditing}
                className={form.formState.errors.phone ? "border-red-500" : ""}
                placeholder="Enter your phone number"
                aria-describedby={
                  form.formState.errors.phone ? "phone-error" : undefined
                }
              />
              {form.formState.errors.phone && (
                <p
                  id="phone-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {form.formState.errors.phone.message}
                </p>
              )}
              {!profile?.phoneVerified && form.watch("phone") && (
                <p className="text-sm text-yellow-600">
                  Phone not verified.{" "}
                  <button type="button" className="underline">
                    Send verification SMS
                  </button>
                </p>
              )}
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label
                className="body-sm font-semibold flex items-center"
                htmlFor="company"
              >
                <Building className="mr-2 h-4 w-4" />
                Company
              </Label>
              <Input
                id="company"
                {...form.register("company")}
                disabled={!isEditing}
                className={
                  form.formState.errors.company ? "border-red-500" : ""
                }
                placeholder="Enter your company name"
                aria-describedby={
                  form.formState.errors.company ? "company-error" : undefined
                }
              />
              {form.formState.errors.company && (
                <p
                  id="company-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {form.formState.errors.company.message}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <LoadingOverlay isLoading={form.formState.isSubmitting}>
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={
                    form.formState.isSubmitting || !form.formState.isDirty
                  }
                >
                  <Save className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </LoadingOverlay>
          )}
        </form>

        {/* Additional Profile Info */}
        {!isEditing && (
          <div className="pt-4 border-t space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">
                  Account Status:
                </span>
                <span className="ml-2 text-green-600">Active</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Member Type:</span>
                <span className="ml-2">Premium</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Time Zone:</span>
                <span className="ml-2">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Language:</span>
                <span className="ml-2">English (US)</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
