# Step-by-Step Render Deployment Guide

## Step 1: Prepare Your Code (DONE ✅)
Your project is already configured with:
- ✅ render.yaml (automatic deployment configuration)
- ✅ PostgreSQL support with Drizzle ORM
- ✅ Health check endpoint at /api/status
- ✅ Build and start scripts in package.json

## Step 2: Push to GitHub
1. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Repository name: `room-management-system` (or your preferred name)
   - Make it public (easier for free deployment)
   - Don't initialize with README (you already have files)
   - Click "Create repository"

2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Room Management System"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

## Step 3: Create Render Account
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended) - this makes connecting repositories easier
4. Complete account verification if required

## Step 4: Deploy Using Blueprint (Recommended)
1. In Render dashboard, click "New +" button (top right)
2. Select "Blueprint" from the dropdown
3. Connect your GitHub account if not already connected
4. Search and select your repository: `YOUR_USERNAME/room-management-system`
5. Render will automatically detect the `render.yaml` file
6. Review the services that will be created:
   - ✅ Web Service: `room-management-app` (Node.js)
   - ✅ PostgreSQL Database: `room-management-db`
7. Click "Apply" to start deployment

## Step 5: Monitor Deployment
1. Watch the build process in real-time:
   - Build logs will show npm install, build process, and startup
   - First deployment takes 3-5 minutes
   - Database creation is automatic

2. Deployment stages:
   - 🔄 Building... (npm install && npm run build)
   - 🔄 Starting... (npm start)
   - ✅ Live (your app is running!)

## Step 6: Access Your Application
1. Once deployed, you'll get a URL like: `https://room-management-app-xyz.onrender.com`
2. Click the URL to open your application
3. First load may take 30-60 seconds (initial startup)
4. Test the health endpoint: `https://your-app.onrender.com/api/status`

## Step 7: Verify Database Connection
Your app will automatically:
1. Connect to PostgreSQL using the DATABASE_URL environment variable
2. Create tables using your schema
3. Initialize sample room data and settings
4. Show "database": "connected" in the health check

## Alternative: Manual Setup (If Blueprint Doesn't Work)

### Create Web Service Manually:
1. New + → Web Service
2. Connect GitHub repository
3. Settings:
   - **Name:** room-management-app
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Create Database Manually:
1. New + → PostgreSQL
2. Settings:
   - **Name:** room-management-db
   - **Database:** room_management
   - **User:** room_user
   - **Plan:** Free

### Link Database to Web Service:
1. Go to Web Service → Environment tab
2. Add environment variable:
   - **Key:** DATABASE_URL
   - **Value:** (copy from PostgreSQL service Internal Database URL)

## Troubleshooting Common Issues

### Build Fails:
- Check build logs for specific errors
- Ensure all dependencies are in package.json
- Test build locally: `npm run build`

### App Won't Start:
- Check application logs in Render dashboard
- Verify start command: `npm start`
- Check if port binding is correct (app listens on process.env.PORT)

### Database Connection Issues:
- Verify DATABASE_URL is set in environment variables
- Check PostgreSQL service is running
- Review application logs for connection errors

### Health Check Fails:
- Visit: `https://your-app.onrender.com/api/status`
- Should return: `{"status":"healthy","database":"connected"}`
- If unhealthy, check logs for database connection issues

## Post-Deployment
- Your app sleeps after 15 minutes of inactivity (free tier)
- Wake-up time: 30-90 seconds
- Monthly limits: 750 hours runtime
- Database: 1GB storage limit

## Upgrading Later
- Web Service: $7/month (no sleep, faster)
- PostgreSQL: $7/month (more storage, backups)