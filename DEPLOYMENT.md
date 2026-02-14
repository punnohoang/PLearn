# PLearn - Environment Variables Setup Guide

## Overview
This guide explains how to configure environment variables for the PLearn application on production servers (Render for backend, Vercel for frontend).

## Production Environment Variables

### Backend (Render)

Access: https://dashboard.render.com

1. **Go to your backend service** (plearn-backend)
2. **Click on "Environment"** in the left sidebar
3. **Add these environment variables:**

| Variable Name | Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:password@host:port/dbname` | PostgreSQL connection string |
| `JWT_SECRET` | `your-secret-key-here` | Secret key for JWT token generation |
| `FRONTEND_URL` | `https://g5-plearn.vercel.app` | Frontend URL for CORS |
| `XAI_API_KEY` | `your-xai-api-key` | (Optional) API key for X.ai grok-beta model |

4. **Click "Save Changes"** - Render will automatically redeploy

**Important Notes:**
- `DATABASE_URL` is already set from PostgreSQL service
- `FRONTEND_URL` must match your Vercel frontend URL exactly
- If you get "No module named 'prisma'" errors, the postinstall script will fix it on redeploy

### Frontend (Vercel)

Access: https://vercel.com

1. **Go to your project** (g5-plearn)
2. **Click on "Settings"** in the top menu
3. **Click on "Environment Variables"** in the left sidebar
4. **Add this environment variable:**

| Variable Name | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://plearn-backend.onrender.com` | Backend API base URL |

5. **Redeploy by going to "Deployments"** → **Click your latest deployment** → **Click "Redeploy"**

**Important Notes:**
- This variable is PUBLIC (appears in frontend code), so it's safe to expose
- The prefix `NEXT_PUBLIC_` is required for Next.js to expose it to browser
- Value must include the full URL without trailing slash

## Complete URLs Reference

| Service | URL | Type |
|---|---|---|
| Frontend | https://g5-plearn.vercel.app | Vercel |
| Backend | https://plearn-backend.onrender.com | Render |
| Database | PostgreSQL on Render | Postgres |

## Testing the Connection

After setting environment variables:

1. **Test Backend:**
   ```
   curl https://plearn-backend.onrender.com/auth/register
   # Should get CORS or validation error, not 404
   ```

2. **Test Frontend:**
   - Go to https://g5-plearn.vercel.app
   - Open browser DevTools (F12)
   - Go to Console tab
   - It should show: `API baseURL: https://plearn-backend.onrender.com`
   - Try registering a new account
   - Should redirect to courses page after login

## Troubleshooting

### Issue: "Cannot POST /auth/register" (404)
**Solution:** 
- Verify `FRONTEND_URL` is set on Render
- Check it matches `https://g5-plearn.vercel.app` exactly
- Redeploy backend after changing

### Issue: "Network error" or "localhost:4000" in browser console
**Solution:**
- Verify `NEXT_PUBLIC_API_URL` is set on Vercel
- Check it's `https://plearn-backend.onrender.com` (no trailing slash)
- Verify backend is running: `curl https://plearn-backend.onrender.com/` (you'll see CORS error which is expected)
- Redeploy frontend after changing

### Issue: Backend starts but takes 30-50 seconds
**Solution:**
- This is normal for free Render tier - services spin down and need to warm up
- Wait for the initial deployment to complete
- Subsequent requests will be faster

### Issue: "Prisma client not found"
**Solution:**
- This is fixed by the postinstall script in package.json
- Just redeploy the backend
- The script runs: `prisma generate && nest build`

## Environment Variable Security

✅ **Safe to expose (NEXT_PUBLIC_):**
- `NEXT_PUBLIC_API_URL` - Backend URL, needed by frontend

❌ **Keep SECRET:**
- `JWT_SECRET` - Never commit to GitHub
- `DATABASE_URL` - Contains password
- `XAI_API_KEY` - API credentials
- Database password / credentials

## For Local Development

See [Backend README](../backend/README.md) and [Frontend README](../frontend/README.md) for local .env setup.

## Next Steps

1. Configure the environment variables above
2. Redeploy both services
3. Test the complete auth flow:
   - Register new account
   - Login
   - Enroll in course
   - View lessons
   - Update profile
4. Check browser console (F12) for any errors