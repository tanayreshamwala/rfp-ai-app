# AI-Powered RFP Management System

A single-user web application for managing Requests for Proposals (RFPs) with AI-assisted creation, vendor management, email integration, and intelligent proposal comparison.

## 🎯 Overview

This application helps procurement managers streamline their RFP workflow by:

1. **Creating RFPs from natural language** - Describe requirements in plain text, and AI converts it into a structured RFP
2. **Managing vendors** - Maintain a vendor database with contact information
3. **Sending RFPs via email** - Send RFPs to selected vendors with a single click
4. **Receiving and parsing vendor responses** - AI automatically extracts structured proposal data from vendor email replies
5. **Comparing proposals with AI recommendations** - Get AI-powered scores, pros/cons, and vendor recommendations

## 🛠️ Tech Stack

### Frontend

- **React.js** (JavaScript) - UI framework
- **Ant Design (AntD)** - Primary UI component library
- **Material-UI (MUI)** - Additional UI components
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Axios** - HTTP client for API calls
- **Day.js** - Date manipulation

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Nodemailer** - Email sending
- **OpenAI API** - AI/LLM integration (GPT-4o-mini)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher) - Running locally or MongoDB Atlas connection string
- **npm** or **yarn** package manager
- **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rfp-ai-app
```

### 2. Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory:

   ```bash
   # Application config
   PORT=5000
   NODE_ENV=development

   # MongoDB connection
   MONGODB_URI=mongodb://localhost:27017/rfp-ai-app
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rfp-ai-app

   # AI config
   OPENAI_API_KEY=your-openai-api-key-here

   # Email settings (for sending RFPs)
   EMAIL_SMTP_HOST=smtp.gmail.com
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_SECURE=false
   EMAIL_SMTP_USER=your-email@gmail.com
   EMAIL_SMTP_PASS=your-app-specific-password
   ```

   **Note for Gmail:**

   - Enable 2-factor authentication
   - Generate an "App Password" from your Google Account settings
   - Use the app password in `EMAIL_SMTP_PASS`

4. Start MongoDB (if running locally):

   ```bash
   # On macOS/Linux
   mongod

   # On Windows (if installed as service, it may already be running)
   # Or start MongoDB service from Services
   ```

5. Start the backend server:

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

4. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
rfp-ai-app/
├── backend/
│   ├── server.js                 # Express app entry point
│   ├── package.json
│   ├── .env                      # Environment variables (create this)
│   └── src/
│       ├── config/
│       │   └── database.js       # MongoDB connection
│       ├── models/
│       │   ├── Rfp.js            # RFP Mongoose schema
│       │   ├── Vendor.js         # Vendor Mongoose schema
│       │   ├── Proposal.js       # Proposal Mongoose schema
│       │   └── EmailMessage.js   # Email logging schema
│       ├── routes/
│       │   ├── index.js          # Route aggregator
│       │   ├── rfpRoutes.js      # RFP endpoints
│       │   ├── vendorRoutes.js   # Vendor endpoints
│       │   ├── proposalRoutes.js # Proposal endpoints
│       │   └── emailRoutes.js    # Email webhook endpoint
│       ├── controllers/
│       │   ├── rfpController.js
│       │   ├── vendorController.js
│       │   ├── proposalController.js
│       │   └── emailController.js
│       ├── services/
│       │   ├── aiService.js      # OpenAI API integration
│       │   ├── emailService.js   # Email sending/receiving
│       │   ├── rfpService.js     # RFP business logic
│       │   └── proposalService.js # Proposal business logic
│       └── utils/
│           ├── promptTemplates.js # AI prompt templates
│           └── jsonParser.js     # Safe JSON parsing utilities
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js            # Vite configuration with API proxy
│   └── src/
│       ├── index.jsx             # React entry point
│       ├── App.jsx                # Main app component
│       ├── routes/
│       │   └── AppRoutes.jsx     # React Router routes
│       ├── pages/
│       │   ├── RfpListPage.jsx
│       │   ├── RfpCreatePage.jsx
│       │   ├── RfpDetailPage.jsx
│       │   ├── VendorListPage.jsx
│       │   └── ProposalComparisonPage.jsx
│       ├── components/
│       │   ├── layout/
│       │   │   └── AppLayout.jsx # Main layout with sidebar
│       │   └── rfp/
│       │       └── RfpForm.jsx   # Reusable RFP form
│       ├── services/
│       │   ├── api.js            # Axios instance with interceptors
│       │   ├── rfpApi.js        # RFP API calls
│       │   ├── vendorApi.js     # Vendor API calls
│       │   └── proposalApi.js   # Proposal API calls
│       └── styles/
│           └── index.css        # Global styles
│
└── README.md
```

## 🔑 Environment Variables

### Backend `.env` File

| Variable            | Description                | Example                                |
| ------------------- | -------------------------- | -------------------------------------- |
| `PORT`              | Backend server port        | `5000`                                 |
| `NODE_ENV`          | Environment mode           | `development`                          |
| `MONGODB_URI`       | MongoDB connection string  | `mongodb://localhost:27017/rfp-ai-app` |
| `OPENAI_API_KEY`    | OpenAI API key             | `sk-proj-...`                          |
| `EMAIL_SMTP_HOST`   | SMTP server hostname       | `smtp.gmail.com`                       |
| `EMAIL_SMTP_PORT`   | SMTP server port           | `587`                                  |
| `EMAIL_SMTP_SECURE` | Use TLS/SSL                | `false`                                |
| `EMAIL_SMTP_USER`   | SMTP username (email)      | `your-email@gmail.com`                 |
| `EMAIL_SMTP_PASS`   | SMTP password/app password | `your-app-password`                    |

## 🎮 How to Run Locally

### Start Backend

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000` with hot-reload via nodemon.

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (or another available port).

### Access the Application

Open your browser and navigate to `http://localhost:5173`

## 📧 Email Integration

### Sending Emails

The application uses **Nodemailer** to send RFPs to vendors via SMTP. When you click "Send to Vendors" in the RFP detail page:

1. The backend sends an email to each selected vendor
2. The email subject includes the RFP ID: `RFP: [Title] [ID: <rfpId>]`
3. The email body contains a human-readable summary of the RFP
4. The `replyTo` address is set to your configured email

### Receiving Emails (Webhook)

Vendor replies are received via a webhook endpoint: `POST /api/email/inbound`

**For Production:**

- Configure your email provider (SendGrid, Mailgun, etc.) to forward inbound emails to this webhook
- The webhook expects a JSON payload with: `from`, `to`, `subject`, `text` (or `html`)

**For Testing:**
You can manually test the webhook using curl or PowerShell:

```powershell
# PowerShell example
$rfpId = "your-rfp-id-here"
$body = @{
    from = "vendor@example.com"
    to = "your-email@gmail.com"
    subject = "Re: RFP: Laptop Procurement [ID: $rfpId]"
    text = "We can provide 20 laptops for $28,500. Delivery in 40 days. Payment: Net 30. Warranty: 2 years."
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/email/inbound" -Method POST -Body $body -ContentType "application/json"
```

**Important:** The email subject must contain the RFP ID in the format `[ID: <rfpId>]` for the system to match the reply to the correct RFP.

See `TEST_WEBHOOK.md` and `EMAIL_WEBHOOK_FLOW_EXPLANATION.md` for detailed information.

## 🤖 AI Integration

The application uses **OpenAI's GPT-4o-mini** model for three main AI operations:

### 1. RFP Generation (`POST /api/rfps/from-text`)

**Input:** Natural language description of procurement needs

**Process:**

- User enters free-text description
- Backend calls OpenAI with a structured prompt
- AI returns a JSON object with structured RFP fields
- RFP is saved to MongoDB

**Example Input:**

```
I need to procure laptops and monitors for our new office. Budget is $50,000 total.
Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch.
Payment terms should be net 30, and we need at least 1 year warranty.
```

**Output:** Structured RFP with title, description, budget, items, terms, etc.

### 2. Vendor Response Parsing (`POST /api/email/inbound`)

**Input:**

- Original structured RFP
- Raw vendor email body

**Process:**

- When a vendor replies via email, the webhook receives it
- Backend calls OpenAI with the RFP context and vendor email
- AI extracts structured proposal data (prices, delivery, terms, etc.)
- Proposal is saved and linked to the RFP and vendor

**Output:** Structured Proposal object with:

- Item-level pricing
- Total price and currency
- Delivery timeline
- Payment terms
- Warranty details
- Notes

### 3. Proposal Comparison (`POST /api/rfps/:id/compare`)

**Input:**

- Structured RFP
- All proposals for that RFP

**Process:**

- Backend calls OpenAI with RFP requirements and all proposals
- AI analyzes and compares proposals
- Returns scores, pros/cons, and recommendation

**Output:**

- Score (0-100) for each vendor
- Pros and cons per vendor
- Recommended vendor
- Overall explanation

**Prompt Design:**

- Prompts are designed in `backend/src/utils/promptTemplates.js`
- Each prompt explicitly instructs the LLM to return valid JSON only
- Responses are parsed safely with error handling in `backend/src/utils/jsonParser.js`

## 🔌 API Endpoints

### RFP Endpoints

| Method   | Endpoint                  | Description                      |
| -------- | ------------------------- | -------------------------------- |
| `POST`   | `/api/rfps/from-text`     | Create RFP from natural language |
| `GET`    | `/api/rfps`               | Get all RFPs                     |
| `GET`    | `/api/rfps/:id`           | Get RFP by ID                    |
| `PUT`    | `/api/rfps/:id`           | Update RFP                       |
| `DELETE` | `/api/rfps/:id`           | Delete RFP                       |
| `POST`   | `/api/rfps/:id/send`      | Send RFP to vendors              |
| `GET`    | `/api/rfps/:id/proposals` | Get all proposals for an RFP     |
| `POST`   | `/api/rfps/:id/compare`   | Compare proposals with AI        |

### Vendor Endpoints

| Method   | Endpoint           | Description      |
| -------- | ------------------ | ---------------- |
| `POST`   | `/api/vendors`     | Create vendor    |
| `GET`    | `/api/vendors`     | Get all vendors  |
| `GET`    | `/api/vendors/:id` | Get vendor by ID |
| `PUT`    | `/api/vendors/:id` | Update vendor    |
| `DELETE` | `/api/vendors/:id` | Delete vendor    |

### Email Endpoints

| Method | Endpoint             | Description                                |
| ------ | -------------------- | ------------------------------------------ |
| `POST` | `/api/email/inbound` | Webhook for receiving vendor email replies |

## 🎬 Demo Flow (5-10 minutes)

Here's a suggested flow for demonstrating the application:

### 1. Create an RFP from Natural Language (1-2 min)

- Navigate to "Create RFP"
- Enter a natural language description
- Click "Generate RFP"
- Review and edit the AI-generated structured RFP
- Save the RFP

### 2. Manage Vendors (1 min)

- Go to "Vendors" page
- Add 2-3 vendors with email addresses
- Show vendor list

### 3. Send RFP to Vendors (1 min)

- Open the created RFP
- Click "Send to Vendors"
- Select vendors from the dropdown
- Send the RFP
- Explain that emails are sent (check email if possible)

### 4. Simulate Vendor Response (2-3 min)

- Use the webhook endpoint to simulate a vendor reply
- Show how the AI parses the email
- View the parsed proposal in the RFP detail page
- Repeat for 2-3 vendors

### 5. Compare Proposals with AI (2-3 min)

- Click "Compare Proposals" (requires at least 2 proposals)
- Show the comparison table
- Highlight AI-generated scores, pros/cons
- Show the AI recommendation and explanation

### 6. Quick Code Walkthrough (1-2 min)

- Show AI service structure (`backend/src/services/aiService.js`)
- Show prompt templates (`backend/src/utils/promptTemplates.js`)
- Show email webhook handler (`backend/src/controllers/emailController.js`)
- Show frontend API integration (`frontend/src/services/`)

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**

- Ensure MongoDB is running: `mongod` or check MongoDB service
- Verify `MONGODB_URI` in `.env` is correct
- Check MongoDB logs for connection issues

**OpenAI API Errors:**

- Verify `OPENAI_API_KEY` is set correctly in `.env`
- Check API key has sufficient credits
- Review OpenAI API rate limits

**Email Sending Fails:**

- For Gmail: Use an App Password, not your regular password
- Verify SMTP settings in `.env`
- Check firewall/network restrictions
- Review Nodemailer logs in console

### Frontend Issues

**API Calls Fail:**

- Ensure backend is running on `http://localhost:5000`
- Check browser console for CORS errors
- Verify Vite proxy configuration in `vite.config.js`

**No Data Displayed:**

- Check browser console for errors
- Verify API responses in Network tab
- Ensure backend endpoints are working (test with curl/Postman)

## 📝 Additional Documentation

- `ARCHITECTURE_PROPOSAL.md` - Detailed architecture and design decisions
- `TESTING_GUIDE.md` - Guide for testing the application
- `EMAIL_WEBHOOK_FLOW_EXPLANATION.md` - Detailed email flow explanation
- `TEST_WEBHOOK.md` - Instructions for testing the email webhook

## 🎯 Key Features

- ✅ AI-powered RFP creation from natural language
- ✅ Vendor management (CRUD operations)
- ✅ Email sending via SMTP
- ✅ Email receiving via webhook
- ✅ AI-powered vendor response parsing
- ✅ AI-powered proposal comparison with scores and recommendations
- ✅ Clean, responsive UI with Ant Design and MUI
- ✅ Full CRUD operations for RFPs and Vendors
- ✅ Real-time proposal tracking

## 🔒 Security Notes

- **Never commit `.env` files** - They contain sensitive API keys
- Use environment variables for all configuration
- In production, use secure webhook validation
- Consider rate limiting for API endpoints
- Validate and sanitize all user inputs

## 📄 License

ISC

## 👤 Tanay Reshamwala

Built as a coding assignment demonstrating:

- Full-stack development (React + Node.js + MongoDB)
- AI/LLM integration
- Email integration
- Clean architecture and separation of concerns
- Modern UI/UX practices

---

**Happy RFP Managing! 🚀**
