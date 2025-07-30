import { z } from "zod";

// Credit card validation schema
export const creditCardSchema = z
  .object({
    cardNumber: z
      .string()
      .min(13, "Card number must be at least 13 digits")
      .max(19, "Card number must be no more than 19 digits")
      .regex(/^\d+$/, "Card number must contain only digits")
      .refine((val) => {
        // Luhn algorithm validation for credit card numbers
        const digits = val.split("").map(Number);
        let sum = 0;
        let isEven = false;

        for (let i = digits.length - 1; i >= 0; i--) {
          let digit = digits[i];

          if (isEven) {
            digit *= 2;
            if (digit > 9) {
              digit = digit
                .toString()
                .split("")
                .map(Number)
                .reduce((a, b) => a + b, 0);
            }
          }

          sum += digit;
          isEven = !isEven;
        }

        return sum % 10 === 0;
      }, "Invalid card number"),

    expiryMonth: z
      .string()
      .min(1, "Expiry month is required")
      .regex(/^(0?[1-9]|1[0-2])$/, "Invalid month")
      .transform((val) => parseInt(val, 10)),

    expiryYear: z
      .string()
      .min(4, "Year must be 4 digits")
      .regex(/^\d{4}$/, "Year must be 4 digits")
      .transform((val) => parseInt(val, 10))
      .refine((year) => {
        const currentYear = new Date().getFullYear();
        return year >= currentYear && year <= currentYear + 20;
      }, "Invalid expiry year"),

    cvv: z
      .string()
      .min(3, "CVV must be at least 3 digits")
      .max(4, "CVV must be no more than 4 digits")
      .regex(/^\d+$/, "CVV must contain only digits"),

    holderName: z
      .string()
      .min(2, "Cardholder name must be at least 2 characters")
      .max(100, "Cardholder name must be no more than 100 characters")
      .regex(/^[a-zA-Z\s\-'\.]+$/, "Invalid characters in cardholder name"),
  })
  .refine(
    (data) => {
      // Check if card is not expired
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      if (data.expiryYear < currentYear) {
        return false;
      }

      if (data.expiryYear === currentYear && data.expiryMonth < currentMonth) {
        return false;
      }

      return true;
    },
    {
      message: "Card has expired",
      path: ["expiryMonth"],
    },
  );

// Billing address validation schema
export const billingAddressSchema = z.object({
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be no more than 200 characters"),

  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be no more than 100 characters")
    .regex(/^[a-zA-Z\s\-'\.]+$/, "Invalid characters in city name"),

  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must be no more than 50 characters"),

  postalCode: z
    .string()
    .min(3, "Postal code must be at least 3 characters")
    .max(10, "Postal code must be no more than 10 characters")
    .regex(/^[a-zA-Z0-9\s\-]+$/, "Invalid postal code format"),

  country: z
    .string()
    .min(2, "Country is required")
    .max(2, "Country code must be 2 characters")
    .regex(/^[A-Z]{2}$/, "Invalid country code"),
});

// Combined payment method schema
export const paymentMethodSchema = z
  .object({
    type: z.enum(["visa", "mastercard", "amex", "discover", "paypal"], {
      errorMap: () => ({ message: "Invalid payment method type" }),
    }),
    setAsDefault: z.boolean().optional().default(false),
  })
  .merge(creditCardSchema)
  .merge(billingAddressSchema);

// Payment method update schema (for existing payment methods)
export const paymentMethodUpdateSchema = z
  .object({
    expiryMonth: z
      .number()
      .min(1, "Invalid month")
      .max(12, "Invalid month")
      .optional(),

    expiryYear: z
      .number()
      .min(new Date().getFullYear(), "Year cannot be in the past")
      .max(new Date().getFullYear() + 20, "Year too far in the future")
      .optional(),

    holderName: z
      .string()
      .min(2, "Cardholder name must be at least 2 characters")
      .max(100, "Cardholder name must be no more than 100 characters")
      .regex(/^[a-zA-Z\s\-'\.]+$/, "Invalid characters in cardholder name")
      .optional(),

    isDefault: z.boolean().optional(),
  })
  .merge(billingAddressSchema.partial());

// Subscription update schema
export const subscriptionUpdateSchema = z.object({
  autoRenewal: z.boolean(),
  paymentMethodId: z.string().optional(),
});

// Invoice payment schema
export const invoicePaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  paymentMethodId: z.string().min(1, "Payment method is required"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .multipleOf(0.01, "Amount must be in valid currency format"),
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("USD"),
});

// Search and filter schemas
export const invoiceFiltersSchema = z
  .object({
    search: z.string().max(200, "Search term too long").optional(),
    status: z.enum(["all", "paid", "pending", "overdue"]).default("all"),
    sortBy: z.enum(["date", "amount", "number", "status"]).default("date"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.number().min(1, "Page must be at least 1").default(1),
    limit: z
      .number()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .default(10),
    dateFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .optional(),
    dateTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    {
      message: "Start date must be before end date",
      path: ["dateFrom"],
    },
  );

// Amount validation for specific currencies
export const amountSchema = z
  .object({
    amount: z.number().positive("Amount must be positive"),
    currency: z.string().length(3, "Invalid currency code"),
  })
  .refine(
    (data) => {
      // Different currencies have different minimum amounts
      const minimums: Record<string, number> = {
        USD: 0.5,
        EUR: 0.5,
        GBP: 0.3,
        CAD: 0.5,
        AUD: 0.5,
        JPY: 50,
      };

      const minimum = minimums[data.currency] || 0.01;
      return data.amount >= minimum;
    },
    {
      message: "Amount below minimum for currency",
      path: ["amount"],
    },
  );

// Utility function to validate card number format
export const validateCardNumber = (
  cardNumber: string,
): {
  isValid: boolean;
  cardType: string | null;
  formattedNumber: string;
} => {
  const cleaned = cardNumber.replace(/\s/g, "");

  // Card type detection
  const cardTypes: Record<string, RegExp> = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
  };

  let cardType: string | null = null;
  for (const [type, pattern] of Object.entries(cardTypes)) {
    if (pattern.test(cleaned)) {
      cardType = type;
      break;
    }
  }

  // Format the card number with spaces
  const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();

  // Validate using Luhn algorithm
  const isValid = creditCardSchema.shape.cardNumber.safeParse(cleaned).success;

  return {
    isValid,
    cardType,
    formattedNumber: formatted,
  };
};

// Utility function to format expiry date
export const formatExpiryDate = (input: string): string => {
  const cleaned = input.replace(/\D/g, "");
  if (cleaned.length >= 2) {
    return (
      cleaned.substring(0, 2) +
      (cleaned.length > 2 ? "/" + cleaned.substring(2, 4) : "")
    );
  }
  return cleaned;
};

// Utility function to validate CVV based on card type
export const validateCVV = (cvv: string, cardType?: string): boolean => {
  const cleaned = cvv.replace(/\D/g, "");

  if (cardType === "amex") {
    return cleaned.length === 4;
  }

  return cleaned.length === 3;
};

// Type exports for TypeScript
export type CreditCardInput = z.input<typeof creditCardSchema>;
export type CreditCard = z.output<typeof creditCardSchema>;
export type BillingAddressInput = z.input<typeof billingAddressSchema>;
export type BillingAddress = z.output<typeof billingAddressSchema>;
export type PaymentMethodInput = z.input<typeof paymentMethodSchema>;
export type PaymentMethod = z.output<typeof paymentMethodSchema>;
export type PaymentMethodUpdateInput = z.input<
  typeof paymentMethodUpdateSchema
>;
export type PaymentMethodUpdate = z.output<typeof paymentMethodUpdateSchema>;
export type SubscriptionUpdateInput = z.input<typeof subscriptionUpdateSchema>;
export type SubscriptionUpdate = z.output<typeof subscriptionUpdateSchema>;
export type InvoicePaymentInput = z.input<typeof invoicePaymentSchema>;
export type InvoicePayment = z.output<typeof invoicePaymentSchema>;
export type InvoiceFiltersInput = z.input<typeof invoiceFiltersSchema>;
export type InvoiceFilters = z.output<typeof invoiceFiltersSchema>;
export type AmountInput = z.input<typeof amountSchema>;
export type Amount = z.output<typeof amountSchema>;
