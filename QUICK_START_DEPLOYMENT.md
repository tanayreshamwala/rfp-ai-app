# Quick Start: Deployment Checklist

## ✅ Code Changes Made

### 1. Backend Changes

- ✅ Updated CORS to accept frontend URL from environment variable
- ✅ `.env.example` created (template for environment variables)

### 2. Frontend Changes

- ✅ Updated API service to use `VITE_API_URL` environment variable (falls back to `/api`)
- ✅ `vercel.json` created for Vercel rewrites (update with your backend URL)

### 3. Git Configuration

- ✅ `.gitignore` updated to exclude all `.env` files
- ✅ Ready for GitHub push

---

## 🚀 Deployment Steps (Summary)

### Step 1: Push to GitHub

1. Follow `GITHUB_SETUP.md` to push your code
2. Verify `.env` files are NOT in the repository

### Step 2: Set Up MongoDB Atlas

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster (free M0 tier)
3. Configure network access (allow 0.0.0.0/0)
4. Get connection string

### Step 3: Deploy Backend (Render)

1. Sign up at [Render](https://render.com)
2. Create new Web Service from GitHub repo
3. **Root Directory:** `backend`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Add environment variables (see below)

### Step 4: Deploy Frontend (Vercel)

1. Sign up at [Vercel](https://vercel.com)
2. Import GitHub repository
3. **Root Directory:** `frontend`
4. **Framework:** Vite
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`

### Step 5: Connect Frontend to Backend

1. Update `frontend/vercel.json` with your Render backend URL
2. OR add `VITE_API_URL` environment variable in Vercel pointing to your Render backend

---

## 📋 Environment Variables Checklist

### Backend (Render)

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rfp-ai-app
OPENAI_API_KEY=sk-proj-your-key-here
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_SECURE=false
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=your-app-password
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel) - Optional

```
VITE_API_URL=https://your-backend.onrender.com
```

(Only needed if you want to explicitly set the API URL)

---

## 🔧 Files to Update Before Deployment

### 1. `frontend/vercel.json`

Update the `destination` URL with your actual Render backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api/:path*"
    }
  ]
}
```

### 2. Backend CORS

Already configured! Just make sure `FRONTEND_URL` in Render matches your Vercel URL.

---

## 📚 Detailed Guides

- **GitHub Setup:** See `GITHUB_SETUP.md`
- **Full Deployment:** See `DEPLOYMENT_GUIDE.md`

---

## ⚠️ Important Notes

1. **Never commit `.env` files** - They contain sensitive keys
2. **Update `vercel.json`** with your actual backend URL after deployment
3. **MongoDB Atlas** - Allow access from anywhere (0.0.0.0/0) for Render
4. **CORS** - Backend will accept requests from the URL in `FRONTEND_URL`
5. **Free Tier Limits:**
   - Render: 750 hours/month (enough for 24/7)
   - Vercel: Unlimited deployments
   - MongoDB Atlas: 512MB storage

---

## 🧪 Testing After Deployment

1. **Backend Health Check:**

   ```
   https://your-backend.onrender.com/
   ```

   Should return: `{"message":"Server running","status":"ok",...}`

2. **Frontend:**

   ```
   https://your-frontend.vercel.app
   ```

   Should load the application

3. **Test Features:**
   - Create an RFP
   - Add vendors
   - Send RFP (if email configured)
   - Test AI features

---

## 🆘 Troubleshooting

**CORS Errors:**

- Check `FRONTEND_URL` in Render matches Vercel URL exactly
- Verify no trailing slashes

**API Not Working:**

- Check `vercel.json` has correct backend URL
- Or set `VITE_API_URL` in Vercel environment variables
- Check browser console for errors

**Database Connection:**

- Verify MongoDB Atlas network access allows 0.0.0.0/0
- Check connection string has correct password
- Verify database user has read/write permissions

---

**Ready?** Start with `GITHUB_SETUP.md`! 🚀
