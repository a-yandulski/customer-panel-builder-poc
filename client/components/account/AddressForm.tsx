import { useState } from "react";
import { useAddress, AddressFormData } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingOverlay } from "@/components/ui/loading-states";
import { MapPin, Building, CheckCircle, Save, Edit } from "lucide-react";

// Mock country and state data (you might want to fetch this from an API)
const COUNTRIES = [
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
];

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

interface AddressFieldsProps {
  prefix: "billing" | "legal";
  form: any;
  disabled?: boolean;
}

function AddressFields({ prefix, form, disabled }: AddressFieldsProps) {
  const errors = form.formState.errors[prefix] || {};

  return (
    <div className="space-y-4">
      {/* Street Address */}
      <div className="space-y-2">
        <Label className="body-sm font-semibold" htmlFor={`${prefix}-street`}>
          Street Address *
        </Label>
        <Input
          id={`${prefix}-street`}
          {...form.register(`${prefix}.street`)}
          disabled={disabled}
          className={errors.street ? "border-red-500" : ""}
          placeholder="Enter street address"
          aria-describedby={
            errors.street ? `${prefix}-street-error` : undefined
          }
        />
        {errors.street && (
          <p
            id={`${prefix}-street-error`}
            className="text-sm text-red-600"
            role="alert"
          >
            {errors.street.message}
          </p>
        )}
      </div>

      {/* City and State */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="body-sm font-semibold" htmlFor={`${prefix}-city`}>
            City *
          </Label>
          <Input
            id={`${prefix}-city`}
            {...form.register(`${prefix}.city`)}
            disabled={disabled}
            className={errors.city ? "border-red-500" : ""}
            placeholder="Enter city"
            aria-describedby={errors.city ? `${prefix}-city-error` : undefined}
          />
          {errors.city && (
            <p
              id={`${prefix}-city-error`}
              className="text-sm text-red-600"
              role="alert"
            >
              {errors.city.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="body-sm font-semibold" htmlFor={`${prefix}-state`}>
            State/Province *
          </Label>
          <Select
            value={form.watch(`${prefix}.state`)}
            onValueChange={(value) => form.setValue(`${prefix}.state`, value)}
            disabled={disabled}
          >
            <SelectTrigger
              id={`${prefix}-state`}
              className={errors.state ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="text-sm text-red-600" role="alert">
              {errors.state.message}
            </p>
          )}
        </div>
      </div>

      {/* Postal Code and Country */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label
            className="body-sm font-semibold"
            htmlFor={`${prefix}-postalCode`}
          >
            ZIP/Postal Code *
          </Label>
          <Input
            id={`${prefix}-postalCode`}
            {...form.register(`${prefix}.postalCode`)}
            disabled={disabled}
            className={errors.postalCode ? "border-red-500" : ""}
            placeholder="Enter postal code"
            aria-describedby={
              errors.postalCode ? `${prefix}-postalCode-error` : undefined
            }
          />
          {errors.postalCode && (
            <p
              id={`${prefix}-postalCode-error`}
              className="text-sm text-red-600"
              role="alert"
            >
              {errors.postalCode.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label
            className="body-sm font-semibold"
            htmlFor={`${prefix}-country`}
          >
            Country *
          </Label>
          <Select
            value={form.watch(`${prefix}.country`)}
            onValueChange={(value) => form.setValue(`${prefix}.country`, value)}
            disabled={disabled}
          >
            <SelectTrigger
              id={`${prefix}-country`}
              className={errors.country ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-sm text-red-600" role="alert">
              {errors.country.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AddressForm() {
  const [isEditing, setIsEditing] = useState(false);
  const { addresses, isLoading, form, updateAddresses } = useAddress();

  const onSubmit = async (data: AddressFormData) => {
    try {
      await updateAddresses(data);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const sameAsBilling = form.watch("sameAsBilling");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="shadow-md">
            <CardHeader>
              <div className="animate-pulse space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Address Management
          </h3>
          <p className="text-sm text-gray-600">
            Manage your billing and legal addresses
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          disabled={form.formState.isSubmitting}
        >
          <Edit className="mr-2 h-4 w-4" />
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
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
              <AddressFields
                prefix="billing"
                form={form}
                disabled={!isEditing}
              />

              {addresses?.billing?.verified && (
                <div className="flex items-center space-x-2 pt-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="body-sm text-green-600">
                    Address verified
                  </span>
                </div>
              )}
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
              {/* Same as Billing Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="same-as-billing"
                  checked={sameAsBilling}
                  onCheckedChange={(checked) =>
                    form.setValue("sameAsBilling", checked as boolean)
                  }
                  disabled={!isEditing}
                />
                <Label htmlFor="same-as-billing" className="body-sm">
                  Same as billing address
                </Label>
              </div>

              {/* Legal Address Fields - Only show if not same as billing */}
              {!sameAsBilling && (
                <AddressFields
                  prefix="legal"
                  form={form}
                  disabled={!isEditing}
                />
              )}

              {sameAsBilling && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Legal address will be the same as your billing address.
                  </p>
                </div>
              )}

              {addresses?.legal?.verified && !sameAsBilling && (
                <div className="flex items-center space-x-2 pt-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="body-sm text-green-600">
                    Address verified
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <LoadingOverlay isLoading={form.formState.isSubmitting}>
            <div className="flex space-x-3 pt-6">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
                }
              >
                <Save className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? "Saving..." : "Save Addresses"}
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

      {/* Address Validation Info */}
      {!isEditing && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Address Validation</h4>
              <p className="text-sm text-blue-700 mt-1">
                We automatically validate addresses to ensure accurate billing
                and shipping. Verified addresses help prevent delivery issues
                and payment processing delays.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
