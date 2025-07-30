import React, { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  RefreshCw,
  AlertCircle,
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Shield,
  Lock,
  Star,
  Check,
  X,
  Calendar,
  MapPin,
  User,
  Globe,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePaymentSources, type PaymentSource } from "@/hooks/useBilling";
import { toast } from "@/hooks/use-toast";

interface PaymentMethodsManagerProps {
  onPaymentMethodSelect?: (paymentMethod: PaymentSource) => void;
  showActions?: boolean;
  compact?: boolean;
}

interface AddPaymentMethodFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  setAsDefault: boolean;
}

export default function PaymentMethodsManager({
  onPaymentMethodSelect,
  showActions = true,
  compact = false,
}: PaymentMethodsManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    paymentSource: PaymentSource | null;
  }>({
    open: false,
    paymentSource: null,
  });
  const [formData, setFormData] = useState<AddPaymentMethodFormData>({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    holderName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    setAsDefault: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    paymentSources,
    loading,
    error,
    addPaymentSource,
    deletePaymentSource,
    setDefaultPaymentSource,
    refetch,
  } = usePaymentSources();

  const handleAddPaymentMethod = async () => {
    setIsSubmitting(true);
    try {
      await addPaymentSource(formData);
      setShowAddDialog(false);
      setFormData({
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        holderName: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
        setAsDefault: false,
      });
    } catch (err) {
      // Error already handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePaymentMethod = (paymentSource: PaymentSource) => {
    setDeleteDialog({ open: true, paymentSource });
  };

  const confirmDeletePaymentMethod = async () => {
    if (deleteDialog.paymentSource) {
      try {
        await deletePaymentSource(deleteDialog.paymentSource.id);
      } catch (err) {
        // Error already handled in hook
      }
    }
    setDeleteDialog({ open: false, paymentSource: null });
  };

  const handleSetDefault = async (paymentSourceId: string) => {
    try {
      await setDefaultPaymentSource(paymentSourceId);
    } catch (err) {
      // Error already handled in hook
    }
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return "💳";
      case "mastercard":
        return "💳";
      case "american express":
      case "amex":
        return "💳";
      case "paypal":
        return "🅿️";
      case "discover":
        return "💳";
      default:
        return "💳";
    }
  };

  const getCardColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return "bg-blue-50 border-blue-200";
      case "mastercard":
        return "bg-red-50 border-red-200";
      case "american express":
      case "amex":
        return "bg-green-50 border-green-200";
      case "paypal":
        return "bg-blue-50 border-blue-200";
      case "discover":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatExpiryDate = (month?: number, year?: number) => {
    if (!month || !year) return "";
    return `${month.toString().padStart(2, "0")}/${year.toString().slice(-2)}`;
  };

  const isFormValid = () => {
    return (
      formData.cardNumber.length >= 13 &&
      formData.expiryMonth &&
      formData.expiryYear &&
      formData.cvv.length >= 3 &&
      formData.holderName.trim() &&
      formData.address.trim() &&
      formData.city.trim() &&
      formData.postalCode.trim()
    );
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading payment methods...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && paymentSources.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Payment Methods
            </h3>
            <p className="text-gray-600">No payment methods found.</p>
          </div>
        )}

        {!loading && !error && paymentSources.length > 0 && (
          <div className="space-y-3">
            {paymentSources.slice(0, 3).map((paymentSource) => (
              <Card
                key={paymentSource.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${getCardColor(paymentSource.brand)}`}
                onClick={() => onPaymentMethodSelect?.(paymentSource)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getCardIcon(paymentSource.brand)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {paymentSource.brand} •••• {paymentSource.last4}
                        </p>
                        <p className="text-sm text-gray-600">
                          {paymentSource.type === "paypal"
                            ? paymentSource.last4
                            : `Expires ${formatExpiryDate(paymentSource.expiryMonth, paymentSource.expiryYear)}`}
                        </p>
                      </div>
                    </div>
                    {paymentSource.isDefault && (
                      <Badge className="bg-primary text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
          <p className="text-gray-600 mt-1">
            Manage your credit cards and payment methods securely
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-green-600" />
                  Add Payment Method
                </DialogTitle>
                <DialogDescription>
                  Add a new credit card or payment method. Your information is
                  secured with 256-bit SSL encryption.
                </DialogDescription>
              </DialogHeader>

              {/* Security Badges */}
              <div className="flex items-center justify-center space-x-6 p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    SSL Encrypted
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    PCI Compliant
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Bank-Level Security
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {/* Card Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Card Information</h3>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cardNumber: e.target.value.replace(/\s/g, ""),
                          })
                        }
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="expiryMonth">Expiry Month</Label>
                        <Select
                          value={formData.expiryMonth}
                          onValueChange={(value) =>
                            setFormData({ ...formData, expiryMonth: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                              (month) => (
                                <SelectItem
                                  key={month}
                                  value={month.toString()}
                                >
                                  {month.toString().padStart(2, "0")}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="expiryYear">Expiry Year</Label>
                        <Select
                          value={formData.expiryYear}
                          onValueChange={(value) =>
                            setFormData({ ...formData, expiryYear: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="YYYY" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(
                              { length: 20 },
                              (_, i) => new Date().getFullYear() + i,
                            ).map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={formData.cvv}
                          onChange={(e) =>
                            setFormData({ ...formData, cvv: e.target.value })
                          }
                          placeholder="123"
                          maxLength={4}
                          type="password"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="holderName">Cardholder Name</Label>
                      <Input
                        id="holderName"
                        value={formData.holderName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            holderName: e.target.value,
                          })
                        }
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Billing Address</h3>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          placeholder="NY"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="postalCode">ZIP Code</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              postalCode: e.target.value,
                            })
                          }
                          placeholder="10001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={formData.country}
                          onValueChange={(value) =>
                            setFormData({ ...formData, country: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="setAsDefault"
                    checked={formData.setAsDefault}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        setAsDefault: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="setAsDefault" className="text-sm">
                    Set as default payment method
                  </Label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPaymentMethod}
                    disabled={!isFormValid() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Add Payment Method
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Loading payment methods...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && paymentSources.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No Payment Methods
            </h3>
            <p className="text-gray-600 mb-6">
              Add a payment method to manage your subscriptions and pay
              invoices.
            </p>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Payment Method
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {!loading && !error && paymentSources.length > 0 && (
        <div className="space-y-4">
          {paymentSources.map((paymentSource) => (
            <Card
              key={paymentSource.id}
              className={`border-2 ${getCardColor(paymentSource.brand)} hover:shadow-lg transition-shadow`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">
                      {getCardIcon(paymentSource.brand)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">
                          {paymentSource.brand}{" "}
                          {paymentSource.type !== "paypal" &&
                            `ending in ${paymentSource.last4}`}
                        </h3>
                        {paymentSource.isDefault && (
                          <Badge className="bg-primary text-white">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{paymentSource.holderName}</span>
                        </div>
                        {paymentSource.type !== "paypal" && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Expires{" "}
                              {formatExpiryDate(
                                paymentSource.expiryMonth,
                                paymentSource.expiryYear,
                              )}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3" />
                          <span>{paymentSource.country}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-green-600">
                        <Shield className="h-3 w-3" />
                        <span>PCI Compliant & Encrypted</span>
                      </div>
                    </div>
                  </div>

                  {showActions && (
                    <div className="flex items-center space-x-3">
                      {!paymentSource.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(paymentSource.id)}
                        >
                          <Star className="mr-1 h-4 w-4" />
                          Set as Default
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePaymentMethod(paymentSource)}
                        disabled={paymentSource.isDefault}
                        className={paymentSource.isDefault ? "opacity-50" : ""}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                {paymentSource.isDefault && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-700">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        This is your default payment method for all
                        subscriptions and invoices.
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Add new payment method card */}
          <Card className="border-2 border-dashed border-gray-300 hover:border-primary/50 transition-colors">
            <CardContent className="text-center py-8">
              <Plus className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Add New Payment Method
              </h3>
              <p className="text-gray-600 mb-4">
                Add another credit card or payment method to your account.
              </p>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, paymentSource: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Delete Payment Method
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment method? This action
              cannot be undone.
              {deleteDialog.paymentSource?.isDefault && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                  You cannot delete your default payment method. Please set
                  another method as default first.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ open: false, paymentSource: null })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeletePaymentMethod}
              disabled={deleteDialog.paymentSource?.isDefault}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete Payment Method
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
