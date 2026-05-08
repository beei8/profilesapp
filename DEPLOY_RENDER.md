# Deploying to Render.com

## Prerequisites
- GitHub account with your repository pushed
- Render.com account
- PostgreSQL database (Render provides free tier)

## Step-by-Step Deployment

### 1. Create PostgreSQL Database on Render

1. Go to [render.com](https://render.com) and log in
2. Click **New +** → **PostgreSQL**
3. Configure the database:
   - **Name:** `profilesapp-db`
   - **Database:** `profilesapp`
   - **User:** `postgres`
   - **Region:** Choose closest to your location
   - **Plan:** Free (includes 90-day retention)
4. Click **Create Database**
5. Copy the **Internal Database URL** (you'll need this for the web service)

### 2. Create Web Service on Render

1. Click **New +** → **Web Service**
2. Connect your GitHub repository:
   - Paste the repository URL or select from connected repos
   - Click **Connect**
3. Configure the service:
   - **Name:** `profilesapp-server`
   - **Environment:** `Node`
   - **Region:** Same as database
   - **Branch:** `main` (or your deployment branch)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free or Starter
   - **Auto-deploy:** Yes (recommended)

### 3. Add Environment Variables

In the **Environment** tab, add the following:

```
NODE_ENV=production
JWT_SECRET=<generate-a-strong-secret>
SETUP_KEY=<generate-a-setup-key>
DB_URL=<paste-the-internal-database-url-from-step-1>
```

Additionally, these will be parsed from `DB_URL` automatically:
- `DB_USER=postgres`
- `DB_PASSWORD=<auto>`
- `DB_HOST=<auto>`
- `DB_PORT=5432`
- `DB_NAME=profilesapp`

**If Render doesn't auto-parse the DB_URL**, manually add:
```
DB_USER=postgres
DB_PASSWORD=<your-db-password>
DB_HOST=<your-db-host>
DB_PORT=5432
DB_NAME=profilesapp
```

### 4. Deploy

1. Click **Create Web Service**
2. Render will automatically build and deploy your app
3. Monitor the **Logs** tab for any errors
4. Once deployed, you'll get a URL like `https://profilesapp-server.onrender.com`

### 5. Create Admin User

Once the server is running:

```bash
curl -X POST https://profilesapp-server.onrender.com/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "YourSecurePassword123!",
    "setupKey": "<your-SETUP_KEY-from-env>"
  }'
```

Or use the create-admin script locally by connecting to the remote database:

```bash
DB_USER=postgres \
DB_PASSWORD=<your-db-password> \
DB_HOST=<your-db-host> \
DB_PORT=5432 \
DB_NAME=profilesapp \
npm run create-admin
```

### 6. Update Frontend CORS

Update your frontend to point to the Render backend URL:

```javascript
// Vite frontend - update API calls to:
http://profilesapp-server.onrender.com/api
// or your custom domain if configured
```

Update CORS origins in `server.js` if needed.

## Important Notes

- **Free Tier Limits:**
  - Web Service spins down after 15 minutes of inactivity
  - Database auto-deletes after 90 days if not used
  - No persistent storage outside database

- **Production Recommendations:**
  - Use paid tier for persistent services
  - Set up custom domain
  - Enable automatic SSL/TLS
  - Monitor logs regularly
  - Set up error tracking (Sentry, etc.)

- **Database Backups:**
  - Create regular backups via Render dashboard
  - Export data before 90-day auto-deletion

## Troubleshooting

### "Cannot find module 'pg'"
- Run `npm install` and push changes to GitHub
- Trigger a manual redeploy on Render

### Database Connection Error
- Verify `DB_URL` or individual DB credentials in Environment tab
- Check database status in Render dashboard
- Ensure IP allowlist includes Render service (usually auto-configured)

### Server not starting
- Check **Logs** tab for detailed error messages
- Verify all required environment variables are set
- Check Node version compatibility (requires Node 18+)

## Success Indicators

✅ Green status on Render dashboard  
✅ Server logs show "✅ Server running on port"  
✅ API endpoints respond to requests  
✅ Can create admin user via setup endpoint  
