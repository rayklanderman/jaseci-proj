# Codebase Genius - Deployment Guide

## 🚀 Deploy to Cloud Platforms

This guide will help you deploy Codebase Genius to Streamlit Cloud (frontend) and Render (backend) for online access.

## 📋 Prerequisites

- GitHub repository: `https://github.com/rayklanderman/jaseci-proj`
- Google Gemini API key
- Streamlit Cloud account
- Render account

## 🌐 Frontend Deployment (Streamlit Cloud)

### Step 1: Prepare Frontend
The frontend is already configured for Streamlit Cloud deployment.

### Step 2: Deploy to Streamlit Cloud
1. Go to [Streamlit Cloud](https://share.streamlit.io/)
2. Click "New app"
3. Connect your GitHub account
4. Select repository: `rayklanderman/jaseci-proj`
5. Main file path: `codebase_genius/frontend/app.py`
6. Click "Deploy"

### Step 3: Configure Environment Variables
In Streamlit Cloud app settings, add:
```
BACKEND_URL=https://your-render-app-url.onrender.com
```

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Backend
The backend is configured with `render.yaml` for easy deployment.

### Step 2: Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository: `rayklanderman/jaseci-proj`
4. Select branch: `main`
5. Render will detect the `render.yaml` file
6. Click "Apply Blueprint"

### Step 3: Configure Environment Variables
In Render service settings, add:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
PYTHONPATH=/opt/render/project/src/backend/python
```

### Step 4: Update Frontend
Once backend is deployed, update the `BACKEND_URL` in Streamlit Cloud with your Render app URL.

## 🔗 API Endpoints

After deployment, your app will be available at:
- **Frontend**: `https://your-app-name.streamlit.app`
- **Backend**: `https://your-service-name.onrender.com`

## 🧪 Testing

1. Open your Streamlit Cloud app
2. Enter a GitHub repository URL
3. Click "Generate Documentation"
4. Verify that documentation is generated and downloadable

## 🐛 Troubleshooting

### Common Issues:

**Backend Connection Failed:**
- Check that `BACKEND_URL` environment variable is set correctly in Streamlit Cloud
- Verify Render service is running and accessible

**API Key Issues:**
- Ensure `GEMINI_API_KEY` is set in Render environment variables
- Check API key has sufficient quota

**Build Failures:**
- Render: Check build logs for missing dependencies
- Streamlit Cloud: Check deployment logs for import errors

## 📊 Monitoring

- **Streamlit Cloud**: View logs in the app dashboard
- **Render**: View logs in the service dashboard
- Both platforms provide usage metrics and error tracking

## 🔄 Updates

To update your deployed app:
1. Push changes to the `main` branch on GitHub
2. Both platforms will automatically redeploy
3. Monitor deployment logs for any issues

## 💡 Tips

- Use the free tiers for testing
- Monitor API usage to avoid unexpected costs
- Set up proper error handling for production use
- Consider adding authentication for production deployments