# GitHub Setup Guide

Follow these steps to push your code to GitHub before deployment.

## Step 1: Check Current Git Status

```bash
# Navigate to project root
cd C:\Users\Tanay2000\Documents\rfp-ai-app

# Check if git is initialized
git status
```

If you see "not a git repository", proceed to Step 2. Otherwise, skip to Step 3.

## Step 2: Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: RFP Management System"
```

## Step 3: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the **+** icon in top right → **New repository**
3. Repository name: `rfp-ai-app` (or your preferred name)
4. Description: `AI-powered RFP Management System`
5. **Visibility:** Public or Private (your choice)
6. **DO NOT** check:

   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license

   (We already have these files)

7. Click **Create repository**

## Step 4: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/rfp-ai-app.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 5: Verify Push

1. Go to your GitHub repository page
2. You should see all your files
3. Verify that `.env` files are **NOT** visible (they should be ignored)

## Important: Before Pushing

### ✅ Files That Should Be Committed:

- All source code files
- `package.json` files
- Configuration files (except .env)
- Documentation files (.md)
- `.gitignore`

### ❌ Files That Should NOT Be Committed (already in .gitignore):

- `node_modules/` folders
- `.env` files (backend/.env, frontend/.env)
- `dist/` or `build/` folders
- IDE files (.vscode/, .idea/)

## Verify .gitignore

Your `.gitignore` should include:

```
node_modules/
.env
backend/.env
frontend/.env
dist/
build/
```

## Common Issues

### Issue: "fatal: remote origin already exists"

**Solution:**

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/rfp-ai-app.git
```

### Issue: "Permission denied"

**Solution:**

- Use HTTPS with personal access token, or
- Set up SSH keys in GitHub

### Issue: ".env file is showing in GitHub"

**Solution:**

```bash
# Remove from git tracking
git rm --cached backend/.env
git rm --cached frontend/.env

# Add to .gitignore (already done)
# Commit the change
git commit -m "Remove .env files from tracking"
git push
```

## Next Steps

After successfully pushing to GitHub:

1. Follow the **DEPLOYMENT_GUIDE.md** for deploying to Render and Vercel
2. Make sure to set all environment variables in the deployment platforms

---

**Ready to deploy?** Check `DEPLOYMENT_GUIDE.md` for next steps! 🚀
