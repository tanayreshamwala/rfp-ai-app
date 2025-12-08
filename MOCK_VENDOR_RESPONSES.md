# Mock Vendor Email Responses

This file contains two mock vendor email responses that can be used to test the email webhook endpoint (`POST /api/email/inbound`).

## Prerequisites

Before using these mock responses:

1. **Create the vendors in your database** with these email addresses:
   - `vanshikapatel034@gmail.com`
   - `boghipatel@gmail.com`

2. **Get your RFP ID** from the RFP you want to test with

3. **Replace `YOUR_RFP_ID_HERE`** in the commands below with your actual RFP ID

4. **Replace `your-email@gmail.com`** with the email address you're sending RFPs from

---

## Vendor 1: vanshikapatel034@gmail.com

### Email Details:
- **From:** vanshikapatel034@gmail.com
- **Subject:** Re: RFP: [Your RFP Title] [ID: YOUR_RFP_ID_HERE]
- **Body:** Competitive pricing with good warranty terms

### PowerShell Command:

```powershell
# Replace YOUR_RFP_ID_HERE with your actual RFP ID
$rfpId = "YOUR_RFP_ID_HERE"
$body = @{
    from = "vanshikapatel034@gmail.com"
    to = "your-email@gmail.com"
    subject = "Re: RFP: Laptop Procurement [ID: $rfpId]"
    text = "Dear Procurement Team,

Thank you for the opportunity to submit our proposal.

We are pleased to offer the following:

**Pricing:**
- 20 Laptops (16GB RAM, 512GB SSD): $1,400 per unit
- Total Price: $28,000 USD

**Delivery:**
- Delivery Time: 35 days from order confirmation
- Shipping: Free shipping included

**Payment Terms:**
- Net 30 days
- We accept bank transfer and credit card

**Warranty:**
- 2 years manufacturer warranty
- On-site support available
- Extended warranty options available

**Additional Notes:**
- All units come with Windows 11 Pro pre-installed
- We can provide bulk discounts for future orders
- Setup and installation services available at additional cost

We look forward to working with you.

Best regards,
Vanshika Patel
Tech Solutions Inc.
vanshikapatel034@gmail.com"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/email/inbound" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### curl Command:

```bash
curl -X POST http://localhost:5000/api/email/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "from": "vanshikapatel034@gmail.com",
    "to": "your-email@gmail.com",
    "subject": "Re: RFP: Laptop Procurement [ID: YOUR_RFP_ID_HERE]",
    "text": "Dear Procurement Team,\n\nThank you for the opportunity to submit our proposal.\n\nWe are pleased to offer the following:\n\n**Pricing:**\n- 20 Laptops (16GB RAM, 512GB SSD): $1,400 per unit\n- Total Price: $28,000 USD\n\n**Delivery:**\n- Delivery Time: 35 days from order confirmation\n- Shipping: Free shipping included\n\n**Payment Terms:**\n- Net 30 days\n- We accept bank transfer and credit card\n\n**Warranty:**\n- 2 years manufacturer warranty\n- On-site support available\n- Extended warranty options available\n\n**Additional Notes:**\n- All units come with Windows 11 Pro pre-installed\n- We can provide bulk discounts for future orders\n- Setup and installation services available at additional cost\n\nWe look forward to working with you.\n\nBest regards,\nVanshika Patel\nTech Solutions Inc.\nvanshikapatel034@gmail.com"
  }'
```

---

## Vendor 2: boghipatel@gmail.com

### Email Details:
- **From:** boghipatel@gmail.com
- **Subject:** Re: RFP: [Your RFP Title] [ID: YOUR_RFP_ID_HERE]
- **Body:** Premium pricing with faster delivery and better terms

### PowerShell Command:

```powershell
# Replace YOUR_RFP_ID_HERE with your actual RFP ID
$rfpId = "YOUR_RFP_ID_HERE"
$body = @{
    from = "boghipatel@gmail.com"
    to = "your-email@gmail.com"
    subject = "Re: RFP: Laptop Procurement [ID: $rfpId]"
    text = "Hello,

Thank you for considering us for your procurement needs.

**Our Proposal:**

**Pricing Details:**
- 20 Laptops with 16GB RAM and 512GB SSD: $1,450 per laptop
- Total Amount: $29,000 USD
- Price includes all standard accessories

**Delivery Schedule:**
- Delivery Time: 25 days from purchase order
- Express shipping available (additional cost)
- We can deliver in batches if needed

**Payment Terms:**
- Net 45 days payment terms available
- Early payment discount: 2% if paid within 15 days
- Multiple payment methods accepted

**Warranty & Support:**
- 3 years comprehensive warranty
- Free technical support for first year
- Optional extended warranty: 5 years available
- Remote support included

**Value-Added Services:**
- Free on-site setup and configuration
- Staff training session included
- 24/7 technical helpline
- Priority replacement service

We believe our proposal offers excellent value with superior support services.

Please let us know if you need any clarification.

Regards,
Boghi Patel
Premium IT Solutions
boghipatel@gmail.com"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/email/inbound" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### curl Command:

```bash
curl -X POST http://localhost:5000/api/email/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "from": "boghipatel@gmail.com",
    "to": "your-email@gmail.com",
    "subject": "Re: RFP: Laptop Procurement [ID: YOUR_RFP_ID_HERE]",
    "text": "Hello,\n\nThank you for considering us for your procurement needs.\n\n**Our Proposal:**\n\n**Pricing Details:**\n- 20 Laptops with 16GB RAM and 512GB SSD: $1,450 per laptop\n- Total Amount: $29,000 USD\n- Price includes all standard accessories\n\n**Delivery Schedule:**\n- Delivery Time: 25 days from purchase order\n- Express shipping available (additional cost)\n- We can deliver in batches if needed\n\n**Payment Terms:**\n- Net 45 days payment terms available\n- Early payment discount: 2% if paid within 15 days\n- Multiple payment methods accepted\n\n**Warranty & Support:**\n- 3 years comprehensive warranty\n- Free technical support for first year\n- Optional extended warranty: 5 years available\n- Remote support included\n\n**Value-Added Services:**\n- Free on-site setup and configuration\n- Staff training session included\n- 24/7 technical helpline\n- Priority replacement service\n\nWe believe our proposal offers excellent value with superior support services.\n\nPlease let us know if you need any clarification.\n\nRegards,\nBoghi Patel\nPremium IT Solutions\nboghipatel@gmail.com"
  }'
```

---

## Summary of Proposals

| Vendor | Email | Total Price | Delivery Days | Payment Terms | Warranty |
|--------|-------|-------------|---------------|---------------|----------|
| Vanshika Patel | vanshikapatel034@gmail.com | $28,000 | 35 days | Net 30 | 2 years |
| Boghi Patel | boghipatel@gmail.com | $29,000 | 25 days | Net 45 | 3 years |

**Key Differences:**
- **Vendor 1 (Vanshika):** Lower price ($28,000), longer delivery (35 days), shorter warranty (2 years)
- **Vendor 2 (Boghi):** Higher price ($29,000), faster delivery (25 days), longer warranty (3 years), better support services

---

## How to Use

1. **First, create the vendors** in your application:
   - Go to Vendors page
   - Add vendor with email: `vanshikapatel034@gmail.com`
   - Add vendor with email: `boghipatel@gmail.com`

2. **Create or select an RFP** to test with

3. **Get the RFP ID** from the RFP detail page URL or database

4. **Replace placeholders** in the commands:
   - `YOUR_RFP_ID_HERE` → Your actual RFP ID
   - `your-email@gmail.com` → Your email address

5. **Run the PowerShell or curl commands** in your terminal

6. **Check the results:**
   - Backend console should show success messages
   - Go to RFP detail page - you should see proposals
   - The AI should have parsed prices, delivery, terms, etc.

7. **Compare proposals:**
   - Once both proposals are received, use the "Compare Proposals" feature
   - The AI will analyze and recommend a vendor

---

## Notes

- Make sure your backend server is running on `http://localhost:5000`
- The RFP ID in the subject must match an existing RFP
- The vendor emails must exist in your database
- The AI will parse the email and extract structured proposal data
- You can modify the email body text to test different scenarios

