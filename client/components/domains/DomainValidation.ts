import { z } from "zod";

// Validation schema for nameservers
export const nameserverSchema = z.object({
  nameservers: z
    .array(
      z
        .string()
        .min(1, "Nameserver is required")
        .regex(
          /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          "Invalid nameserver format. Must be a valid hostname (e.g., ns1.example.com)"
        )
    )
    .min(2, "At least 2 nameservers are required")
    .max(5, "Maximum 5 nameservers allowed")
    .refine(
      (nameservers) => {
        const unique = new Set(nameservers);
        return unique.size === nameservers.length;
      },
      {
        message: "Duplicate nameservers are not allowed",
      }
    ),
});

// Validation schema for auto-renewal settings
export const autoRenewSchema = z.object({
  autoRenew: z.boolean(),
  renewalPeriod: z.number().min(1).max(10).optional(),
});

// Validation schema for DNS records (for future use)
export const dnsRecordSchema = z.object({
  type: z.enum(["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "PTR"]),
  name: z
    .string()
    .min(1, "Name is required")
    .regex(
      /^[a-zA-Z0-9._*-]*$/,
      "Invalid characters in name. Use only letters, numbers, dots, hyphens, and underscores"
    ),
  value: z.string().min(1, "Value is required"),
  ttl: z.number().min(60, "TTL must be at least 60 seconds").max(86400, "TTL cannot exceed 24 hours"),
  priority: z.number().min(0).max(65535).optional(),
});

// Domain search and filter schema
export const domainFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["all", "active", "expired", "pending_transfer", "pending"]),
  sortBy: z.enum(["name", "expiryDate", "status", "registrationDate"]),
  sortOrder: z.enum(["asc", "desc"]),
});

// Types derived from schemas
export type NameserverFormData = z.infer<typeof nameserverSchema>;
export type AutoRenewFormData = z.infer<typeof autoRenewSchema>;
export type DNSRecordFormData = z.infer<typeof dnsRecordSchema>;
export type DomainFiltersFormData = z.infer<typeof domainFiltersSchema>;

// Helper functions for validation
export const validateDomainName = (domain: string): boolean => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
  return ipv4Regex.test(ip);
};

export const validateIPv6 = (ip: string): boolean => {
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1|::)$/;
  return ipv6Regex.test(ip);
};

// DNS record type specific validations
export const validateDNSRecordValue = (type: string, value: string): boolean => {
  switch (type) {
    case "A":
      return validateIPv4(value);
    case "AAAA":
      return validateIPv6(value);
    case "CNAME":
    case "NS":
      return validateDomainName(value);
    case "MX":
      // MX records should be in format "priority hostname"
      const mxParts = value.split(" ");
      return mxParts.length === 2 && 
             !isNaN(parseInt(mxParts[0])) && 
             validateDomainName(mxParts[1]);
    case "TXT":
      // TXT records can contain any text, but should be reasonable length
      return value.length <= 255;
    case "SRV":
      // SRV records: "priority weight port target"
      const srvParts = value.split(" ");
      return srvParts.length === 4 && 
             srvParts.slice(0, 3).every(part => !isNaN(parseInt(part))) &&
             validateDomainName(srvParts[3]);
    default:
      return true; // Allow any value for unknown types
  }
};

// Error messages for common validation failures
export const validationMessages = {
  nameserver: {
    required: "Nameserver is required",
    invalid: "Invalid nameserver format. Must be a valid hostname (e.g., ns1.example.com)",
    duplicate: "Duplicate nameservers are not allowed",
    minCount: "At least 2 nameservers are required",
    maxCount: "Maximum 5 nameservers allowed",
  },
  domain: {
    required: "Domain name is required",
    invalid: "Invalid domain name format",
  },
  dns: {
    nameRequired: "Record name is required",
    valueRequired: "Record value is required",
    invalidValue: "Invalid value for this record type",
    ttlMin: "TTL must be at least 60 seconds",
    ttlMax: "TTL cannot exceed 24 hours",
  },
};
