# Deploy to Render - Step by Step Guide

## Quick Overview
Render will host your complete room management system with PostgreSQL database for free. Your app will sleep after 15 minutes of inactivity and take ~30 seconds to wake up.

## Deployment Steps

### 1. Prepare Your Code
Your code is already configured with:
- ✅ `render.yaml` configuration file
- ✅ Build scripts in `package.json`
- ✅ PostgreSQL support with Drizzle ORM
- ✅ Health check endpoint at `/api/status`

### 2. Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended for easy deployment)
3. Connect your GitHub account

### 3. Deploy from GitHub
1. Push this code to a GitHub repository
2. In Render dashboard, click "New +" → "Blueprint"
3. Connect your GitHub repo
4. Render will automatically detect the `render.yaml` file
5. Click "Apply" to start deployment

### 4. Alternative: Manual Setup
If you prefer manual setup instead of Blueprint:

**Create Web Service:**
1. New + → Web Service
2. Connect GitHub repo
3. Settings:
   - **Name:** room-management-app
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

**Create Database:**
1. New + → PostgreSQL
2. Settings:
   - **Name:** room-management-db
   - **Database:** room_management
   - **User:** room_user
   - **Plan:** Free

**Connect Database:**
1. Go to Web Service → Environment
2. Add environment variable:
   - **Key:** `DATABASE_URL`
   - **Value:** Copy from PostgreSQL service connection string

### 5. What Happens During Deployment
1. Render installs dependencies (`npm install`)
2. Builds your app (`npm run build`)
3. Creates PostgreSQL database
4. Starts your server (`npm start`)
5. Your app becomes available at: `https://your-app-name.onrender.com`

## Free Tier Limitations
- **Sleep Policy:** App sleeps after 15 minutes of inactivity
- **Wake Time:** ~30-90 seconds to wake up from sleep
- **Runtime:** 750 hours per month (enough for moderate use)
- **Database:** 1GB PostgreSQL storage
- **Build Time:** Limited monthly build minutes

## Environment Variables Set Automatically
- `NODE_ENV=production`
- `DATABASE_URL` (PostgreSQL connection string)

## Monitoring Your App
- Visit your app URL to wake it up
- Check logs in Render dashboard
- Health check available at: `https://your-app.onrender.com/api/status`

## Upgrading Later
If you need always-on service:
- Web Service: $7/month (no sleep, faster builds)
- PostgreSQL: $7/month (more storage, better performance)

## Troubleshooting

### Database Connection Issues
1. Verify `DATABASE_URL` is set in environment variables
2. Check database status in Render dashboard
3. Review deployment logs for connection errors

### Build Failures
1. Check build logs in Render dashboard
2. Ensure all dependencies are in `package.json`
3. Verify build command runs locally: `npm run build`

### App Not Responding
1. Check if service is sleeping (common on free tier)
2. Visit app URL to wake it up
3. Review application logs for errors

Your room management system is now ready for Render deployment!