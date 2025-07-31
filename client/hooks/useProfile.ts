import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/toast";

// Validation schemas
const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .max(100, "Company name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
});

const addressSchema = z.object({
  billing: z.object({
    street: z.string().min(5, "Street address must be at least 5 characters"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State/Province is required"),
    postalCode: z
      .string()
      .regex(/^[\w\s\-]{3,10}$/, "Valid postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  legal: z
    .object({
      street: z.string().min(5, "Street address must be at least 5 characters"),
      city: z.string().min(2, "City is required"),
      state: z.string().min(2, "State/Province is required"),
      postalCode: z
        .string()
        .regex(/^[\w\s\-]{3,10}$/, "Valid postal code is required"),
      country: z.string().min(1, "Country is required"),
    })
    .optional(),
  sameAsBilling: z.boolean(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /(?=.*[a-z])/,
        "Password must contain at least one lowercase letter",
      )
      .regex(
        /(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter",
      )
      .regex(/(?=.*\d)/, "Password must contain at least one number")
      .regex(
        /(?=.*[!@#$%^&*])/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ProfileFormData = z.infer<typeof profileSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;

// Mock token function (replace with actual auth)
const getAuthToken = () => {
  return localStorage.getItem("fake_auth_token") || "mock-token";
};

// Profile management hook
export function useProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
    },
  });

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data.profile);

      // Update form with fetched data
      form.reset({
        name: data.profile.name || "",
        email: data.profile.email || "",
        phone: data.profile.phone || "",
        company: data.profile.company || "",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load profile";
      setError(errorMessage);
      toast.error(errorMessage, { title: "Profile Error" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: ProfileFormData) => {
    try {
      setError(null);

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.details) {
          // Handle field-specific validation errors
          Object.entries(errorData.details).forEach(([field, messages]) => {
            form.setError(field as keyof ProfileFormData, {
              message: (messages as string[])[0],
            });
          });
          throw new Error("Please fix the validation errors");
        }

        throw new Error(errorData.error || "Failed to update profile");
      }

      const result = await response.json();
      setProfile(result.profile);

      toast.success("Profile updated successfully!", {
        title: "Changes Saved",
      });
      return result.profile;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    form,
    updateProfile,
    refetch: fetchProfile,
  };
}

// Address management hook
export function useAddress() {
  const [addresses, setAddresses] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      billing: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      legal: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      sameAsBilling: true,
    },
  });

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/address", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch addresses");
      }

      const data = await response.json();
      setAddresses(data.addresses);

      // Update form with fetched data
      form.reset({
        billing: data.addresses.billing,
        legal: data.addresses.legal,
        sameAsBilling: data.addresses.sameAsBilling,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load addresses";
      setError(errorMessage);
      toast.error(errorMessage, { title: "Address Error" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddresses = async (data: AddressFormData) => {
    try {
      setError(null);

      const response = await fetch("/api/user/address", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.details) {
          // Handle field-specific validation errors
          Object.entries(errorData.details).forEach(([field, messages]) => {
            form.setError(field as any, {
              message: (messages as string[])[0],
            });
          });
          throw new Error("Please fix the validation errors");
        }

        throw new Error(errorData.error || "Failed to update addresses");
      }

      const result = await response.json();
      setAddresses(result.addresses);

      toast.success("Addresses updated successfully!", {
        title: "Changes Saved",
      });
      return result.addresses;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update addresses";
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return {
    addresses,
    isLoading,
    error,
    form,
    updateAddresses,
    refetch: fetchAddresses,
  };
}

// Password change hook
export function usePasswordChange() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePassword = async (data: PasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.details) {
          // Handle field-specific validation errors
          Object.entries(errorData.details).forEach(([field, messages]) => {
            form.setError(field as keyof PasswordFormData, {
              message: (messages as string[])[0],
            });
          });
          throw new Error("Please fix the validation errors");
        }

        throw new Error(errorData.error || "Failed to change password");
      }

      const result = await response.json();

      // Reset form on success
      form.reset();

      toast.success("Password changed successfully!", {
        title: "Security Updated",
      });
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to change password";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getStrengthLabel = (strength: number) => {
    if (strength < 25) return "Weak";
    if (strength < 50) return "Fair";
    if (strength < 75) return "Good";
    return "Strong";
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 25) return "bg-red-500";
    if (strength < 50) return "bg-yellow-500";
    if (strength < 75) return "bg-orange-500";
    return "bg-green-500";
  };

  return {
    isLoading,
    error,
    form,
    changePassword,
    getPasswordStrength,
    getStrengthLabel,
    getStrengthColor,
  };
}

// Two-factor authentication hook
export function useTwoFactor() {
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleTwoFactor = async (enabled: boolean, currentPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/2fa/toggle", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled, currentPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to toggle two-factor authentication",
        );
      }

      const result = await response.json();
      setTwoFactorData(result);

      toast.success(
        enabled
          ? "Two-factor authentication enabled successfully!"
          : "Two-factor authentication disabled successfully!",
        { title: "Security Updated" },
      );

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update two-factor authentication";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTwoFactor = async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/2fa/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to verify code");
      }

      const result = await response.json();
      toast.success("Two-factor authentication verified successfully!", {
        title: "Verification Complete",
      });
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to verify code";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateBackupCodes = async (currentPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/2fa/backup-codes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate backup codes");
      }

      const result = await response.json();
      toast.success("New backup codes generated successfully!", {
        title: "Backup Codes Updated",
      });
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate backup codes";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    twoFactorData,
    toggleTwoFactor,
    verifyTwoFactor,
    generateBackupCodes,
  };
}

// Security information hook
export function useSecurity() {
  const [security, setSecurity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSecurity = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/security", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch security information",
        );
      }

      const data = await response.json();
      setSecurity(data.security);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load security information";
      setError(errorMessage);
      toast.error(errorMessage, { title: "Security Error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurity();
  }, []);

  return {
    security,
    isLoading,
    error,
    refetch: fetchSecurity,
  };
}
