# StockInsight Deployment Guide

This guide covers deploying your StockInsight application to various platforms.

## 📋 Prerequisites

1. **MongoDB Database** - You'll need a MongoDB instance (MongoDB Atlas recommended)
2. **Git Repository** - Your code should be in a Git repository (GitHub, GitLab, etc.)
3. **Node.js** - Ensure your deployment platform supports Node.js

---

## 🗄️ Step 1: Set Up MongoDB Database

### Option A: MongoDB Atlas (Recommended - Free Tier Available)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (choose the free M0 tier)
4. Create a database user (username/password)
5. Whitelist IP addresses (add `0.0.0.0/0` for all IPs, or your server IP)
6. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/stockinsight?retryWrites=true&w=majority`)
   - Replace `<password>` with your actual password
   - Replace `stockinsight` with your database name

### Option B: Self-Hosted MongoDB

If you have your own MongoDB server, use the connection string format:
```
mongodb://username:password@host:port/database
```

---

## 🚀 Deployment Options

### Option 1: Render (Recommended - Easy & Free Tier)

Render is great for full-stack apps with automatic deployments.

#### Backend Deployment on Render:

1. **Create a Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** `stockinsight-backend`
     - **Root Directory:** `server`
     - **Environment:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free (or paid)

2. **Environment Variables:**
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A random secret string (generate with: `openssl rand -base64 32`)
   - `PORT` - Leave empty (Render sets this automatically)

3. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://stockinsight-backend.onrender.com`)

#### Frontend Deployment on Render:

1. **Create a Static Site:**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name:** `stockinsight-frontend`
     - **Root Directory:** `client`
     - **Build Command:** `npm install && npm run build`
     - **Publish Directory:** `dist`

2. **Environment Variables:**
   - `VITE_API_BASE_URL` - Your backend URL (e.g., `https://stockinsight-backend.onrender.com/api`)

3. **Deploy:**
   - Click "Create Static Site"
   - Wait for deployment
   - Your app will be live!

---

### Option 2: Vercel (Frontend) + Railway/Render (Backend)

#### Backend on Railway:

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Configure:
   - **Root Directory:** `server`
   - **Start Command:** `npm start`
5. Add Environment Variables:
   - `MONGO_URI`
   - `JWT_SECRET`
6. Deploy and get your backend URL

#### Frontend on Vercel:

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL` - Your backend URL
5. Deploy

---

### Option 3: Netlify (Frontend) + Heroku/Render (Backend)

#### Backend on Heroku:

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create stockinsight-backend`
4. Set environment variables:
   ```bash
   heroku config:set MONGO_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   ```
5. Deploy:
   ```bash
   cd server
   git subtree push --prefix server heroku main
   ```

#### Frontend on Netlify:

1. Go to [Netlify](https://netlify.com)
2. Import your GitHub repository
3. Configure:
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL` - Your backend URL
5. Deploy

---

### Option 4: Full Stack on Railway

Railway can host both frontend and backend:

1. **Backend Service:**
   - Create new project → Deploy from GitHub
   - Root Directory: `server`
   - Start Command: `npm start`
   - Add env vars: `MONGO_URI`, `JWT_SECRET`

2. **Frontend Service:**
   - Add new service → Deploy from GitHub
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l 3000`
   - Add env var: `VITE_API_BASE_URL` (use backend service URL)

---

## 🔧 Environment Variables Summary

### Backend (.env file or platform environment variables):
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/stockinsight?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
FRONTEND_URL=https://your-frontend-url.com  # Optional: For CORS security (recommended in production)
```

### Frontend (Platform environment variables):
```env
VITE_API_BASE_URL=https://your-backend-url.com/api
```

**Note:** 
- Create `.env` files in both `server/` and `client/` directories with these variables for local development
- Never commit `.env` files to Git (they're already in `.gitignore`)
- For production, set these as environment variables in your hosting platform

---

## 📝 Pre-Deployment Checklist

- [ ] MongoDB database is set up and accessible
- [ ] Backend environment variables are configured
- [ ] Frontend environment variable `VITE_API_BASE_URL` points to backend
- [ ] CORS is configured in backend (should allow your frontend domain)
- [ ] All dependencies are in `package.json`
- [ ] Build commands work locally (`npm run build` in client folder)

---

## 🔒 Security Considerations

1. **JWT_SECRET:** Use a strong, random secret (at least 32 characters)
2. **MongoDB:** Use strong passwords and restrict IP access if possible
3. **CORS:** Update CORS settings in `server.js` to allow only your frontend domain
4. **Environment Variables:** Never commit `.env` files to Git

---

## 🐛 Troubleshooting

### Backend Issues:

1. **MongoDB Connection Failed:**
   - Check your connection string
   - Verify IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

2. **Port Issues:**
   - Use `process.env.PORT` (platforms set this automatically)
   - Don't hardcode port numbers

3. **Build Failures:**
   - Check Node.js version compatibility
   - Ensure all dependencies are in `package.json`

### Frontend Issues:

1. **API Calls Failing:**
   - Verify `VITE_API_BASE_URL` is set correctly
   - Check CORS settings in backend
   - Ensure backend URL includes `/api` at the end

2. **Build Errors:**
   - Check for missing dependencies
   - Verify Vite configuration

---

## 📚 Additional Resources

- [MongoDB Atlas Setup Guide](https://docs.atlas.mongodb.com/getting-started/)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)

---

## 🎉 Post-Deployment

After deployment:
1. Test all features (login, signup, portfolio, etc.)
2. Monitor logs for errors
3. Set up error tracking (optional: Sentry)
4. Configure custom domain (optional)
5. Set up SSL/HTTPS (usually automatic on these platforms)

---

## 💡 Quick Start Commands

### Generate JWT Secret:
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### Test Backend Locally:
```bash
cd server
npm install
# Create .env file with MONGO_URI and JWT_SECRET
npm start
```

### Test Frontend Build Locally:
```bash
cd client
npm install
# Create .env file with VITE_API_BASE_URL=http://localhost:5000/api
npm run build
npm run preview
```

---

Good luck with your deployment! 🚀

