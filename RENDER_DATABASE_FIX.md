# Fix Render Database Connection

## Current Status
✅ App is live: https://room-management-app.onrender.com
❌ PostgreSQL connection failing (using memory storage)

## Issue Analysis
The logs show: `connect ECONNREFUSED 10.221.16.5:443`
This indicates the DATABASE_URL is pointing to an internal IP that's not accessible.

## Solution Steps

### 1. Check Database URL in Render Dashboard
1. Go to your Render dashboard
2. Click on "room-management-db" (PostgreSQL service)
3. Go to "Connect" tab
4. Copy the "External Database URL" (not Internal)

### 2. Update Environment Variable
1. Go to "room-management-app" (Web service)
2. Click "Environment" tab
3. Find DATABASE_URL variable
4. Replace with the External Database URL from step 1
5. Click "Save Changes"

### 3. Manual Redeploy
1. Click "Manual Deploy" → "Deploy latest commit"
2. Wait for deployment to complete
3. Check logs for "PostgreSQL storage" instead of "memory storage"

### 4. Alternative: Use Render's Built-in PostgreSQL
If the above doesn't work, the database service might not be properly created.

**Option A: Check Database Status**
1. In Render dashboard, verify "room-management-db" shows "Available"
2. If not available, wait for it to finish provisioning

**Option B: Recreate Database Connection**
1. Delete the DATABASE_URL environment variable
2. Go to "Environment" → "Add Environment Variable"
3. Key: DATABASE_URL
4. Value: Select "Add from database" → choose "room-management-db"
5. Save and redeploy

## Expected Results After Fix
- Logs will show: "DATABASE_URL found, using PostgreSQL storage"
- Health endpoint will show: "database": "connected"
- Data will persist between app restarts
- Room data will be stored in PostgreSQL instead of memory

## Test Your Fixed App
1. Visit: https://room-management-app.onrender.com
2. Add some room payment data
3. Let app sleep (15+ minutes)
4. Wake it up by visiting again
5. Verify your data is still there (confirms PostgreSQL working)

## If Database Connection Still Fails
The app will continue working with in-memory storage as a fallback.
You can still use all features, but data won't persist between app restarts.