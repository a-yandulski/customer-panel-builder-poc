import { http, HttpResponse, delay } from "msw";

// Utility functions for realistic delays and failure simulation
const randomDelay = (min = 100, max = 800) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const shouldFail = (percentage = 20) => Math.random() * 100 < percentage;

// Mock data
const mockDomains = [
  { id: "1", name: "example.com", status: "active", expiryDate: "2024-12-15" },
  { id: "2", name: "mysite.org", status: "pending", expiryDate: "2025-03-20" },
  {
    id: "3",
    name: "testdomain.net",
    status: "active",
    expiryDate: "2024-08-10",
  },
];

const mockInvoices = [
  { id: "INV-001", amount: 99.99, status: "paid", date: "2024-01-15" },
  { id: "INV-002", amount: 149.99, status: "pending", date: "2024-02-15" },
];

const mockTickets = [
  {
    id: "TKT-001",
    subject: "Domain Transfer Issue",
    status: "open",
    priority: "high",
  },
  {
    id: "TKT-002",
    subject: "SSL Certificate Problem",
    status: "closed",
    priority: "medium",
  },
];

// Mock user data for Auth0 responses
const mockAuth0User = {
  sub: "auth0|123456789",
  name: "John Doe",
  given_name: "John",
  family_name: "Doe",
  middle_name: "",
  nickname: "john.doe",
  preferred_username: "john.doe",
  profile: "https://example.auth0.com/u/auth0|123456789",
  picture: "https://gravatar.com/avatar/example",
  website: "",
  email: "john.doe@example.com",
  email_verified: true,
  gender: "",
  birthdate: "",
  zoneinfo: "",
  locale: "",
  phone_number: "+1-555-123-4567",
  phone_number_verified: false,
  address: {
    country: "US",
  },
  updated_at: new Date().toISOString(),
  "https://customerpanel.example.com/roles": ["customer"],
  "https://customerpanel.example.com/permissions": [
    "profile:read",
    "profile:write",
    "domains:read",
    "domains:write",
    "invoices:read",
    "tickets:read",
    "tickets:write",
    "notifications:read",
  ],
};

export const handlers = [
  // =======================
  // AUTH0 MOCK ENDPOINTS
  // =======================

  // Auth0 userinfo endpoint
  http.get(
    "https://dev-customer-panel.auth0.com/userinfo",
    async ({ request }) => {
      await delay(randomDelay(100, 300));

      const authHeader = request.headers.get("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return HttpResponse.json(
          {
            error: "unauthorized",
            error_description: "Missing or invalid authorization header",
          },
          { status: 401 },
        );
      }

      const token = authHeader.replace("Bearer ", "");

      // Simulate invalid token
      if (token === "invalid_token") {
        return HttpResponse.json(
          { error: "invalid_token", error_description: "Invalid access token" },
          { status: 401 },
        );
      }

      return HttpResponse.json(mockAuth0User);
    },
  ),

  // Auth0 token endpoint for refresh
  http.post(
    "https://dev-customer-panel.auth0.com/oauth/token",
    async ({ request }) => {
      await delay(randomDelay(100, 500));

      const body = await request.text();
      const params = new URLSearchParams(body);

      const grantType = params.get("grant_type");
      const refreshToken = params.get("refresh_token");

      if (grantType === "refresh_token") {
        if (!refreshToken || refreshToken === "invalid_refresh_token") {
          return HttpResponse.json(
            {
              error: "invalid_grant",
              error_description: "Invalid refresh token",
            },
            { status: 401 },
          );
        }

        return HttpResponse.json({
          access_token: `mock_access_token_${Date.now()}`,
          id_token: `mock_id_token_${Date.now()}`,
          token_type: "Bearer",
          expires_in: 3600,
          scope:
            "openid profile email profile:read profile:write domains:read domains:write invoices:read tickets:read tickets:write notifications:read",
        });
      }

      return HttpResponse.json(
        { error: "unsupported_grant_type" },
        { status: 400 },
      );
    },
  ),

  // Auth0 logout endpoint
  http.get("https://dev-customer-panel.auth0.com/v2/logout", async () => {
    await delay(randomDelay(50, 200));
    return new HttpResponse(null, { status: 302, headers: { Location: "/" } });
  }),

  // =======================
  // PROFILE & ACCOUNT MANAGEMENT
  // =======================

  // Get user profile with error scenarios
  http.get("/api/user/profile", async ({ request }) => {
    await delay(randomDelay(200, 800));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate unauthorized access (token expired) (5% chance)
    if (shouldFail(5)) {
      return HttpResponse.json(
        { error: "Token expired. Please login again." },
        { status: 401 },
      );
    }

    // Simulate server error (3% chance)
    if (shouldFail(3)) {
      return HttpResponse.json(
        { error: "Profile service temporarily unavailable" },
        { status: 500 },
      );
    }

    const profileData = {
      id: "user_001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      company: "Example Corp",
      avatar: "https://gravatar.com/avatar/example",
      memberSince: "2022-01-15T00:00:00Z",
      emailVerified: true,
      phoneVerified: false,
      twoFactorEnabled: false,
      lastLogin: "2024-12-12T10:30:00Z",
    };

    return HttpResponse.json({ profile: profileData });
  }),

  // Update user profile with validation scenarios
  http.put("/api/user/profile", async ({ request }) => {
    await delay(randomDelay(500, 1500));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Comprehensive validation errors
    const errors: Record<string, string[]> = {};

    if (!body.name || body.name.trim().length < 2) {
      errors.name = ["Name must be at least 2 characters long"];
    }
    if (body.name && body.name.length > 100) {
      errors.name = ["Name must be less than 100 characters"];
    }

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errors.email = ["Please enter a valid email address"];
    }

    if (body.phone && !/^\+?[\d\s\-\(\)]+$/.test(body.phone)) {
      errors.phone = ["Please enter a valid phone number"];
    }

    if (Object.keys(errors).length > 0) {
      return HttpResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 },
      );
    }

    // Simulate email conflict (5% chance)
    if (body.email === "existing@example.com" || shouldFail(5)) {
      return HttpResponse.json(
        { error: "Email address is already in use" },
        { status: 409 },
      );
    }

    // Simulate profile sync failure (3% chance)
    if (shouldFail(3)) {
      return HttpResponse.json(
        { error: "Failed to sync profile data. Please try again." },
        { status: 503 },
      );
    }

    // Simulate server error (2% chance)
    if (shouldFail(2)) {
      return HttpResponse.json(
        { error: "Profile update failed" },
        { status: 500 },
      );
    }

    return HttpResponse.json({
      profile: {
        id: "user_001",
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // Get user address information
  http.get("/api/user/address", async ({ request }) => {
    await delay(randomDelay(200, 600));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate address not found (4% chance)
    if (shouldFail(4)) {
      return HttpResponse.json(
        { error: "Address information not found" },
        { status: 404 },
      );
    }

    // Simulate network timeout (2% chance)
    if (shouldFail(2)) {
      await delay(8000);
      return HttpResponse.json(
        { error: "Request timeout. Please try again." },
        { status: 408 },
      );
    }

    const addressData = {
      billing: {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "United States",
        verified: true,
      },
      legal: {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "United States",
        verified: true,
      },
      sameAsBilling: true,
    };

    return HttpResponse.json({ addresses: addressData });
  }),

  // Update user address with validation
  http.put("/api/user/address", async ({ request }) => {
    await delay(randomDelay(800, 2000));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Address validation
    const errors: Record<string, string[]> = {};

    if (!body.billing) {
      errors.billing = ["Billing address is required"];
    } else {
      const billing = body.billing;
      if (!billing.street || billing.street.trim().length < 5) {
        errors["billing.street"] = ["Street address must be at least 5 characters"];
      }
      if (!billing.city || billing.city.trim().length < 2) {
        errors["billing.city"] = ["City is required"];
      }
      if (!billing.state || billing.state.trim().length < 2) {
        errors["billing.state"] = ["State/Province is required"];
      }
      if (!billing.postalCode || !/^[\w\s\-]{3,10}$/.test(billing.postalCode)) {
        errors["billing.postalCode"] = ["Valid postal code is required"];
      }
      if (!billing.country) {
        errors["billing.country"] = ["Country is required"];
      }
    }

    // Legal address validation (if provided and not same as billing)
    if (body.legal && !body.sameAsBilling) {
      const legal = body.legal;
      if (!legal.street || legal.street.trim().length < 5) {
        errors["legal.street"] = ["Street address must be at least 5 characters"];
      }
      if (!legal.city || legal.city.trim().length < 2) {
        errors["legal.city"] = ["City is required"];
      }
      if (!legal.state || legal.state.trim().length < 2) {
        errors["legal.state"] = ["State/Province is required"];
      }
      if (!legal.postalCode || !/^[\w\s\-]{3,10}$/.test(legal.postalCode)) {
        errors["legal.postalCode"] = ["Valid postal code is required"];
      }
      if (!legal.country) {
        errors["legal.country"] = ["Country is required"];
      }
    }

    if (Object.keys(errors).length > 0) {
      return HttpResponse.json(
        { error: "Address validation failed", details: errors },
        { status: 422 },
      );
    }

    // Simulate address verification failure (5% chance)
    if (shouldFail(5)) {
      return HttpResponse.json(
        { error: "Address verification failed. Please check the address details." },
        { status: 422 },
      );
    }

    // Simulate service unavailable (3% chance)
    if (shouldFail(3)) {
      return HttpResponse.json(
        { error: "Address service temporarily unavailable" },
        { status: 503 },
      );
    }

    return HttpResponse.json({
      addresses: {
        billing: body.billing,
        legal: body.sameAsBilling ? body.billing : body.legal,
        sameAsBilling: body.sameAsBilling,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // Change password with security validations
  http.post("/api/user/password", async ({ request }) => {
    await delay(randomDelay(1000, 2500));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Password validation
    const errors: Record<string, string[]> = {};

    if (!body.currentPassword) {
      errors.currentPassword = ["Current password is required"];
    }

    if (!body.newPassword) {
      errors.newPassword = ["New password is required"];
    } else {
      if (body.newPassword.length < 8) {
        errors.newPassword = ["Password must be at least 8 characters long"];
      }
      if (!/(?=.*[a-z])/.test(body.newPassword)) {
        errors.newPassword = [...(errors.newPassword || []), "Password must contain at least one lowercase letter"];
      }
      if (!/(?=.*[A-Z])/.test(body.newPassword)) {
        errors.newPassword = [...(errors.newPassword || []), "Password must contain at least one uppercase letter"];
      }
      if (!/(?=.*\d)/.test(body.newPassword)) {
        errors.newPassword = [...(errors.newPassword || []), "Password must contain at least one number"];
      }
      if (!/(?=.*[!@#$%^&*])/.test(body.newPassword)) {
        errors.newPassword = [...(errors.newPassword || []), "Password must contain at least one special character"];
      }
    }

    if (!body.confirmPassword) {
      errors.confirmPassword = ["Please confirm your new password"];
    } else if (body.newPassword !== body.confirmPassword) {
      errors.confirmPassword = ["Passwords do not match"];
    }

    if (Object.keys(errors).length > 0) {
      return HttpResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 },
      );
    }

    // Simulate incorrect current password (15% chance)
    if (body.currentPassword === "wrongpassword" || shouldFail(15)) {
      return HttpResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 },
      );
    }

    // Simulate password reuse policy violation (8% chance)
    if (shouldFail(8)) {
      return HttpResponse.json(
        { error: "New password cannot be the same as your last 5 passwords" },
        { status: 422 },
      );
    }

    // Simulate security policy violation (3% chance)
    if (shouldFail(3)) {
      return HttpResponse.json(
        { error: "Password change blocked due to security policy. Please contact support." },
        { status: 403 },
      );
    }

    // Simulate server error (2% chance)
    if (shouldFail(2)) {
      return HttpResponse.json(
        { error: "Password change failed. Please try again." },
        { status: 500 },
      );
    }

    return HttpResponse.json({
      success: true,
      message: "Password changed successfully",
      updatedAt: new Date().toISOString(),
    });
  }),

  // Enable/disable 2FA
  http.post("/api/user/2fa/toggle", async ({ request }) => {
    await delay(randomDelay(800, 2000));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Simulate missing current password for security
    if (!body.currentPassword) {
      return HttpResponse.json(
        { error: "Current password required for security changes" },
        { status: 400 },
      );
    }

    // Simulate incorrect password (10% chance)
    if (shouldFail(10)) {
      return HttpResponse.json(
        { error: "Incorrect password" },
        { status: 401 },
      );
    }

    // Simulate 2FA service error (5% chance)
    if (shouldFail(5)) {
      return HttpResponse.json(
        { error: "Two-factor authentication service temporarily unavailable" },
        { status: 503 },
      );
    }

    const enabled = body.enabled === true;

    return HttpResponse.json({
      twoFactorEnabled: enabled,
      secretKey: enabled ? "JBSWY3DPEHPK3PXP" : null,
      qrCodeUrl: enabled ? "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/CustomerPanel:john.doe@example.com?secret=JBSWY3DPEHPK3PXP&issuer=CustomerPanel" : null,
      backupCodes: enabled ? [
        "1A2B3C4D", "5E6F7G8H", "9I0J1K2L", "3M4N5O6P",
        "7Q8R9S0T", "1U2V3W4X", "5Y6Z7A8B", "9C0D1E2F"
      ] : null,
      updatedAt: new Date().toISOString(),
    });
  }),

  // Verify 2FA code during setup
  http.post("/api/user/2fa/verify", async ({ request }) => {
    await delay(randomDelay(300, 800));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    if (!body.code || !/^\d{6}$/.test(body.code)) {
      return HttpResponse.json(
        { error: "Invalid verification code format" },
        { status: 400 },
      );
    }

    // Simulate invalid code (20% chance)
    if (body.code === "000000" || shouldFail(20)) {
      return HttpResponse.json(
        { error: "Invalid verification code" },
        { status: 400 },
      );
    }

    // Simulate code expired (5% chance)
    if (shouldFail(5)) {
      return HttpResponse.json(
        { error: "Verification code has expired" },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      verified: true,
      message: "Two-factor authentication verified successfully",
    });
  }),

  // Generate new backup codes
  http.post("/api/user/2fa/backup-codes", async ({ request }) => {
    await delay(randomDelay(500, 1000));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    if (!body.currentPassword) {
      return HttpResponse.json(
        { error: "Current password required for security operation" },
        { status: 400 },
      );
    }

    // Simulate incorrect password (10% chance)
    if (shouldFail(10)) {
      return HttpResponse.json(
        { error: "Incorrect password" },
        { status: 401 },
      );
    }

    const newBackupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    return HttpResponse.json({
      backupCodes: newBackupCodes,
      generatedAt: new Date().toISOString(),
    });
  }),

  // Get user security summary
  http.get("/api/user/security", async ({ request }) => {
    await delay(randomDelay(200, 600));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      security: {
        passwordStrength: "strong",
        passwordLastChanged: "2024-12-10T14:30:00Z",
        twoFactorEnabled: false,
        loginSessions: 3,
        lastLoginFrom: "New York, NY, US",
        suspiciousActivity: false,
        securityScore: 85,
      },
    });
  }),

  // =======================
  // AUTHENTICATION ENDPOINTS
  // =======================

  // Login endpoint with multiple failure scenarios
  http.post("/api/auth/login", async ({ request }) => {
    await delay(randomDelay());

    const body = (await request.json()) as { email: string; password: string };

    // Simulate validation errors (400 Bad Request)
    if (!body.email || !body.password) {
      return HttpResponse.json(
        {
          error: "Validation failed",
          details: {
            email: !body.email ? ["Email is required"] : [],
            password: !body.password ? ["Password is required"] : [],
          },
        },
        { status: 400 },
      );
    }

    // Simulate invalid credentials (401 Unauthorized)
    if (
      body.email === "invalid@example.com" ||
      body.password === "wrongpassword"
    ) {
      return HttpResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Simulate account locked (403 Forbidden)
    if (body.email === "locked@example.com") {
      return HttpResponse.json(
        { error: "Account is locked. Please contact support." },
        { status: 403 },
      );
    }

    // Simulate server error (500 Internal Server Error)
    if (shouldFail(10)) {
      return HttpResponse.json(
        { error: "Internal server error. Please try again later." },
        { status: 500 },
      );
    }

    // Successful login
    return HttpResponse.json({
      token: "mock-jwt-token",
      user: { id: "1", email: body.email, name: "John Doe" },
    });
  }),

  // Token refresh with expiration scenarios
  http.post("/api/auth/refresh", async ({ request }) => {
    await delay(randomDelay(50, 200));

    const authHeader = request.headers.get("Authorization");

    // Simulate expired token (401 Unauthorized)
    if (!authHeader || authHeader === "Bearer expired-token") {
      return HttpResponse.json(
        { error: "Token expired. Please login again." },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      token: "new-mock-jwt-token",
      expiresIn: 3600,
    });
  }),

  // =======================
  // DOMAIN MANAGEMENT SYSTEM
  // =======================

  // Enhanced mock domain data
  http.get("/api/domains", async ({ request }) => {
    await delay(randomDelay(200, 1000));

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const status = url.searchParams.get("status");
    const sortBy = url.searchParams.get("sortBy") || "name";
    const sortOrder = url.searchParams.get("sortOrder") || "asc";

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate server errors (5% chance)
    if (shouldFail(5)) {
      return HttpResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    // Enhanced mock domains data
    const domainsData = [
      {
        id: "dom_001",
        name: "example.com",
        status: "active",
        expiryDate: "2024-12-15",
        registrationDate: "2022-12-15",
        autoRenew: true,
        registrar: "GoDaddy",
        nameservers: ["ns1.example.com", "ns2.example.com"],
        dnsProvider: "Cloudflare",
        locked: true,
        tags: ["production", "primary"],
        contactId: "contact_001",
      },
      {
        id: "dom_002",
        name: "mysite.org",
        status: "active",
        expiryDate: "2025-03-20",
        registrationDate: "2023-03-20",
        autoRenew: false,
        registrar: "Namecheap",
        nameservers: ["ns1.mysite.org", "ns2.mysite.org", "ns3.mysite.org"],
        dnsProvider: "DNS Made Easy",
        locked: false,
        tags: ["development"],
        contactId: "contact_001",
      },
      {
        id: "dom_003",
        name: "business.net",
        status: "active",
        expiryDate: "2024-08-10",
        registrationDate: "2021-08-10",
        autoRenew: true,
        registrar: "Domain.com",
        nameservers: ["ns1.business.net", "ns2.business.net"],
        dnsProvider: "Route53",
        locked: true,
        tags: ["business", "production"],
        contactId: "contact_002",
      },
      {
        id: "dom_004",
        name: "testdomain.co",
        status: "expired",
        expiryDate: "2024-01-15",
        registrationDate: "2022-01-15",
        autoRenew: false,
        registrar: "GoDaddy",
        nameservers: ["ns1.godaddy.com", "ns2.godaddy.com"],
        dnsProvider: "GoDaddy",
        locked: false,
        tags: ["testing"],
        contactId: "contact_001",
      },
      {
        id: "dom_005",
        name: "demo.app",
        status: "pending_transfer",
        expiryDate: "2025-06-30",
        registrationDate: "2023-06-30",
        autoRenew: true,
        registrar: "Transferring to Namecheap",
        nameservers: ["ns1.demo.app", "ns2.demo.app"],
        dnsProvider: "Cloudflare",
        locked: true,
        tags: ["demo"],
        contactId: "contact_001",
      },
    ];

    // Filter domains
    let filteredDomains = [...domainsData];

    // Search filter
    if (search) {
      filteredDomains = filteredDomains.filter(
        (domain) =>
          domain.name.toLowerCase().includes(search) ||
          domain.tags.some((tag) => tag.toLowerCase().includes(search)),
      );
    }

    // Status filter
    if (status && status !== "all") {
      filteredDomains = filteredDomains.filter(
        (domain) => domain.status === status,
      );
    }

    // Sort domains
    filteredDomains.sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];

      if (sortBy === "expiryDate") {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    // Paginate results
    const totalCount = filteredDomains.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDomains = filteredDomains.slice(startIndex, endIndex);

    return HttpResponse.json({
      domains: paginatedDomains,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        search,
        status,
        sortBy,
        sortOrder,
      },
    });
  }),

  // Get specific domain details
  http.get("/api/domains/:id", async ({ params }) => {
    await delay(randomDelay(100, 500));

    // Simulate domain not found
    if (params.id === "nonexistent") {
      return HttpResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // Simulate server error
    if (shouldFail(3)) {
      return HttpResponse.json(
        { error: "Failed to retrieve domain details" },
        { status: 500 },
      );
    }

    const domain = {
      id: params.id,
      name: params.id === "dom_001" ? "example.com" : "mysite.org",
      status: "active",
      expiryDate: "2024-12-15",
      registrationDate: "2022-12-15",
      autoRenew: true,
      registrar: "GoDaddy",
      nameservers: ["ns1.example.com", "ns2.example.com"],
      dnsProvider: "Cloudflare",
      locked: true,
      tags: ["production", "primary"],
      contactId: "contact_001",
    };

    return HttpResponse.json({ domain });
  }),

  // Update domain auto-renew toggle
  http.patch("/api/domains/:id", async ({ request, params }) => {
    await delay(randomDelay(200, 800));

    const body = (await request.json()) as any;

    // Simulate validation errors
    if (body.autoRenew === undefined) {
      return HttpResponse.json(
        {
          error: "Validation failed",
          details: {
            autoRenew: ["Auto-renew field is required"],
          },
        },
        { status: 400 },
      );
    }

    // Simulate domain locked error
    if (params.id === "dom_locked") {
      return HttpResponse.json(
        { error: "Domain is locked and cannot be modified" },
        { status: 409 },
      );
    }

    // Simulate expired domain error
    if (params.id === "dom_expired") {
      return HttpResponse.json(
        { error: "Cannot modify expired domain" },
        { status: 422 },
      );
    }

    // Simulate server error
    if (shouldFail(5)) {
      return HttpResponse.json(
        { error: "Failed to update domain settings" },
        { status: 500 },
      );
    }

    return HttpResponse.json({
      domain: {
        id: params.id,
        autoRenew: body.autoRenew,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // Get DNS records for domain
  http.get("/api/domains/:id/dns", async ({ params, request }) => {
    await delay(randomDelay(300, 1200));

    const url = new URL(request.url);
    const recordType = url.searchParams.get("type");
    const sortBy = url.searchParams.get("sortBy") || "name";

    // Simulate domain not found
    if (params.id === "nonexistent") {
      return HttpResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // Simulate DNS service unavailable
    if (shouldFail(8)) {
      return HttpResponse.json(
        { error: "DNS service temporarily unavailable" },
        { status: 503 },
      );
    }

    // Mock DNS records
    let dnsRecords = [
      {
        id: "dns_001",
        type: "A",
        name: "@",
        value: "192.0.2.1",
        ttl: 3600,
        priority: null,
      },
      {
        id: "dns_002",
        type: "A",
        name: "www",
        value: "192.0.2.1",
        ttl: 3600,
        priority: null,
      },
      {
        id: "dns_003",
        type: "CNAME",
        name: "blog",
        value: "example.com",
        ttl: 3600,
        priority: null,
      },
      {
        id: "dns_004",
        type: "MX",
        name: "@",
        value: "mail.example.com",
        ttl: 3600,
        priority: 10,
      },
      {
        id: "dns_005",
        type: "TXT",
        name: "@",
        value: "v=spf1 include:_spf.google.com ~all",
        ttl: 3600,
        priority: null,
      },
      {
        id: "dns_006",
        type: "AAAA",
        name: "@",
        value: "2001:db8::1",
        ttl: 3600,
        priority: null,
      },
    ];

    // Filter by record type
    if (recordType && recordType !== "all") {
      dnsRecords = dnsRecords.filter(
        (record) => record.type === recordType.toUpperCase(),
      );
    }

    // Sort records
    dnsRecords.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      return String(aValue).localeCompare(String(bValue));
    });

    return HttpResponse.json({
      records: dnsRecords,
      domain: params.id,
      totalCount: dnsRecords.length,
    });
  }),

  // Update nameservers
  http.patch("/api/domains/:id/nameservers", async ({ request, params }) => {
    await delay(randomDelay(500, 1500));

    const body = (await request.json()) as any;

    // Simulate validation errors
    if (!body.nameservers || !Array.isArray(body.nameservers)) {
      return HttpResponse.json(
        {
          error: "Validation failed",
          details: {
            nameservers: ["Nameservers array is required"],
          },
        },
        { status: 400 },
      );
    }

    if (body.nameservers.length < 2 || body.nameservers.length > 5) {
      return HttpResponse.json(
        {
          error: "Validation failed",
          details: {
            nameservers: ["Must provide between 2 and 5 nameservers"],
          },
        },
        { status: 422 },
      );
    }

    // Validate nameserver format
    const nsRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const invalidNs = body.nameservers.find((ns: string) => !nsRegex.test(ns));
    if (invalidNs) {
      return HttpResponse.json(
        {
          error: "Validation failed",
          details: {
            nameservers: [`Invalid nameserver format: ${invalidNs}`],
          },
        },
        { status: 422 },
      );
    }

    // Simulate rate limiting
    if (shouldFail(10)) {
      return HttpResponse.json(
        {
          error:
            "Too many nameserver updates. Please wait before trying again.",
        },
        {
          status: 429,
          headers: { "Retry-After": "300" },
        },
      );
    }

    // Simulate server error
    if (shouldFail(5)) {
      return HttpResponse.json(
        { error: "Failed to update nameservers" },
        { status: 500 },
      );
    }

    return HttpResponse.json({
      domain: {
        id: params.id,
        nameservers: body.nameservers,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // =======================
  // BILLING SYSTEM
  // =======================

  // Invoice listing with error scenarios
  http.get("/api/invoices", async ({ request }) => {
    await delay(randomDelay(300, 1200));

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const status = url.searchParams.get("status");
    const sortBy = url.searchParams.get("sortBy") || "date";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate server errors (8% chance)
    if (shouldFail(8)) {
      return HttpResponse.json(
        { error: "Billing service temporarily unavailable" },
        { status: 500 },
      );
    }

    // Simulate rate limiting (3% chance)
    if (shouldFail(3)) {
      return HttpResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
        { headers: { "Retry-After": "60" } },
      );
    }

    const invoicesData = [
      {
        id: "inv_001",
        number: "INV-2024-001",
        date: "2024-12-01T10:30:00Z",
        dueDate: "2024-12-15T23:59:59Z",
        amount: 47.0,
        currency: "USD",
        status: "paid",
        description: "Domain renewal - example.com",
        lineItems: [
          { description: "Domain renewal", quantity: 1, unitPrice: 15.99 },
          { description: "Privacy protection", quantity: 1, unitPrice: 9.99 },
          { description: "Tax", quantity: 1, unitPrice: 21.02 },
        ],
        paymentMethod: "Visa ending in 4242",
        paymentDate: "2024-12-01T10:45:00Z",
        downloadUrl: "/api/invoices/inv_001/pdf",
      },
      {
        id: "inv_002",
        number: "INV-2024-002",
        date: "2024-11-15T14:22:00Z",
        dueDate: "2024-12-15T23:59:59Z",
        amount: 120.0,
        currency: "USD",
        status: "pending",
        description: "Hosting plan upgrade",
        lineItems: [
          {
            description: "Professional Hosting (12 months)",
            quantity: 1,
            unitPrice: 99.99,
          },
          { description: "Setup fee", quantity: 1, unitPrice: 20.01 },
        ],
        paymentMethod: null,
        paymentDate: null,
        downloadUrl: "/api/invoices/inv_002/pdf",
      },
      {
        id: "inv_003",
        number: "INV-2024-003",
        date: "2024-10-20T09:15:00Z",
        dueDate: "2024-11-20T23:59:59Z",
        amount: 89.99,
        currency: "USD",
        status: "overdue",
        description: "SSL certificate renewal",
        lineItems: [
          {
            description: "Extended Validation SSL",
            quantity: 1,
            unitPrice: 79.99,
          },
          { description: "Installation service", quantity: 1, unitPrice: 10.0 },
        ],
        paymentMethod: null,
        paymentDate: null,
        downloadUrl: "/api/invoices/inv_003/pdf",
      },
      {
        id: "inv_004",
        number: "INV-2024-004",
        date: "2024-10-01T16:45:00Z",
        dueDate: "2024-10-15T23:59:59Z",
        amount: 15.99,
        currency: "USD",
        status: "paid",
        description: "Domain registration - newsite.com",
        lineItems: [
          {
            description: "Domain registration (.com)",
            quantity: 1,
            unitPrice: 15.99,
          },
        ],
        paymentMethod: "Mastercard ending in 8888",
        paymentDate: "2024-10-01T17:00:00Z",
        downloadUrl: "/api/invoices/inv_004/pdf",
      },
      {
        id: "inv_005",
        number: "INV-2024-005",
        date: "2024-09-12T11:30:00Z",
        dueDate: "2024-09-27T23:59:59Z",
        amount: 299.99,
        currency: "USD",
        status: "paid",
        description: "Annual hosting package",
        lineItems: [
          {
            description: "Business Hosting (12 months)",
            quantity: 1,
            unitPrice: 249.99,
          },
          { description: "Premium support", quantity: 1, unitPrice: 50.0 },
        ],
        paymentMethod: "Visa ending in 4242",
        paymentDate: "2024-09-12T11:45:00Z",
        downloadUrl: "/api/invoices/inv_005/pdf",
      },
    ];

    // Filter invoices
    let filteredInvoices = invoicesData;

    if (search) {
      filteredInvoices = filteredInvoices.filter(
        (invoice) =>
          invoice.number.toLowerCase().includes(search) ||
          invoice.description.toLowerCase().includes(search),
      );
    }

    if (status && status !== "all") {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => invoice.status === status,
      );
    }

    // Sort invoices
    filteredInvoices.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "number":
          aValue = a.number;
          bValue = b.number;
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    // Paginate results
    const totalCount = filteredInvoices.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const paginatedInvoices = filteredInvoices.slice(
      startIndex,
      startIndex + limit,
    );

    return HttpResponse.json({
      invoices: paginatedInvoices,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: { search, status, sortBy, sortOrder, page, limit },
    });
  }),

  // Individual invoice details
  http.get("/api/invoices/:invoiceId", async ({ params, request }) => {
    await delay(randomDelay(200, 800));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate not found (invoice doesn't exist)
    if (params.invoiceId === "inv_999") {
      return HttpResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Simulate server error (5% chance)
    if (shouldFail(5)) {
      return HttpResponse.json(
        { error: "Failed to retrieve invoice details" },
        { status: 500 },
      );
    }

    // Return mock invoice details
    return HttpResponse.json({
      invoice: {
        id: params.invoiceId,
        number: `INV-2024-${params.invoiceId?.slice(-3)}`,
        date: "2024-12-01T10:30:00Z",
        dueDate: "2024-12-15T23:59:59Z",
        amount: 47.0,
        currency: "USD",
        status: "paid",
        description: "Domain renewal - example.com",
        lineItems: [
          { description: "Domain renewal", quantity: 1, unitPrice: 15.99 },
          { description: "Privacy protection", quantity: 1, unitPrice: 9.99 },
          { description: "Tax", quantity: 1, unitPrice: 21.02 },
        ],
        paymentMethod: "Visa ending in 4242",
        paymentDate: "2024-12-01T10:45:00Z",
        billingAddress: {
          name: "John Doe",
          company: "Acme Corp",
          street: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
      },
    });
  }),

  // PDF download with error scenarios
  http.get("/api/invoices/:invoiceId/pdf", async ({ params, request }) => {
    await delay(randomDelay(500, 2000));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate invoice not found (10% chance or specific IDs)
    if (params.invoiceId === "inv_999" || shouldFail(10)) {
      return HttpResponse.json(
        { error: "Invoice not found or PDF not available" },
        { status: 404 },
      );
    }

    // Simulate service unavailable (PDF generation service down) (5% chance)
    if (shouldFail(5)) {
      return HttpResponse.json(
        { error: "PDF generation service temporarily unavailable" },
        { status: 503 },
        { headers: { "Retry-After": "120" } },
      );
    }

    // Simulate rate limiting for PDF downloads (3% chance)
    if (shouldFail(3)) {
      return HttpResponse.json(
        {
          error:
            "Too many PDF download requests. Please wait before trying again.",
        },
        { status: 429 },
        { headers: { "Retry-After": "30" } },
      );
    }

    // Redirect to mock PDF URL (successful case)
    return new Response(null, {
      status: 302,
      headers: {
        Location: `https://mockpdfs.example.com/invoice-${params.invoiceId}.pdf`,
      },
    });
  }),

  // Subscriptions listing with errors
  http.get("/api/subscriptions", async ({ request }) => {
    await delay(randomDelay(400, 1500));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate network timeout (longer delay + error) (4% chance)
    if (shouldFail(4)) {
      await delay(8000);
      return HttpResponse.json(
        { error: "Request timeout. Please try again." },
        { status: 408 },
      );
    }

    // Simulate subscription sync issues (6% chance)
    if (shouldFail(6)) {
      return HttpResponse.json(
        {
          error:
            "Subscription data synchronization in progress. Please try again in a few minutes.",
        },
        { status: 503 },
        { headers: { "Retry-After": "180" } },
      );
    }

    const subscriptionsData = [
      {
        id: "sub_001",
        service: "Web Hosting Pro",
        plan: "Professional Plan",
        amount: 29.99,
        currency: "USD",
        billingCycle: "monthly",
        nextPayment: "2024-12-15T00:00:00Z",
        paymentMethod: "Visa ending in 4242",
        autoRenewal: true,
        status: "active",
        startDate: "2023-12-15T00:00:00Z",
        features: [
          "50GB Storage",
          "Unlimited Bandwidth",
          "Email Accounts",
          "SSL Certificate",
        ],
        cancellationPolicy: "Cancel anytime with 30 days notice",
      },
      {
        id: "sub_002",
        service: "Domain Registration",
        plan: "example.com",
        amount: 12.99,
        currency: "USD",
        billingCycle: "yearly",
        nextPayment: "2025-12-15T00:00:00Z",
        paymentMethod: "Visa ending in 4242",
        autoRenewal: true,
        status: "active",
        startDate: "2022-12-15T00:00:00Z",
        features: ["Domain Name", "DNS Management", "Privacy Protection"],
        cancellationPolicy: "Non-refundable domain registration",
      },
      {
        id: "sub_003",
        service: "SSL Certificate",
        plan: "Extended Validation",
        amount: 49.99,
        currency: "USD",
        billingCycle: "yearly",
        nextPayment: "2025-01-05T00:00:00Z",
        paymentMethod: "Mastercard ending in 8888",
        autoRenewal: false,
        status: "active",
        startDate: "2024-01-05T00:00:00Z",
        features: [
          "EV SSL Certificate",
          "Green Address Bar",
          "Warranty Protection",
        ],
        cancellationPolicy: "Prorated refund available",
      },
    ];

    return HttpResponse.json({
      subscriptions: subscriptionsData,
      totalCount: subscriptionsData.length,
    });
  }),

  // Update subscription auto-renewal
  http.patch(
    "/api/subscriptions/:subscriptionId",
    async ({ params, request }) => {
      await delay(randomDelay(300, 1000));

      const authHeader = request.headers.get("Authorization");
      if (!authHeader) {
        return HttpResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }

      const body = await request.json();

      // Simulate forbidden action (subscription can't be modified) (5% chance)
      if (shouldFail(5)) {
        return HttpResponse.json(
          { error: "This subscription cannot be modified at this time" },
          { status: 403 },
        );
      }

      // Simulate server error (3% chance)
      if (shouldFail(3)) {
        return HttpResponse.json(
          { error: "Failed to update subscription" },
          { status: 500 },
        );
      }

      return HttpResponse.json({
        subscription: {
          id: params.subscriptionId,
          autoRenewal: body.autoRenewal,
          updatedAt: new Date().toISOString(),
        },
      });
    },
  ),

  // Payment methods listing with security errors
  http.get("/api/payment_sources", async ({ request }) => {
    await delay(randomDelay(200, 800));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate forbidden access (user not authorized for payment info) (3% chance)
    if (shouldFail(3)) {
      return HttpResponse.json(
        { error: "Insufficient permissions to access payment methods" },
        { status: 403 },
      );
    }

    // Simulate PCI compliance service unavailable (2% chance)
    if (shouldFail(2)) {
      return HttpResponse.json(
        {
          error:
            "Payment processing service temporarily unavailable for security maintenance",
        },
        { status: 503 },
        { headers: { "Retry-After": "300" } },
      );
    }

    const paymentMethodsData = [
      {
        id: "pm_001",
        type: "visa",
        last4: "4242",
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true,
        holderName: "John Doe",
        brand: "Visa",
        country: "US",
        addedDate: "2023-01-15T10:30:00Z",
        fingerprint: "Xt5EWLLDS7FJjR1c",
      },
      {
        id: "pm_002",
        type: "mastercard",
        last4: "8888",
        expiryMonth: 8,
        expiryYear: 2027,
        isDefault: false,
        holderName: "John Doe",
        brand: "Mastercard",
        country: "US",
        addedDate: "2023-06-20T14:22:00Z",
        fingerprint: "Xt5EWLLDS7FJjR1d",
      },
      {
        id: "pm_003",
        type: "paypal",
        last4: "john@example.com",
        expiryMonth: null,
        expiryYear: null,
        isDefault: false,
        holderName: "john@example.com",
        brand: "PayPal",
        country: "US",
        addedDate: "2023-08-10T09:45:00Z",
        fingerprint: null,
      },
    ];

    return HttpResponse.json({
      paymentSources: paymentMethodsData,
      totalCount: paymentMethodsData.length,
    });
  }),

  // Add payment method with validation errors
  http.post("/api/payment_sources", async ({ request }) => {
    await delay(randomDelay(800, 2000));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Simulate validation errors (15% chance)
    if (shouldFail(15)) {
      return HttpResponse.json(
        {
          error: "Payment method validation failed",
          details: [
            { field: "cardNumber", issue: "Invalid card number" },
            { field: "expiryDate", issue: "Card has expired" },
          ],
        },
        { status: 422 },
      );
    }

    // Simulate payment processing errors (8% chance)
    if (shouldFail(8)) {
      return HttpResponse.json(
        { error: "Payment processor temporarily unavailable" },
        { status: 503 },
      );
    }

    // Simulate fraud detection (2% chance)
    if (shouldFail(2)) {
      return HttpResponse.json(
        { error: "Payment method rejected for security reasons" },
        { status: 403 },
      );
    }

    return HttpResponse.json(
      {
        paymentSource: {
          id: `pm_${Date.now()}`,
          type: body.type || "visa",
          last4: body.cardNumber?.slice(-4) || "0000",
          isDefault: body.setAsDefault || false,
          addedDate: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),

  // Delete payment method
  http.delete(
    "/api/payment_sources/:paymentSourceId",
    async ({ params, request }) => {
      await delay(randomDelay(300, 800));

      const authHeader = request.headers.get("Authorization");
      if (!authHeader) {
        return HttpResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }

      // Simulate cannot delete default payment method
      if (params.paymentSourceId === "pm_001") {
        return HttpResponse.json(
          {
            error:
              "Cannot delete default payment method. Please set another method as default first.",
          },
          { status: 409 },
        );
      }

      // Simulate server error (5% chance)
      if (shouldFail(5)) {
        return HttpResponse.json(
          { error: "Failed to delete payment method" },
          { status: 500 },
        );
      }

      return HttpResponse.json({ deleted: true });
    },
  ),

  // Set default payment method
  http.post(
    "/api/payment_sources/:paymentSourceId/default",
    async ({ params, request }) => {
      await delay(randomDelay(200, 600));

      const authHeader = request.headers.get("Authorization");
      if (!authHeader) {
        return HttpResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }

      // Simulate server error (3% chance)
      if (shouldFail(3)) {
        return HttpResponse.json(
          { error: "Failed to update default payment method" },
          { status: 500 },
        );
      }

      return HttpResponse.json({
        paymentSource: {
          id: params.paymentSourceId,
          isDefault: true,
          updatedAt: new Date().toISOString(),
        },
      });
    },
  ),

  // Billing summary/dashboard
  http.get("/api/billing/summary", async ({ request }) => {
    await delay(randomDelay(300, 1000));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate service error (4% chance)
    if (shouldFail(4)) {
      return HttpResponse.json(
        { error: "Billing summary temporarily unavailable" },
        { status: 503 },
      );
    }

    return HttpResponse.json({
      currentBalance: 0.0,
      accountCredit: 127.5,
      nextPayment: {
        amount: 47.0,
        dueDate: "2024-12-15T00:00:00Z",
        description: "Web Hosting Pro renewal",
      },
      monthlySpend: {
        amount: 247.0,
        transactionCount: 5,
        period: "2024-12",
      },
      upcomingCharges: [
        {
          id: "upcoming_001",
          service: "Web Hosting Pro",
          amount: 29.99,
          dueDate: "2024-12-15T00:00:00Z",
        },
        {
          id: "upcoming_002",
          service: "Domain Renewal",
          amount: 15.99,
          dueDate: "2024-12-20T00:00:00Z",
        },
      ],
    });
  }),

  // =======================
  // SUPPORT TICKET SYSTEM
  // =======================

  // Enhanced mock ticket data
  http.get("/api/tickets", async ({ request }) => {
    await delay(randomDelay(300, 1200));

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const status = url.searchParams.get("status");
    const sortBy = url.searchParams.get("sortBy") || "created";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate server errors (7% chance)
    if (shouldFail(7)) {
      return HttpResponse.json(
        { error: "Support system temporarily unavailable" },
        { status: 500 },
      );
    }

    // Simulate pagination service errors (3% chance)
    if (shouldFail(3) && page > 1) {
      return HttpResponse.json(
        { error: "Failed to load page. Please try again." },
        { status: 503 },
      );
    }

    const ticketsData = [
      {
        id: "TKT-2024-001",
        subject: "Domain transfer issue - example.com not working",
        status: "open",
        priority: "high",
        category: "domain",
        created: "2024-12-10T09:15:00Z",
        updated: "2024-12-11T11:30:00Z",
        assignedAgent: "Sarah Johnson",
        lastReplyBy: "agent",
        messageCount: 3,
        hasAttachments: false,
        tags: ["domain-transfer", "urgent"],
        firstMessage: "I'm having trouble transferring my domain example.com to your service...",
      },
      {
        id: "TKT-2024-002",
        subject: "Email not working after server migration",
        status: "in_progress",
        priority: "normal",
        category: "technical",
        created: "2024-12-08T15:20:00Z",
        updated: "2024-12-09T10:45:00Z",
        assignedAgent: "Mike Chen",
        lastReplyBy: "customer",
        messageCount: 2,
        hasAttachments: true,
        tags: ["email", "server-migration"],
        firstMessage: "After the recent server migration, my email accounts aren't working...",
      },
      {
        id: "TKT-2024-003",
        subject: "SSL certificate installation completed",
        status: "solved",
        priority: "low",
        category: "technical",
        created: "2024-12-05T10:00:00Z",
        updated: "2024-12-06T14:30:00Z",
        assignedAgent: "Alex Rivera",
        lastReplyBy: "agent",
        messageCount: 2,
        hasAttachments: false,
        tags: ["ssl", "completed"],
        firstMessage: "I need help installing an SSL certificate on my website...",
      },
      {
        id: "TKT-2024-004",
        subject: "Billing discrepancy for November invoice",
        status: "waiting",
        priority: "normal",
        category: "billing",
        created: "2024-12-07T13:15:00Z",
        updated: "2024-12-08T09:22:00Z",
        assignedAgent: "Jennifer Davis",
        lastReplyBy: "agent",
        messageCount: 4,
        hasAttachments: true,
        tags: ["billing", "invoice"],
        firstMessage: "I noticed an incorrect charge on my November invoice...",
      },
      {
        id: "TKT-2024-005",
        subject: "Website loading slowly since hosting upgrade",
        status: "open",
        priority: "high",
        category: "hosting",
        created: "2024-12-09T08:30:00Z",
        updated: "2024-12-09T16:15:00Z",
        assignedAgent: null,
        lastReplyBy: "customer",
        messageCount: 1,
        hasAttachments: false,
        tags: ["performance", "hosting"],
        firstMessage: "My website has been loading very slowly since the hosting upgrade...",
      },
    ];

    // Filter tickets
    let filteredTickets = ticketsData;

    if (search) {
      filteredTickets = filteredTickets.filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(search) ||
          ticket.id.toLowerCase().includes(search) ||
          ticket.firstMessage.toLowerCase().includes(search),
      );
    }

    if (status && status !== "all") {
      filteredTickets = filteredTickets.filter(
        (ticket) => ticket.status === status,
      );
    }

    // Sort tickets
    filteredTickets.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "created":
          aValue = new Date(a.created).getTime();
          bValue = new Date(b.created).getTime();
          break;
        case "updated":
          aValue = new Date(a.updated).getTime();
          bValue = new Date(b.updated).getTime();
          break;
        case "subject":
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
          break;
        case "priority":
          const priorityOrder = { low: 1, normal: 2, high: 3, urgent: 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        default:
          aValue = a.created;
          bValue = b.created;
      }

      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    // Paginate results
    const totalCount = filteredTickets.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const paginatedTickets = filteredTickets.slice(startIndex, startIndex + limit);

    return HttpResponse.json({
      tickets: paginatedTickets,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: { search, status, sortBy, sortOrder, page, limit },
    });
  }),

  // Individual ticket details with conversation
  http.get("/api/tickets/:ticketId", async ({ params, request }) => {
    await delay(randomDelay(200, 800));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate ticket not found (5% chance or specific IDs)
    if (params.ticketId === "TKT-999" || shouldFail(5)) {
      return HttpResponse.json(
        { error: "Ticket not found or access denied" },
        { status: 404 },
      );
    }

    // Simulate forbidden access (2% chance)
    if (shouldFail(2)) {
      return HttpResponse.json(
        { error: "You don't have permission to view this ticket" },
        { status: 403 },
      );
    }

    // Simulate server error (4% chance)
    if (shouldFail(4)) {
      return HttpResponse.json(
        { error: "Failed to load ticket conversation" },
        { status: 500 },
      );
    }

    // Return mock ticket conversation based on ID
    const ticketConversations: Record<string, any> = {
      "TKT-2024-001": {
        id: "TKT-2024-001",
        subject: "Domain transfer issue - example.com not working",
        status: "open",
        priority: "high",
        category: "domain",
        created: "2024-12-10T09:15:00Z",
        updated: "2024-12-11T11:30:00Z",
        assignedAgent: "Sarah Johnson",
        tags: ["domain-transfer", "urgent"],
        messages: [
          {
            id: "msg_001",
            author: "John Doe",
            authorType: "customer",
            message: "I'm having trouble transferring my domain example.com to your service. I initiated the transfer 3 days ago but it's still showing as pending. Can you please help?",
            timestamp: "2024-12-10T09:15:00Z",
            attachments: [],
          },
          {
            id: "msg_002",
            author: "Sarah Johnson",
            authorType: "agent",
            message: "Hi John, I've reviewed your domain transfer request. The transfer is currently awaiting authorization from your previous registrar. I've expedited the process and you should receive an authorization email within the next few hours. Please check your email and approve the transfer.",
            timestamp: "2024-12-10T11:30:00Z",
            attachments: [],
          },
          {
            id: "msg_003",
            author: "John Doe",
            authorType: "customer",
            message: "Thanks Sarah! I received the email and approved the transfer. How long should I expect it to take now?",
            timestamp: "2024-12-10T14:45:00Z",
            attachments: [],
          },
        ],
      },
      "TKT-2024-002": {
        id: "TKT-2024-002",
        subject: "Email not working after server migration",
        status: "in_progress",
        priority: "normal",
        category: "technical",
        created: "2024-12-08T15:20:00Z",
        updated: "2024-12-09T10:45:00Z",
        assignedAgent: "Mike Chen",
        tags: ["email", "server-migration"],
        messages: [
          {
            id: "msg_001",
            author: "Jane Smith",
            authorType: "customer",
            message: "After the recent server migration, my email accounts aren't working. I can't send or receive emails through Outlook. I've tried re-configuring the settings but nothing seems to work.",
            timestamp: "2024-12-08T15:20:00Z",
            attachments: [
              {
                id: "att_001",
                name: "outlook-settings.png",
                size: 245760,
                type: "image/png",
                url: "/api/attachments/att_001",
              },
            ],
          },
          {
            id: "msg_002",
            author: "Mike Chen",
            authorType: "agent",
            message: "Hi Jane, I can see the migration has affected your email configuration. The server settings have changed. Please update your Outlook with these new settings: IMAP Server: mail.newserver.com, Port: 993, Security: SSL/TLS. I'll send you a detailed configuration guide.",
            timestamp: "2024-12-09T10:45:00Z",
            attachments: [
              {
                id: "att_002",
                name: "email-configuration-guide.pdf",
                size: 1048576,
                type: "application/pdf",
                url: "/api/attachments/att_002",
              },
            ],
          },
        ],
      },
    };

    const ticket = ticketConversations[params.ticketId as string] || {
      id: params.ticketId,
      subject: "Sample Ticket",
      status: "open",
      priority: "normal",
      category: "general",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      assignedAgent: null,
      tags: [],
      messages: [
        {
          id: "msg_001",
          author: "Customer",
          authorType: "customer",
          message: "This is a sample ticket message.",
          timestamp: new Date().toISOString(),
          attachments: [],
        },
      ],
    };

    return HttpResponse.json({ ticket });
  }),

  // Create new ticket with file upload support
  http.post("/api/tickets", async ({ request }) => {
    await delay(randomDelay(800, 2500));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    try {
      const formData = await request.formData();
      const subject = formData.get("subject") as string;
      const message = formData.get("message") as string;
      const category = formData.get("category") as string;
      const priority = formData.get("priority") as string;
      const files = formData.getAll("attachments") as File[];

      // Comprehensive validation
      const errors: Record<string, string[]> = {};

      if (!subject || subject.trim().length < 3) {
        errors.subject = ["Subject must be at least 3 characters long"];
      }
      if (subject && subject.length > 200) {
        errors.subject = ["Subject must be less than 200 characters"];
      }

      if (!message || message.trim().length < 10) {
        errors.message = ["Message must be at least 10 characters long"];
      }
      if (message && message.length > 5000) {
        errors.message = ["Message must be less than 5000 characters"];
      }

      if (!category) {
        errors.category = ["Please select a category"];
      }

      if (!priority) {
        errors.priority = ["Please select a priority level"];
      }

      // File validation
      if (files.length > 5) {
        errors.attachments = ["Maximum 5 files allowed"];
      }

      const maxFileSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = [
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "application/pdf", "text/plain", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      for (const file of files) {
        if (file.size > maxFileSize) {
          errors.attachments = [...(errors.attachments || []), `File ${file.name} exceeds 5MB limit`];
        }
        if (!allowedTypes.includes(file.type)) {
          errors.attachments = [...(errors.attachments || []), `File type ${file.type} not allowed`];
        }
      }

      if (Object.keys(errors).length > 0) {
        return HttpResponse.json(
          { error: "Validation failed", details: errors },
          { status: 422 },
        );
      }

      // Simulate payload too large error (2% chance or large files)
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 20 * 1024 * 1024 || shouldFail(2)) {
        return HttpResponse.json(
          { error: "Request entity too large. Total file size exceeds limit." },
          { status: 413 },
        );
      }

      // Simulate file processing failures (3% chance)
      if (shouldFail(3)) {
        return HttpResponse.json(
          { error: "File processing failed. Please try again or reduce file sizes." },
          { status: 507 },
        );
      }

      // Simulate rate limiting for ticket creation (5% chance)
      if (shouldFail(5)) {
        return HttpResponse.json(
          { error: "Too many tickets created recently. Please wait before creating another." },
          {
            status: 429,
            headers: { "Retry-After": "300" },
          },
        );
      }

      // Simulate server error (3% chance)
      if (shouldFail(3)) {
        return HttpResponse.json(
          { error: "Failed to create ticket. Please try again." },
          { status: 500 },
        );
      }

      // Process attachments
      const attachments = files.map((file, index) => ({
        id: `att_${Date.now()}_${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: `/api/attachments/att_${Date.now()}_${index}`,
      }));

      const newTicket = {
        id: "TKT-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        subject: subject.trim(),
        status: "open",
        priority: priority || "normal",
        category: category || "general",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        assignedAgent: null,
        messages: [
          {
            id: "msg_001",
            author: "Customer",
            authorType: "customer",
            message: message.trim(),
            timestamp: new Date().toISOString(),
            attachments,
          },
        ],
      };

      return HttpResponse.json({ ticket: newTicket }, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { error: "Invalid request format" },
        { status: 400 },
      );
    }
  }),

  // Reply to ticket
  http.post("/api/tickets/:ticketId/reply", async ({ params, request }) => {
    await delay(randomDelay(500, 1500));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    try {
      const formData = await request.formData();
      const message = formData.get("message") as string;
      const files = formData.getAll("attachments") as File[];

      // Validation
      if (!message || message.trim().length < 1) {
        return HttpResponse.json(
          { error: "Message cannot be empty" },
          { status: 400 },
        );
      }

      if (message.length > 5000) {
        return HttpResponse.json(
          { error: "Message too long. Maximum 5000 characters allowed." },
          { status: 400 },
        );
      }

      // Simulate ticket not found
      if (params.ticketId === "TKT-999") {
        return HttpResponse.json(
          { error: "Ticket not found" },
          { status: 404 },
        );
      }

      // Simulate rate limiting for replies (8% chance)
      if (shouldFail(8)) {
        return HttpResponse.json(
          { error: "Too many replies sent recently. Please wait before sending another." },
          {
            status: 429,
            headers: { "Retry-After": "60" },
          },
        );
      }

      // Simulate server error (3% chance)
      if (shouldFail(3)) {
        return HttpResponse.json(
          { error: "Failed to send reply. Please try again." },
          { status: 500 },
        );
      }

      // Process attachments
      const attachments = files.map((file, index) => ({
        id: `att_${Date.now()}_${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: `/api/attachments/att_${Date.now()}_${index}`,
      }));

      const newMessage = {
        id: `msg_${Date.now()}`,
        author: "Customer",
        authorType: "customer",
        message: message.trim(),
        timestamp: new Date().toISOString(),
        attachments,
      };

      return HttpResponse.json({ message: newMessage }, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { error: "Invalid request format" },
        { status: 400 },
      );
    }
  }),

  // Update ticket status
  http.patch("/api/tickets/:ticketId", async ({ params, request }) => {
    await delay(randomDelay(300, 800));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Simulate ticket not found
    if (params.ticketId === "TKT-999") {
      return HttpResponse.json(
        { error: "Ticket not found" },
        { status: 404 },
      );
    }

    // Simulate forbidden action (3% chance)
    if (shouldFail(3)) {
      return HttpResponse.json(
        { error: "You don't have permission to modify this ticket" },
        { status: 403 },
      );
    }

    return HttpResponse.json({
      ticket: {
        id: params.ticketId,
        status: body.status,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // Download attachment
  http.get("/api/attachments/:attachmentId", async ({ params, request }) => {
    await delay(randomDelay(200, 1000));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate attachment not found (5% chance)
    if (params.attachmentId === "att_999" || shouldFail(5)) {
      return HttpResponse.json(
        { error: "Attachment not found or has been deleted" },
        { status: 404 },
      );
    }

    // Simulate service error (2% chance)
    if (shouldFail(2)) {
      return HttpResponse.json(
        { error: "File storage service temporarily unavailable" },
        { status: 503 },
      );
    }

    // Redirect to mock file URL
    return new Response(null, {
      status: 302,
      headers: {
        Location: `https://mockfiles.example.com/${params.attachmentId}`,
      },
    });
  }),

  // =======================
  // DASHBOARD ENDPOINTS
  // =======================

  // Get dashboard services summary
  http.get("/api/services/summary", async ({ request }) => {
    await delay(randomDelay(200, 800));

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate rate limiting (429 Too Many Requests)
    if (shouldFail(8)) {
      return HttpResponse.json(
        {
          error:
            "Rate limit exceeded. Please wait before making more requests.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Date.now() + 60000),
          },
        },
      );
    }

    // Simulate timeout (3% chance)
    if (shouldFail(3)) {
      await delay(10000); // 10 second delay to trigger timeout
    }

    // Simulate server error (5% chance)
    if (shouldFail(5)) {
      return HttpResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 500 },
      );
    }

    return HttpResponse.json({
      summary: {
        domains: { total: 12, active: 11, expiring: 2 },
        subscriptions: { total: 8, active: 7, suspended: 1 },
        tickets: { total: 4, open: 2, pending: 1, closed: 1 },
        billing: {
          balance: 127.5,
          currency: "USD",
          nextPayment: "2024-12-15",
          overdue: 0,
        },
      },
      lastUpdated: new Date().toISOString(),
    });
  }),

  // Get upcoming renewals
  http.get("/api/renewals", async ({ request }) => {
    await delay(randomDelay(300, 1200));

    const url = new URL(request.url);
    const window = parseInt(url.searchParams.get("window") || "30");
    const sortBy = url.searchParams.get("sortBy") || "expiry";
    const filterType = url.searchParams.get("type");

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate intermittent failures (10% chance)
    if (shouldFail(10)) {
      return HttpResponse.json(
        { error: "Failed to fetch renewal data" },
        { status: 503 },
      );
    }

    // Simulate 404 for specific filters
    if (filterType === "nonexistent") {
      return HttpResponse.json(
        { error: "Service type not found" },
        { status: 404 },
      );
    }

    const mockRenewals = [
      {
        id: "ren_001",
        service: "example.com",
        type: "domain",
        displayType: "Domain Registration",
        expiryDate: "2024-12-15",
        price: 12.99,
        currency: "USD",
        autoRenew: true,
        urgent: true,
        daysUntilExpiry: 8,
        status: "active",
      },
      {
        id: "ren_002",
        service: "mysite.org",
        type: "hosting",
        displayType: "Web Hosting",
        expiryDate: "2024-12-22",
        price: 89.99,
        currency: "USD",
        autoRenew: false,
        urgent: false,
        daysUntilExpiry: 15,
        status: "active",
      },
      {
        id: "ren_003",
        service: "business.net",
        type: "ssl",
        displayType: "SSL Certificate",
        expiryDate: "2025-01-05",
        price: 49.99,
        currency: "USD",
        autoRenew: true,
        urgent: false,
        daysUntilExpiry: 29,
        status: "active",
      },
      {
        id: "ren_004",
        service: "shop.example.com",
        type: "hosting",
        displayType: "Premium Hosting",
        expiryDate: "2025-01-12",
        price: 199.99,
        currency: "USD",
        autoRenew: false,
        urgent: false,
        daysUntilExpiry: 36,
        status: "warning",
      },
    ];

    // Filter by window
    const filteredRenewals = mockRenewals.filter(
      (r) => r.daysUntilExpiry <= window,
    );

    // Filter by type if specified
    const typeFilteredRenewals = filterType
      ? filteredRenewals.filter((r) => r.type === filterType)
      : filteredRenewals;

    // Sort renewals
    const sortedRenewals = [...typeFilteredRenewals].sort((a, b) => {
      switch (sortBy) {
        case "expiry":
          return a.daysUntilExpiry - b.daysUntilExpiry;
        case "price":
          return b.price - a.price;
        case "service":
          return a.service.localeCompare(b.service);
        default:
          return a.daysUntilExpiry - b.daysUntilExpiry;
      }
    });

    return HttpResponse.json({
      renewals: sortedRenewals,
      totalAmount: sortedRenewals.reduce((sum, r) => sum + r.price, 0),
      currency: "USD",
      window,
      count: sortedRenewals.length,
    });
  }),

  // Get recent activity/tickets
  http.get("/api/dashboard/activity", async ({ request }) => {
    await delay(randomDelay(100, 600));

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Unauthorized access" },
        { status: 401 },
      );
    }

    // Simulate forbidden access (3% chance)
    if (shouldFail(3)) {
      return HttpResponse.json(
        { error: "Insufficient permissions to view activity" },
        { status: 403 },
      );
    }

    // Simulate network timeout (2% chance)
    if (shouldFail(2)) {
      await delay(15000); // 15 second delay
    }

    const mockActivities = [
      {
        id: "act_001",
        type: "domain_renewal",
        title: "Domain renewed successfully",
        description: "example.com has been renewed for 1 year",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "success",
        metadata: { domain: "example.com", duration: "1 year" },
      },
      {
        id: "act_002",
        type: "ssl_install",
        title: "SSL certificate installed",
        description: "SSL certificate activated for mysite.org",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "success",
        metadata: { domain: "mysite.org", type: "Let's Encrypt" },
      },
      {
        id: "act_003",
        type: "ticket_created",
        title: "Support ticket created",
        description: "#12345 - Email configuration help",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "info",
        metadata: { ticketId: "12345", category: "email" },
      },
      {
        id: "act_004",
        type: "dns_update",
        title: "DNS settings updated",
        description: "A record updated for business.net",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "info",
        metadata: { domain: "business.net", recordType: "A" },
      },
      {
        id: "act_005",
        type: "payment_received",
        title: "Payment processed",
        description: "Invoice #INV-2024-001 paid successfully",
        timestamp: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "success",
        metadata: { invoiceId: "INV-2024-001", amount: 89.99 },
      },
      {
        id: "act_006",
        type: "security_alert",
        title: "Security scan completed",
        description: "Weekly security scan found no issues",
        timestamp: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "success",
        metadata: { scanType: "weekly", issues: 0 },
      },
    ];

    const limitedActivities = mockActivities.slice(0, limit);

    return HttpResponse.json({
      activities: limitedActivities,
      hasMore: mockActivities.length > limit,
      total: mockActivities.length,
    });
  }),

  // =======================
  // USER ACCOUNT
  // =======================

  // Get user profile
  http.get("/api/user/profile", async ({ request }) => {
    await delay(randomDelay());

    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      user: {
        id: "1",
        email: "user@example.com",
        name: "John Doe",
        role: "customer",
      },
    });
  }),

  // Update user profile
  http.put("/api/user/profile", async ({ request }) => {
    await delay(randomDelay());

    const body = (await request.json()) as any;

    // Simulate email validation error
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return HttpResponse.json(
        {
          error: "Validation failed",
          details: {
            email: ["Invalid email format"],
          },
        },
        { status: 400 },
      );
    }

    // Simulate conflict for duplicate email
    if (body.email === "existing@example.com") {
      return HttpResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }

    return HttpResponse.json({
      user: {
        id: "1",
        email: body.email || "user@example.com",
        name: body.name || "John Doe",
        role: "customer",
      },
    });
  }),

  // =======================
  // NETWORK ERROR SIMULATIONS
  // =======================

  // Endpoint specifically for testing network failures
  http.get("/api/test/network-error", async () => {
    // Always fail with network error
    throw new Error("Network Error");
  }),

  // Endpoint for testing timeouts
  http.get("/api/test/timeout", async () => {
    await delay(30000); // 30 second delay to trigger timeout
    return HttpResponse.json({ message: "This should timeout" });
  }),

  // Endpoint for testing intermittent failures
  http.get("/api/test/flaky", async () => {
    await delay(randomDelay());

    if (shouldFail(50)) {
      // 50% failure rate
      return HttpResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 },
      );
    }

    return HttpResponse.json({ message: "Success!" });
  }),
];
