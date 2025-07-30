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
  // DOMAIN MANAGEMENT
  // =======================

  // Get domains with various failure scenarios
  http.get("/api/domains", async ({ request }) => {
    await delay(randomDelay());

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");

    // Simulate unauthorized access (401)
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Simulate rate limiting (429 Too Many Requests)
    if (shouldFail(5)) {
      return HttpResponse.json(
        { error: "Rate limit exceeded" },
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

    // Simulate network timeout (simulate slow response)
    if (shouldFail(3)) {
      await delay(10000); // 10 second delay to trigger timeout
    }

    // Simulate intermittent server error
    if (shouldFail(8)) {
      return HttpResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    // Successful response
    return HttpResponse.json({
      domains: mockDomains,
      pagination: {
        page,
        totalPages: 2,
        totalItems: mockDomains.length,
      },
    });
  }),

  // Get specific domain with 404 scenarios
  http.get("/api/domains/:id", async ({ params }) => {
    await delay(randomDelay());

    const domain = mockDomains.find((d) => d.id === params.id);

    // Simulate domain not found (404)
    if (!domain || params.id === "nonexistent") {
      return HttpResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    return HttpResponse.json({ domain });
  }),

  // Update domain with validation errors
  http.put("/api/domains/:id", async ({ request, params }) => {
    await delay(randomDelay());

    const body = (await request.json()) as any;

    // Simulate validation errors (400)
    if (body.name && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(body.name)) {
      return HttpResponse.json(
        {
          error: "Validation failed",
          details: {
            name: ["Invalid domain name format"],
          },
        },
        { status: 400 },
      );
    }

    // Simulate insufficient permissions (403)
    if (params.id === "restricted-domain") {
      return HttpResponse.json(
        { error: "Insufficient permissions to modify this domain" },
        { status: 403 },
      );
    }

    const domain = mockDomains.find((d) => d.id === params.id);
    if (!domain) {
      return HttpResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    return HttpResponse.json({ domain: { ...domain, ...body } });
  }),

  // =======================
  // BILLING ENDPOINTS
  // =======================

  // Get invoices with pagination and errors
  http.get("/api/billing/invoices", async ({ request }) => {
    await delay(randomDelay());

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");

    // Simulate intermittent failures
    if (shouldFail(7)) {
      return HttpResponse.json(
        { error: "Billing service temporarily unavailable" },
        { status: 503 },
      );
    }

    return HttpResponse.json({
      invoices: mockInvoices,
      pagination: { page, totalPages: 1, totalItems: mockInvoices.length },
    });
  }),

  // Payment processing with various scenarios
  http.post("/api/billing/payments", async ({ request }) => {
    await delay(randomDelay(500, 1500)); // Longer delay for payment processing

    const body = (await request.json()) as any;

    // Simulate payment validation errors (400)
    if (!body.amount || body.amount <= 0) {
      return HttpResponse.json(
        {
          error: "Validation failed",
          details: {
            amount: ["Amount must be greater than 0"],
          },
        },
        { status: 400 },
      );
    }

    if (!body.paymentMethod) {
      return HttpResponse.json(
        {
          error: "Validation failed",
          details: {
            paymentMethod: ["Payment method is required"],
          },
        },
        { status: 400 },
      );
    }

    // Simulate payment declined (402 Payment Required)
    if (body.paymentMethod === "declined-card") {
      return HttpResponse.json(
        { error: "Payment declined by bank" },
        { status: 402 },
      );
    }

    // Simulate payment gateway error (502 Bad Gateway)
    if (shouldFail(5)) {
      return HttpResponse.json(
        { error: "Payment gateway error" },
        { status: 502 },
      );
    }

    return HttpResponse.json({
      paymentId: "pay_" + Math.random().toString(36).substr(2, 9),
      status: "succeeded",
      amount: body.amount,
    });
  }),

  // =======================
  // SUPPORT TICKETS
  // =======================

  // Get support tickets
  http.get("/api/support/tickets", async () => {
    await delay(randomDelay());

    // Simulate occasional service unavailable
    if (shouldFail(5)) {
      return HttpResponse.json(
        { error: "Support system maintenance in progress" },
        { status: 503 },
      );
    }

    return HttpResponse.json({ tickets: mockTickets });
  }),

  // Create support ticket
  http.post("/api/support/tickets", async ({ request }) => {
    await delay(randomDelay());

    const body = (await request.json()) as any;

    // Simulate validation errors
    if (!body.subject || !body.message) {
      return HttpResponse.json(
        {
          error: "Validation failed",
          details: {
            subject: !body.subject ? ["Subject is required"] : [],
            message: !body.message ? ["Message is required"] : [],
          },
        },
        { status: 400 },
      );
    }

    // Simulate rate limiting for ticket creation
    if (shouldFail(10)) {
      return HttpResponse.json(
        {
          error:
            "Too many tickets created. Please wait before creating another.",
        },
        {
          status: 429,
          headers: { "Retry-After": "300" },
        },
      );
    }

    const newTicket = {
      id: "TKT-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      subject: body.subject,
      status: "open",
      priority: body.priority || "medium",
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json({ ticket: newTicket }, { status: 201 });
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
