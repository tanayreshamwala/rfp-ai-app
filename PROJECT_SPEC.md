You are an expert senior full-stack engineer and AI integration architect.

Your job is to help me **design and implement** an end-to-end **AI-powered RFP (Request for Proposal) management system** as a **single-user web application**, using the following stack:

- Frontend: **React.js** (JavaScript), with **Ant Design (AntD)** and **MUI (Material UI)** where appropriate
- Backend: **Node.js + Express.js**
- Database: **MongoDB** (use Mongoose )
- AI: Large Language Model (LLM) via an API (e.g., OpenAI), using HTTP calls from the backend
- Email: Real email integration for **send + receive** (SMTP or email API + inbound webhook)

I am a beginner in AI, so you must be very explicit and detailed about the AI parts: which prompts to use, how to design them, and how to integrate them into the backend.

I want you to:

- Act as the **principal engineer** on this project
- Design the architecture and data models
- Implement backend APIs, AI integration, email integration, and frontend UI
- Explain your reasoning and decisions as you go
- Propose a clear **step-by-step plan** and then execute it with code

Please read all of the following requirements carefully and then work with me iteratively.

────────────────────────────────
1. PROJECT CONTEXT & GOAL
────────────────────────────────

We are building a system to support a **procurement manager** who runs RFPs (Requests for Proposal).

Typical flow in real life:

- They define what they want to buy
- They email this RFP to multiple vendors
- Vendors reply with messy emails (free text, tables, attachments)
- The manager manually compares prices, terms, etc., and chooses a vendor

We want to build a **single-user web app** that:

1. Helps the user **create RFPs from natural language**, using AI to convert it into a structured representation that can be stored and reused
2. Lets the user **manage vendors and send RFPs to selected vendors via email**
3. **Receives vendor email responses** and uses AI to parse them into structured proposals
4. Provides a **comparison view** of vendor proposals for a given RFP, and uses AI to help answer:
   → “Which vendor should I go with, and why?”

This is for a coding assignment, so the focus is on:

- Clean architecture and modeling
- Reasonable, well-documented assumptions
- Thoughtful use of AI, not just random API calls
- A workflow that’s actually usable end-to-end

Important: This is a **single-user** app. We do NOT need:

- Multi-user authentication
- Multi-tenant / org-level features
- Real-time collaboration

──────────────────────────────── 
2. HIGH-LEVEL FUNCTIONAL REQUIREMENTS
────────────────────────────────

The application must support at least these main capabilities:

2.1. Create RFPs (AI-assisted)

- User can describe what they want to buy in **natural language** in the UI.
  Example: “I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty.”
- Backend calls an LLM to convert this into a **structured RFP** object containing:
  - Title
  - Overall description
  - Budget (amount + currency)
  - Delivery timeline/deadline
  - Payment terms
  - Warranty terms
  - Line items (e.g., laptop, monitor) each with quantity and specs
- The structured RFP is stored in MongoDB.
- The user can view and edit the structured RFP in the frontend (form-like view).

  2.2. Manage vendors and send RFPs

- Maintain **vendor master data**:
  - Vendor name
  - Contact email
  - Optional category or tags
  - Notes
- For a given RFP, the user can choose which vendors to send it to.
- On clicking “Send RFP”:

  - Backend uses an email provider or SMTP to send an email to each selected vendor with:
    - Subject containing RFP identifier
    - Body containing a human-readable summary of the RFP and any instructions
  - The system stores records of which vendors were emailed for which RFP.

  2.3. Receive and interpret vendor responses (AI parsing)

- Support **inbound email** for vendor replies.
- Use some mechanism like:
  - An inbound email webhook from an email provider (e.g., SendGrid/Mailgun/etc.) OR
  - A simplified mock endpoint where we POST example email payloads during demo
- Each vendor reply will include:
  - From: vendor email
  - Subject: includes some RFP identifier
  - Body: free-form text, maybe structured text, maybe simple pseudo-table
- Backend must:

  - Map the reply to the corresponding RFP and vendor (e.g., by subject format or special reply-to address)
  - Call an LLM with a prompt that:
    - Includes the original structured RFP
    - Includes the raw vendor email body
    - Asks the LLM to extract structured fields:
      - Item-wise prices
      - Total price
      - Currency
      - Delivery timeline (days or date)
      - Payment terms
      - Warranty details
      - Any other important notes
  - Store this parsed result as a **Proposal** object linked to that RFP and vendor.
  - Also keep the raw email body saved for reference.

  2.4. Compare proposals and recommend a vendor (AI-assisted)

- For a given RFP, show all proposals received from vendors in a **comparison view**.
- The comparison view should include:
  - Vendor name
  - Key numeric fields (total price, delivery days, etc.)
  - High-level terms (payment, warranty)
- Use an LLM to:
  - Analyze the structured RFP and all linked proposals
  - Provide:
    - A score for each vendor (e.g., 0–100)
    - Pros and cons per vendor
    - A recommended vendor
    - A short explanation: “Which vendor should I go with, and why?”
- Show this AI-generated evaluation clearly in the UI.

──────────────────────────────── 
3. TECH STACK & NON-FUNCTIONAL REQUIREMENTS
────────────────────────────────

3.1. Frontend

- Use **React.js** (JavaScript) with a modern, responsive design.
- Use **Ant Design (AntD)** and **MUI** as UI libraries:
  - It’s okay to mix them, but try to be consistent where possible.
  - Use components like:
    - Layout, Menu, Table, Form, Modal, Tabs from AntD or MUI
    - Buttons, Inputs, Selects, DatePickers, etc.
- Use **React Router** for navigating between:
  - Home / Dashboard
  - RFP list & RFP detail
  - Vendor management
  - Proposal comparison view
- Make the UI:
  - Responsive (works on desktop and reasonably on tablet/mobile)
  - Clean and easy to follow (no need for flashy design, but should look modern)
- Consider a simple layout:

  - Sidebar navigation (RFPs, Vendors, Settings)
  - Main content area for pages

  3.2. Backend

- Use **Node.js + Express.js**.
- Organize code with clear separation:
  - `routes/` or `controllers/` for request handling
  - `services/` for business logic (AI service, email service, proposal service, etc.)
  - `models/` for Mongoose schemas
  - `config/` for environment variables and configuration
- Implement robust error handling and return meaningful HTTP status codes.
- Use async/await and proper try/catch with centralized error middleware.

  3.3. Database

- Use **MongoDB**, with **Mongoose** for schemas and models.
- Define at minimum these collections:
  - `Rfp`
  - `Vendor`
  - `Proposal`
  - Optionally `EmailMessage` to log inbound/outbound emails
- Ensure references between collections (e.g., `rfpId`, `vendorId`) are clear.

  3.4. Email Integration

- Implement real email **sending** via:
  - SMTP (e.g., Nodemailer with Gmail/another SMTP server) OR
  - An email sending API (SendGrid, Mailgun, etc.)
- Implement email **receiving** via either:
  - An inbound webhook endpoint that an email provider calls
  - Or a simplified simulation where we can POST sample vendor-reply payloads to a backend endpoint, as long as the logic is clear
- Make sure:

  - Outgoing emails embed some RFP and vendor information in the subject or reply-to address so replies can be mapped.
  - There is a backend route like `POST /email/inbound` that:
    - Accepts incoming email payload
    - Parses out from, subject, and body
    - Maps to RFP & vendor
    - Calls the AI parser
    - Saves the resulting Proposal

  3.5. AI Integration

- All AI calls should be **from the backend**.
- Use an **LLM API** (you can assume OpenAI or a similar provider).
- Provide:

  1. **RFP creation AI**:
     - Input: user’s free-text description
     - Output: strict JSON representation of an RFP structure.
  2. **Vendor response parsing AI**:
     - Input: original structured RFP + raw vendor email
     - Output: strict JSON Proposal structure with:
       - Item-level data
       - Aggregated fields like total price, delivery days, etc.
  3. **Comparison & recommendation AI**:
     - Input: structured RFP + list of proposals
     - Output: JSON with:
       - Vendor scores
       - Pros/cons
       - Recommended vendor
       - Overall explanation

- You must:

  - Design prompts that explicitly instruct the LLM to respond with **valid JSON only**.
  - Show in code how to:
    - Call the API
    - Parse the JSON result safely
    - Handle errors if the model returns invalid JSON (fallback, re-try, or graceful failure).

  3.6. Non-Goals (things we do NOT build)

- No user authentication.
- No multi-tenant logic.
- No email open/click tracking.
- No very advanced RFP lifecycles (approvals, revisions, etc.).
- Focus on a **solid single-user end-to-end workflow**.

──────────────────────────────── 
4. DATA MODELING REQUIREMENTS (MONGODB/MONGOOSE)
────────────────────────────────

Design Mongoose schemas for at least:

4.1. Rfp
Suggested fields (you can refine as needed):

- `_id`
- `title` (string)
- `description` (string, detailed)
- `budgetAmount` (number, optional)
- `budgetCurrency` (string, optional, e.g., "USD")
- `deliveryDeadline` (Date or number of days, choose a consistent strategy)
- `paymentTerms` (string)
- `warrantyTerms` (string)
- `items`: array of:
  - `name` (string)
  - `quantity` (number)
  - `specs` (string)
- `status` (string: "draft" | "sent" | "closed" | etc.)
- `createdAt`, `updatedAt`

  4.2. Vendor

- `_id`
- `name`
- `email`
- `category` or `tags` (optional)
- `notes` (optional)
- `createdAt`, `updatedAt`

  4.3. Proposal

- `_id`
- `rfpId` (ObjectId → Rfp)
- `vendorId` (ObjectId → Vendor)
- `rawEmailBody` (string, maybe large)
- `parsed` (a nested JSON object for structured data), which might contain:
  - `items`: array with item-level pricing, etc.
  - `totalPrice`
  - `currency`
  - `deliveryDays`
  - `paymentTerms`
  - `warranty`
  - `notes`
- `aiScore` (number, optional)
- `aiSummary` (string, optional)
- `aiPros` (array of strings, optional)
- `aiCons` (array of strings, optional)
- `createdAt`, `updatedAt`

  4.4. EmailMessage (optional but nice)

- `_id`
- `direction` ("sent" | "received")
- `rfpId` (optional)
- `vendorId` (optional)
- `proposalId` (optional, for received messages)
- `subject`
- `body`
- `rawPayload` (optional for debugging)
- `createdAt`

Please refine these schemas if needed, but keep them coherent and practical.

──────────────────────────────── 
5. BACKEND API DESIGN
────────────────────────────────

Design a clean REST API, for example:

5.1. RFP endpoints

- `POST /api/rfps/from-text`
  - Body: `{ text: string }`
  - Behavior: calls AI to generate structured RFP JSON, saves it, returns saved RFP.
- `GET /api/rfps`
  - List all RFPs.
- `GET /api/rfps/:id`
  - Get RFP by ID, including maybe proposals summary.
- `PUT /api/rfps/:id`
  - Update RFP fields (e.g., user edits after AI generation).
- `DELETE /api/rfps/:id` (optional)

  5.2. Vendor endpoints

- `POST /api/vendors`
- `GET /api/vendors`
- `GET /api/vendors/:id`
- `PUT /api/vendors/:id`
- `DELETE /api/vendors/:id` (optional)

  5.3. Sending RFP to vendors

- `POST /api/rfps/:id/send`

  - Body: list of `vendorIds` and maybe custom message.
  - Behavior:
    - For each vendor, send an email with RFP details.
    - Log `EmailMessage` records for outgoing emails.
    - Update RFP status to "sent".

  5.4. Email inbound webhook

- `POST /api/email/inbound`

  - This is called by the email provider when a vendor replies.
  - Body: must contain `from`, `to`, `subject`, `text` (or `html` → converted to text).
  - Behavior:
    - Identify RFP and vendor (e.g., parse subject or address).
    - Create `EmailMessage` record with direction "received".
    - Call AI parsing function to extract proposal details.
    - Create or update a `Proposal` record connected to RFP and vendor.

  5.5. Proposal & comparison endpoints

- `GET /api/rfps/:id/proposals`
  - Get all proposals for a specific RFP.
- `POST /api/rfps/:id/compare`
  - No body, or maybe options.
  - Behavior:
    - Fetch RFP and all proposals.
    - Call AI to produce comparison JSON with scores, pros/cons, recommended vendor.
    - Save the AI results to proposals and/or return them to frontend.

Ensure all endpoints:

- Use consistent JSON formats.
- Handle errors clearly (4xx vs 5xx).

──────────────────────────────── 
6. FRONTEND PAGES & UX
────────────────────────────────

Implement at least these main screens:

6.1. RFP Creation Page

- Two main modes:

  1. **Natural language input**:
     - Textarea where user describes the procurement requirements.
     - Button: “Generate RFP”.
     - On click: call `POST /api/rfps/from-text`, show a loading indicator.
  2. **Structured RFP form**:
     - After AI returns a structured RFP, display it in a form:
       - Title
       - Description
       - Budget (amount + currency)
       - Delivery deadline
       - Payment terms
       - Warranty
       - Items (editable list: name, quantity, specs)
     - Allow user to tweak and then save changes (PUT /api/rfps/:id).

  6.2. RFP List & Detail Page

- RFP list:
  - Table with columns: title, createdAt, status, number of proposals.
  - Clicking a row opens RFP detail.
- RFP detail:

  - Show all RFP fields.
  - Section for:
    - **Send to vendors**:
      - Multi-select vendor dropdown (using AntD/MUI)
      - Button: “Send RFP via Email”
    - **Proposals**:
      - Table listing each vendor that has submitted a proposal, their key fields (price, delivery, etc.)
      - Button: “Compare with AI”

  6.3. Vendor Management Page

- Table of vendors:
  - Name, email, category/tags
- Form to add new vendor.
- Edit vendor info.
- Optional search/filter.

  6.4. Proposal Comparison Page

- For a selected RFP:
  - Table with each vendor’s proposal side-by-side:
    - Vendor name
    - Total price
    - Currency
    - Delivery days
    - Payment terms
    - Warranty
  - Section with AI output:
    - Per-vendor score and short summary (pros/cons)
    - Highlighted “Recommended vendor”
    - AI-generated explanation (text block)

Use AntD/MUI components (Tables, Cards, Accordions, Tabs) to make it clean and readable.

──────────────────────────────── 
7. PROJECT STRUCTURE & TOOLING
────────────────────────────────

Use a structure like:

- `/backend`
  - `src/`
    - `app.js` or `server.js`
    - `routes/`
    - `controllers/`
    - `models/`
    - `services/`
      - `aiService.js`
      - `emailService.js`
      - `rfpService.js`
      - `proposalService.js`
    - `config/`
      - `db.js`
      - `env.js`
    - `middlewares/`
- `/frontend`
  - `src/`
    - `index.js`
    - `App.js`
    - `routes/`
    - `pages/`
      - `RfpListPage.js`
      - `RfpDetailPage.js`
      - `RfpCreatePage.js`
      - `VendorPage.js`
      - `ComparisonPage.js`
    - `components/`
      - Smaller reusable components
    - `services/`
      - API client utilities

Also add:

- `README.md` at root
- `.env.example` in backend with:
  - `MONGODB_URI`
  - `OPENAI_API_KEY` (or other AI provider)
  - `EMAIL_SMTP_HOST`, `EMAIL_SMTP_PORT`, `EMAIL_SMTP_USER`, `EMAIL_SMTP_PASS`
  - Any webhook secrets if needed
- Backend scripts:
  - `"dev"` for local development
- Frontend scripts:
  - `"start"` for local dev

──────────────────────────────── 
8. DEVELOPMENT WORKFLOW – HOW I WANT YOU TO HELP
────────────────────────────────

I want you to work with me step-by-step:

1. **First**, propose/refine:

   - The folder structure (frontend + backend)
   - The data models (Mongoose schemas)
   - The main API endpoints
   - The AI integration design (functions, prompts, error handling)

2. Once the plan is agreed:

   - Implement the **backend** first:
     - MongoDB connection
     - Rfp, Vendor, Proposal models
     - Core endpoints
     - AI service module with clear prompt templates and call examples
     - Email service with placeholders or working integration

3. Then implement the **frontend**:

   - Basic layout and routing
   - RFP pages
   - Vendor management
   - Proposal comparison UI
   - Call the backend APIs.

4. For **AI integration**:

   - Write actual code for calling an LLM API (e.g., using axios from Node).
   - Show example prompts for:
     - RFP generation
     - Vendor response parsing
     - Proposal comparison and recommendation
   - Ensure responses are parsed as JSON and handle potential invalid JSON gracefully.

5. For **email integration**:

   - Implement the sending part with a real or at least realistic transport (e.g., Nodemailer).
   - Implement the inbound webhook route and sample payloads to test the end-to-end flow even if we don’t connect a real email provider yet.

6. Throughout:

   - Explain your decisions when designing prompts, schemas, and APIs.
   - Keep code clean, modular, and well-commented.
   - Avoid overcomplicating things, but do enough to demonstrate a realistic solution.

7. At the end:
   - Help me finalize a good `README.md` that explains:
     - Setup steps (backend + frontend)
     - Environment variables
     - How to run locally
     - How to simulate sending and receiving emails
     - How the AI integration works conceptually
   - Optionally outline what I should show in a 5–10 min demo video:
     - Creating an RFP from natural language
     - Managing vendors and sending RFP
     - Receiving a sample response and seeing it parsed
     - Viewing the comparison + AI recommendation
     - Quick code walkthrough

──────────────────────────────── 
9. IMPORTANT STYLE & QUALITY NOTES
────────────────────────────────

- Use **clear, consistent naming** (no abbreviations unless obvious).
- Add comments where non-trivial logic is implemented, especially for AI prompt construction and response parsing.
- Design prompts in a reusable way (e.g., separate function for building each prompt).
- Assume this is an assignment where reviewers care about:
  - Problem understanding & modeling
  - Architecture & separation of concerns
  - API & data design
  - AI integration quality
  - UX and usability
  - Documented assumptions

──────────────────────────────── 10. WHAT TO DO NOW
────────────────────────────────

Given all the above:

1. Confirm or refine the high-level architecture, data models, and API design.
2. Then start implementing:
   - First: backend project skeleton and core models.
   - Next: endpoints for RFP, Vendor, Proposal, email webhook.
   - Next: AI service with clear prompt strings and API call structure.
   - Then: frontend structure and key pages.
3. At each step, show me the files you are creating or modifying and explain briefly what you’re doing and why, so I can follow along and learn.

Please begin by summarizing your understanding of the project and proposing the initial backend + frontend folder structure and data models.
