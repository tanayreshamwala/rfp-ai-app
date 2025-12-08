# Deployment Guide

This guide will help you deploy the RFP Management System to production using Render (backend) and Vercel (frontend).

## Prerequisites

1. **GitHub Account** - To host your code
2. **Render Account** - For backend deployment (free tier available)
3. **Vercel Account** - For frontend deployment (free tier available)
4. **MongoDB Atlas Account** - For production database (free tier available)
5. **OpenAI API Key** - For AI features

---

## Step 1: Push Code to GitHub

### 1.1 Initialize Git Repository (if not already done)

```bash
# In the project root directory
git init
```

### 1.2 Create .gitignore (already exists, but verify)

Make sure `.gitignore` includes:

- `node_modules/`
- `.env` files
- `dist/` and `build/`
- IDE files

### 1.3 Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `rfp-ai-app` (or your preferred name)
3. **DO NOT** initialize with README, .gitignore, or license (we already have these)

### 1.4 Push Code to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: RFP Management System"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/rfp-ai-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up MongoDB Atlas (Production Database)

### 2.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a new cluster (free tier: M0)

### 2.2 Configure Database Access

1. Go to **Database Access** → **Add New Database User**
2. Create username and password (save these!)
3. Set privileges: **Read and write to any database**

### 2.3 Configure Network Access

1. Go to **Network Access** → **Add IP Address**
2. For Render deployment: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Click **Add**

### 2.4 Get Connection String

1. Go to **Clusters** → Click **Connect**
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `rfp-ai-app` (or your preferred database name)

Example:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rfp-ai-app?retryWrites=true&w=majority
```

---

## Step 3: Deploy Backend to Render

### 3.1 Create Render Account

1. Go to [Render](https://render.com)
2. Sign up with GitHub (recommended)

### 3.2 Create New Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Select your repository: `rfp-ai-app`

### 3.3 Configure Backend Service

**Settings:**

- **Name:** `rfp-ai-app-backend` (or your choice)
- **Root Directory:** `backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free (or paid if needed)

### 3.4 Add Environment Variables

Click **Environment** tab and add:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rfp-ai-app?retryWrites=true&w=majority
OPENAI_API_KEY=sk-proj-your-actual-key-here
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_SECURE=false
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=your-app-password
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Important Notes:**

- `PORT` is automatically set by Render, but you can specify it
- `MONGODB_URI` - Use your MongoDB Atlas connection string
- `FRONTEND_URL` - Will be your Vercel frontend URL (update after frontend deployment)

### 3.5 Deploy

1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://rfp-ai-app-backend.onrender.com` (example)

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Create Vercel Account

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub (recommended)

### 4.2 Import Project

1. Click **Add New** → **Project**
2. Import your GitHub repository: `rfp-ai-app`
3. Select the repository

### 4.3 Configure Frontend Project

**Settings:**

- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4.4 Add Environment Variables (Optional)

If you need any frontend env vars, add them here. For this project, we don't need any since we use relative API paths.

### 4.5 Deploy

1. Click **Deploy**
2. Wait for deployment (2-3 minutes)
3. Note your frontend URL: `https://rfp-ai-app.vercel.app` (example)

### 4.6 Update Backend CORS

1. Go back to Render dashboard
2. Go to your backend service → **Environment** tab
3. **Add new environment variable:**
   - Key: `FRONTEND_URL`
   - Value: `https://your-frontend-url.vercel.app` (your actual Vercel URL)
4. Click **Save Changes**
5. Render will automatically redeploy with the new environment variable

---

## Step 5: Update Frontend API Configuration (if needed)

The frontend already uses relative paths (`/api`), which works with Vercel's proxy. However, if you need to point to a different backend:

1. In Vercel dashboard, go to your project
2. Go to **Settings** → **Environment Variables**
3. Add `VITE_API_URL` (if you modify the frontend to use it)

**Note:** The current setup uses Vite proxy, which should work automatically. If you have issues, you may need to configure Vercel rewrites.

---

## Step 6: Configure Vercel Rewrites (if needed)

If the frontend can't reach the backend, create `vercel.json` in the `frontend` directory:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.onrender.com/api/:path*"
    }
  ]
}
```

**However**, this may cause CORS issues. Better approach: Use environment variable for API URL.

---

## Step 7: Update API Base URL (Alternative Approach)

If the proxy doesn't work, update `frontend/src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  // ... rest of config
});
```

Then add `VITE_API_URL` in Vercel environment variables pointing to your Render backend URL.

---

## Step 8: Test Deployment

1. **Test Backend:**

   - Visit: `https://your-backend.onrender.com/`
   - Should see: `{"message":"Server running","status":"ok",...}`

2. **Test Frontend:**

   - Visit: `https://your-frontend.vercel.app`
   - Should load the application

3. **Test API Connection:**
   - Try creating an RFP
   - Check browser console for errors
   - Check Network tab for API calls

---

## Troubleshooting

### Backend Issues

**MongoDB Connection Fails:**

- Verify MongoDB Atlas network access allows `0.0.0.0/0`
- Check connection string has correct password
- Ensure database user has read/write permissions

**CORS Errors:**

- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check backend logs in Render dashboard

**Environment Variables Not Working:**

- Restart the service after adding env vars
- Check for typos in variable names

### Frontend Issues

**API Calls Fail:**

- Check if backend URL is correct
- Verify CORS settings in backend
- Check browser console for errors

**Build Fails:**

- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Check for TypeScript/ESLint errors

---

## Production Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in both platforms
- [ ] CORS configured correctly
- [ ] Database connection working
- [ ] API endpoints accessible
- [ ] Frontend can communicate with backend
- [ ] Email sending configured (if using real emails)
- [ ] OpenAI API key working

---

## Cost Estimate (Free Tier)

- **Render:** Free tier includes 750 hours/month (enough for 24/7 if single service)
- **Vercel:** Free tier includes unlimited deployments
- **MongoDB Atlas:** Free tier (M0) includes 512MB storage
- **OpenAI:** Pay-as-you-go (check pricing)

**Total:** $0/month (if within free tier limits)

---

## Next Steps

1. Set up custom domain (optional)
2. Configure email webhook for production (SendGrid/Mailgun)
3. Set up monitoring and error tracking (optional)
4. Configure backups for MongoDB

---

## Support

If you encounter issues:

1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

Good luck with your deployment! 🚀
