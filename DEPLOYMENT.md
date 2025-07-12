# Vercel Deployment Guide

This guide will help you deploy your Gym Management Backend to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- MongoDB Atlas cluster (already configured)

## Step 1: Prepare Your Repository

Your repository is already configured for Vercel deployment with the following files:
- `vercel.json` - Vercel configuration
- `api/index.js` - Serverless function entry point
- Updated `package.json` with build scripts

## Step 2: Push to GitHub

1. **Add all changes to git:**
   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "New Project"**

3. **Import your GitHub repository:**
   - Select "Import Git Repository"
   - Choose your `gym-managment` repository
   - Click "Import"

4. **Configure the project:**
   - **Project Name:** `gym-management-backend` (or your preferred name)
   - **Framework Preset:** Other
   - **Root Directory:** `backend` (IMPORTANT!)
   - **Build Command:** `npm run build`
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

5. **Set Environment Variables:**
   Click "Environment Variables" and add:
   ```
   MONGODB_URI = mongodb+srv://milhimwork:Password1@cluster0.zvifaaj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   DATABASE_NAME = gym_management
   NODE_ENV = production
   CORS_ORIGIN = *
   ```

6. **Click "Deploy"**

### Option B: Using Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from the backend directory:**
   ```bash
   cd backend
   vercel
   ```

4. **Follow the prompts:**
   - Link to existing project? No
   - Project name: `gym-management-backend`
   - Directory: `./` (you're already in backend directory)

5. **Set environment variables:**
   ```bash
   vercel env add MONGODB_URI
   vercel env add DATABASE_NAME
   vercel env add NODE_ENV
   vercel env add CORS_ORIGIN
   ```

## Step 4: Environment Variables Setup

After deployment, ensure these environment variables are set in your Vercel project:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://milhimwork:Password1@cluster0.zvifaaj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0` |
| `DATABASE_NAME` | `gym_management` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `*` |

## Step 5: Test Your Deployment

1. **Get your deployment URL** from Vercel dashboard (e.g., `https://your-project.vercel.app`)

2. **Test the health endpoint:**
   ```bash
   curl https://your-project.vercel.app/api/v1/health
   ```

3. **Test creating a member:**
   ```bash
   curl -X POST https://your-project.vercel.app/api/v1/members \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "phoneNumber": "1234567890",
       "paidAmount": 50000
     }'
   ```

## Step 6: Update Flutter App

Once deployed, update your Flutter app to use the new Vercel URL instead of `localhost:3000`:

```dart
class ApiService {
  static const String baseUrl = 'https://your-project.vercel.app/api/v1';
  // ... rest of your API service code
}
```

## API Endpoints

Your deployed API will be available at:
- **Base URL:** `https://your-project.vercel.app`
- **Health Check:** `GET /api/v1/health`
- **Members:** `GET/POST/PUT/DELETE /api/v1/members`
- **Statistics:** `GET /api/v1/statistics`
- **Export:** `GET /api/v1/export/members`

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed:**
   - Verify environment variables are set correctly
   - Check MongoDB Atlas IP whitelist (should include 0.0.0.0/0 for Vercel)

2. **Build Failed:**
   - Ensure `backend` is set as root directory in Vercel
   - Check that all dependencies are in `package.json`

3. **Function Timeout:**
   - Vercel has a 10-second timeout for serverless functions
   - Consider optimizing database queries

### Viewing Logs:

1. **In Vercel Dashboard:**
   - Go to your project
   - Click on "Functions" tab
   - View logs for each request

2. **Using CLI:**
   ```bash
   vercel logs https://your-project.vercel.app
   ```

## Updating Your Deployment

Whenever you make changes to your backend:

1. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```

2. **Vercel will automatically redeploy** (if connected to GitHub)

3. **Or manually redeploy:**
   ```bash
   vercel --prod
   ```

## Domain Configuration (Optional)

To use a custom domain:

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Security Considerations

For production:

1. **Update CORS_ORIGIN** to your Flutter app's domain
2. **Use MongoDB IP whitelist** instead of 0.0.0.0/0
3. **Add authentication** if needed
4. **Enable HTTPS only** (Vercel provides this by default)

## Support

If you encounter issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- View function logs in Vercel Dashboard
- Check MongoDB Atlas connection status 