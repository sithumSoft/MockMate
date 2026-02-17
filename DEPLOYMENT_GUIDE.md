# 🚀 MockMate Deployment Guide

Complete step-by-step guide to deploy MockMate to Railway (backend) and Vercel (frontend).

## 📋 Pre-Deployment Checklist

- [x] Code pushed to GitHub: `https://github.com/sithumSoft/MockMate`
- [ ] Have Groq API key from https://console.groq.com/
- [ ] Railway account created (sign up with GitHub)
- [ ] Vercel account created (sign up with GitHub)

---

## 🎯 Step 1: Deploy Backend to Railway

### 1.1 Create New Project

1. Go to https://railway.app/
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select repository: `sithumSoft/MockMate`

### 1.2 Configure Service

1. After deployment starts, click on the service card
2. Go to **Settings** tab
3. Configure the following:

   **Root Directory**:
   ```
   server
   ```

   **Start Command**: (auto-detected, verify it's)
   ```
   npm start
   ```

   **Custom Build Command**: (leave blank, uses default `npm install`)

### 1.3 Generate Public Domain

1. In service settings, go to **"Networking"** section
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://mockmate-backend.up.railway.app`)
4. **Save this URL** - you'll need it for Vercel

### 1.4 Test Backend

Open in browser:
```
https://your-backend-url.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-17T..."
}
```

✅ **Backend Deployed Successfully!**

---

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Import Project

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Find and select `sithumSoft/MockMate`
4. Click **"Import"**

### 2.2 Configure Build Settings

Vercel will auto-detect these (verify):

- **Framework Preset**: `Vite`
- **Root Directory**: `./` (leave blank)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.3 Add Environment Variables

**CRITICAL**: Add these environment variables:

1. Click **"Environment Variables"** section
2. Add the following:

   **Variable 1:**
   - **Key**: `VITE_GROQ_API_KEY`
   - **Value**: `your_groq_api_key_from_console`
   - **Environment**: Production, Preview, Development (select all)

   **Variable 2:**
   - **Key**: `VITE_CODE_EXECUTION_URL`
   - **Value**: `https://your-backend-url.railway.app/api`
   - **Environment**: Production, Preview, Development (select all)

3. Click **"Deploy"**

### 2.4 Wait for Deployment

- Vercel will build and deploy (takes 1-2 minutes)
- Once complete, you'll get a URL like: `https://mockmate.vercel.app`

### 2.5 Test Frontend

1. Visit your Vercel URL
2. Try starting an interview
3. Test voice input/output
4. Test code editor (if backend is running)

✅ **Frontend Deployed Successfully!**

---

## 🔄 Step 3: Connect Backend to Frontend

### 3.1 Update Railway Environment Variables

1. Go to Railway dashboard → Your service
2. Click **"Variables"** tab
3. Click **"+ New Variable"**
4. Add:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://mockmate.vercel.app` (your actual Vercel URL)
5. Click **"Add"**

Railway will automatically redeploy with the new CORS settings.

### 3.2 Verify CORS

1. Open browser console on your Vercel site
2. Try using code editor
3. Check for CORS errors (there should be none)

---

## ✅ Step 4: Final Testing

### Test Frontend Features

- [ ] AI Interview starts successfully
- [ ] Questions are generated
- [ ] Can answer questions (text/voice)
- [ ] Performance analytics show
- [ ] History dashboard works
- [ ] PDF export works

### Test Backend Features (Code Editor)

- [ ] Code editor loads
- [ ] JavaScript execution works
- [ ] Python execution works (if installed on Railway)
- [ ] Server status shows "Connected"

---

## 📊 Step 5: Monitor & Maintain

### Monitor Groq API Usage

1. Visit: https://console.groq.com/usage
2. Check daily/monthly usage
3. Free tier: 14,400 requests/day

### Monitor Railway

1. Check service status in Railway dashboard
2. View logs for errors
3. Free tier: 500 hours/month

### Monitor Vercel

1. Check deployment status
2. View function logs
3. Free tier: 100GB bandwidth/month

---

## 🔄 Update Deployment

### Update Frontend

```bash
git add .
git commit -m "Update frontend features"
git push origin main
```

Vercel automatically redeploys on push to `main` branch.

### Update Backend

```bash
git add server/
git commit -m "Update backend logic"
git push origin main
```

Railway automatically redeploys on push to `main` branch.

---

## 🐛 Troubleshooting

### Issue: Backend Returns 404

**Symptoms**: Code editor shows "Server not available"

**Solutions**:
1. Check Railway service is running
2. Verify service has public domain
3. Test health endpoint: `https://your-backend-url/api/health`
4. Check Railway logs for errors

### Issue: CORS Error in Browser

**Symptoms**: Console shows "blocked by CORS policy"

**Solutions**:
1. Verify `FRONTEND_URL` is set in Railway variables
2. Check URL matches exactly (no trailing slash)
3. Redeploy Railway service
4. Clear browser cache

### Issue: Environment Variables Not Working

**Symptoms**: "API key missing" or backend URL wrong

**Solutions**:
1. Go to Vercel project settings
2. Check Environment Variables section
3. Verify keys are EXACTLY: `VITE_GROQ_API_KEY` and `VITE_CODE_EXECUTION_URL`
4. Redeploy from Vercel dashboard

### Issue: Build Fails on Vercel

**Symptoms**: Deployment fails during build

**Solutions**:
1. Check Vercel build logs
2. Verify `package.json` scripts are correct
3. Check for TypeScript errors locally: `npm run build`
4. Ensure all dependencies are in `package.json`

### Issue: Code Execution Fails

**Symptoms**: JavaScript works but other languages fail

**Solutions**:
- Python: Should work by default on Railway
- TypeScript: Need to add as dependency in `server/package.json`
- Java/C++: Need system-level installation (not available on free Railway)

---

## 📝 Environment Variables Reference

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GROQ_API_KEY` | Groq AI API key | `gsk_...` |
| `VITE_CODE_EXECUTION_URL` | Backend API endpoint | `https://backend.railway.app/api` |

### Backend (Railway)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (auto-set) | `3001` |
| `FRONTEND_URL` | Vercel frontend URL | `https://mockmate.vercel.app` |
| `NODE_ENV` | Environment (optional) | `production` |

---

## 🎉 Success!

Your MockMate application is now live:

- **Frontend**: https://mockmate.vercel.app
- **Backend**: https://mockmate-backend.railway.app

Share your live demo and happy interviewing! 🚀

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Groq API Documentation](https://console.groq.com/docs)
- [Vite Documentation](https://vitejs.dev/)

---

**Need Help?** Check Railway and Vercel logs for detailed error messages.
