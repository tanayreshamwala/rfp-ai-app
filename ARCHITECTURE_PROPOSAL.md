# Architecture Proposal: AI-Powered RFP Management System

## Project Understanding Summary

This is a **single-user web application** that helps a procurement manager:

1. **Create RFPs from natural language** - User describes requirements in plain text, AI converts to structured RFP
2. **Manage vendors** - Store vendor contact info, categories, notes
3. **Send RFPs via email** - Select vendors and send structured RFP details via email
4. **Parse vendor responses** - Receive vendor email replies, use AI to extract structured proposal data
5. **Compare proposals** - View side-by-side comparison with AI-powered scoring and recommendations

The system uses **React.js** (AntD + MUI), **Node.js/Express**, **MongoDB/Mongoose**, **LLM API** (OpenAI), and **email integration** (SMTP/API).

---

## 1. Backend Folder Structure

```
backend/
├── src/
│   ├── server.js                 # Main entry point, Express app setup
│   ├── app.js                    # Express app configuration
│   │
│   ├── config/
│   │   ├── database.js           # MongoDB connection setup
│   │   ├── environment.js        # Environment variable validation
│   │   └── constants.js          # App-wide constants
│   │
│   ├── models/
│   │   ├── Rfp.js                # RFP Mongoose schema
│   │   ├── Vendor.js             # Vendor Mongoose schema
│   │   ├── Proposal.js           # Proposal Mongoose schema
│   │   └── EmailMessage.js       # Email log Mongoose schema
│   │
│   ├── routes/
│   │   ├── index.js              # Main router, combines all routes
│   │   ├── rfpRoutes.js          # RFP endpoints
│   │   ├── vendorRoutes.js       # Vendor CRUD endpoints
│   │   ├── proposalRoutes.js     # Proposal endpoints
│   │   └── emailRoutes.js        # Email webhook endpoint
│   │
│   ├── controllers/
│   │   ├── rfpController.js      # RFP request handlers
│   │   ├── vendorController.js   # Vendor request handlers
│   │   ├── proposalController.js # Proposal request handlers
│   │   └── emailController.js    # Email webhook handler
│   │
│   ├── services/
│   │   ├── aiService.js          # LLM API integration
│   │   │                          # - generateRfpFromText()
│   │   │                          # - parseVendorResponse()
│   │   │                          # - compareProposals()
│   │   ├── emailService.js       # Email sending/receiving
│   │   │                          # - sendRfpToVendors()
│   │   │                          # - parseInboundEmail()
│   │   ├── rfpService.js         # RFP business logic
│   │   │                          # - createRfpFromAI()
│   │   │                          # - updateRfpStatus()
│   │   └── proposalService.js    # Proposal business logic
│   │                              # - createProposalFromEmail()
│   │                              # - getProposalsForRfp()
│   │
│   ├── middlewares/
│   │   ├── errorHandler.js       # Centralized error handling
│   │   ├── requestLogger.js      # Request logging (optional)
│   │   └── validation.js         # Request validation helpers
│   │
│   ├── utils/
│   │   ├── promptTemplates.js    # AI prompt templates
│   │   ├── jsonParser.js         # Safe JSON parsing for AI responses
│   │   ├── emailParser.js        # Email parsing utilities
│   │   └── helpers.js            # General utility functions
│   │
│   └── tests/                    # (Optional) Test files
│       └── ...
│
├── .env.example                  # Environment variables template
├── .env                          # (gitignored) Actual environment variables
├── .gitignore
├── package.json
└── README.md
```

### Key Design Decisions:

- **Separation of concerns**: Routes → Controllers → Services → Models
- **Service layer**: Business logic separated from HTTP handling
- **AI service**: Centralized LLM calls with reusable prompt templates
- **Email service**: Handles both sending and receiving logic
- **Utils**: Reusable functions for prompts, JSON parsing, email parsing

---

## 2. Frontend Folder Structure

```
frontend/
├── public/
│   ├── index.html
│   └── ...
│
├── src/
│   ├── index.js                  # React entry point
│   ├── App.js                    # Main app component with routing
│   │
│   ├── routes/
│   │   └── AppRoutes.js         # React Router configuration
│   │
│   ├── pages/
│   │   ├── DashboardPage.js     # Home/Dashboard (optional)
│   │   ├── RfpListPage.js        # List all RFPs
│   │   ├── RfpCreatePage.js      # Create RFP (natural language + form)
│   │   ├── RfpDetailPage.js      # View/edit RFP, send to vendors
│   │   ├── VendorListPage.js     # Manage vendors (list + CRUD)
│   │   └── ProposalComparisonPage.js  # Compare proposals for an RFP
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.js      # Main layout with sidebar
│   │   │   ├── Sidebar.js        # Navigation sidebar
│   │   │   └── Header.js         # Top header (optional)
│   │   │
│   │   ├── rfp/
│   │   │   ├── RfpForm.js        # Structured RFP form (editable)
│   │   │   ├── RfpItemsList.js   # Line items list component
│   │   │   ├── NaturalLanguageInput.js  # Textarea for AI input
│   │   │   └── VendorSelector.js # Multi-select for sending RFP
│   │   │
│   │   ├── vendor/
│   │   │   ├── VendorTable.js    # Vendors table
│   │   │   ├── VendorForm.js     # Add/edit vendor form
│   │   │   └── VendorCard.js     # (Optional) Vendor card view
│   │   │
│   │   ├── proposal/
│   │   │   ├── ProposalTable.js  # Proposals table
│   │   │   ├── ProposalCard.js   # Individual proposal card
│   │   │   ├── ComparisonTable.js # Side-by-side comparison
│   │   │   └── AIRecommendation.js # AI analysis display
│   │   │
│   │   └── common/
│   │       ├── LoadingSpinner.js
│   │       ├── ErrorMessage.js
│   │       └── ConfirmModal.js
│   │
│   ├── services/
│   │   ├── api.js                # Axios instance with base URL
│   │   ├── rfpApi.js             # RFP API calls
│   │   ├── vendorApi.js          # Vendor API calls
│   │   └── proposalApi.js        # Proposal API calls
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useRfps.js            # Fetch/manage RFPs
│   │   ├── useVendors.js         # Fetch/manage vendors
│   │   └── useProposals.js       # Fetch/manage proposals
│   │
│   ├── context/                  # React Context (if needed)
│   │   └── AppContext.js         # Global state (optional)
│   │
│   ├── utils/
│   │   ├── formatters.js         # Date, currency formatting
│   │   ├── validators.js         # Form validation helpers
│   │   └── constants.js          # Frontend constants
│   │
│   └── styles/                   # (Optional) Global styles
│       └── index.css
│
├── package.json
└── README.md
```

### Key Design Decisions:

- **Page-based routing**: Each major feature has its own page
- **Reusable components**: Organized by feature (rfp, vendor, proposal)
- **API service layer**: Centralized API calls with axios
- **Custom hooks**: Reusable data fetching logic
- **Layout components**: Consistent sidebar navigation
- **Mixed UI libraries**: Use AntD for tables/forms, MUI for cards/modals where appropriate

---

## 3. MongoDB/Mongoose Schemas

### 3.1. RFP Schema

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  budgetAmount: Number (optional),
  budgetCurrency: String (default: "USD"),
  deliveryDeadline: Date (optional), // or could be number of days
  paymentTerms: String (optional),
  warrantyTerms: String (optional),
  items: [{
    name: String (required),
    quantity: Number (required, min: 1),
    specs: String (optional),
    _id: false // Mongoose subdocument
  }],
  status: String (enum: ["draft", "sent", "closed", "cancelled"], default: "draft"),
  sentToVendors: [{
    vendorId: ObjectId (ref: "Vendor"),
    sentAt: Date,
    emailMessageId: ObjectId (ref: "EmailMessage", optional)
  }],
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**

- `status` (for filtering)
- `createdAt` (for sorting)

---

### 3.2. Vendor Schema

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  email: String (required, unique, lowercase),
  category: String (optional), // e.g., "IT", "Office Supplies"
  tags: [String] (optional), // Flexible tagging
  notes: String (optional),
  isActive: Boolean (default: true),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**

- `email` (unique, for lookups)
- `name` (for search)
- `category` (for filtering)

---

### 3.3. Proposal Schema

```javascript
{
  _id: ObjectId,
  rfpId: ObjectId (required, ref: "Rfp", index: true),
  vendorId: ObjectId (required, ref: "Vendor", index: true),

  // Raw email data
  rawEmailBody: String (required),
  emailMessageId: ObjectId (ref: "EmailMessage", optional),

  // Parsed structured data (from AI)
  parsed: {
    items: [{
      name: String,
      quantity: Number,
      unitPrice: Number,
      totalPrice: Number,
      specs: String (optional)
    }],
    totalPrice: Number (required),
    currency: String (default: "USD"),
    deliveryDays: Number (optional), // or deliveryDate: Date
    paymentTerms: String (optional),
    warranty: String (optional),
    notes: String (optional),
    otherTerms: Object (optional) // Flexible for additional fields
  },

  // AI comparison results (populated when comparison is run)
  aiScore: Number (optional, min: 0, max: 100),
  aiSummary: String (optional),
  aiPros: [String] (optional),
  aiCons: [String] (optional),
  aiRecommendation: Boolean (default: false), // true if this is the recommended vendor

  // Status
  status: String (enum: ["pending", "reviewed", "accepted", "rejected"], default: "pending"),

  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**

- `rfpId` + `vendorId` (compound, unique - one proposal per vendor per RFP)
- `rfpId` (for fetching all proposals for an RFP)
- `aiScore` (for sorting)

---

### 3.4. EmailMessage Schema

```javascript
{
  _id: ObjectId,
  direction: String (required, enum: ["sent", "received"]),

  // References
  rfpId: ObjectId (ref: "Rfp", optional, index: true),
  vendorId: ObjectId (ref: "Vendor", optional, index: true),
  proposalId: ObjectId (ref: "Proposal", optional), // For received emails that created proposals

  // Email content
  from: String (required),
  to: String (required),
  subject: String (required),
  body: String (required), // Plain text or HTML converted to text
  htmlBody: String (optional), // Original HTML if available

  // Metadata
  messageId: String (optional), // Email provider's message ID
  replyTo: String (optional),
  rawPayload: Object (optional), // Full webhook payload for debugging

  // Status
  processed: Boolean (default: false), // For received emails, whether AI parsing completed
  error: String (optional), // Error message if processing failed

  createdAt: Date (default: Date.now)
}
```

**Indexes:**

- `rfpId` + `direction` (for filtering emails by RFP)
- `vendorId` + `direction` (for filtering by vendor)
- `createdAt` (for sorting)

---

## 4. Additional Design Considerations

### 4.1. AI Service Design

- **Three main functions:**

  1. `generateRfpFromText(userText)` → Returns structured RFP JSON
  2. `parseVendorResponse(rfp, emailBody)` → Returns structured Proposal JSON
  3. `compareProposals(rfp, proposals)` → Returns comparison JSON with scores/recommendations

- **Prompt templates** stored in `utils/promptTemplates.js` for maintainability
- **JSON parsing** with retry logic and fallback handling
- **Error handling** for API failures, invalid JSON, rate limits

### 4.2. Email Integration

- **Sending:** Use Nodemailer with SMTP or SendGrid/Mailgun API
- **Receiving:** Webhook endpoint `/api/email/inbound` that:

  - Accepts email provider webhook payload
  - Maps to RFP/vendor (via subject line pattern or reply-to address)
  - Triggers AI parsing
  - Creates Proposal record

- **Email subject format:** `RFP-[RFP_ID]-[Vendor_Name]` for easy mapping

### 4.3. API Endpoints Summary

```
RFP:
  POST   /api/rfps/from-text          # Create RFP from natural language
  GET    /api/rfps                     # List all RFPs
  GET    /api/rfps/:id                 # Get RFP by ID
  PUT    /api/rfps/:id                 # Update RFP
  DELETE /api/rfps/:id                 # Delete RFP
  POST   /api/rfps/:id/send            # Send RFP to vendors

Vendor:
  POST   /api/vendors                  # Create vendor
  GET    /api/vendors                  # List all vendors
  GET    /api/vendors/:id              # Get vendor by ID
  PUT    /api/vendors/:id              # Update vendor
  DELETE /api/vendors/:id              # Delete vendor

Proposal:
  GET    /api/rfps/:id/proposals       # Get proposals for an RFP
  GET    /api/proposals/:id            # Get proposal by ID
  POST   /api/rfps/:id/compare         # Run AI comparison

Email:
  POST   /api/email/inbound            # Webhook for incoming emails
```

---

## 5. Next Steps

Once this architecture is approved, we'll implement:

1. Backend project setup (package.json, dependencies, config)
2. MongoDB models (Mongoose schemas)
3. Backend services (AI, email, business logic)
4. Backend routes and controllers
5. Frontend project setup
6. Frontend pages and components
7. Integration and testing

---

**Ready to proceed?** Let me know if you'd like any adjustments to the structure or schemas before we start implementation.
