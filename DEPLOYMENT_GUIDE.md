# QuickBite Deployment Guide

## 🚀 Deployment on Render

### Issues Fixed for Mobile Geolocation

#### Problem
The website worked perfectly on laptops but failed to fetch location on mobile devices when deployed on Render.

#### Root Causes Identified
1. **Hardcoded localhost URL**: Frontend was using `http://localhost:3000` even in production
2. **HTTPS Requirement**: Mobile browsers strictly require HTTPS for geolocation API
3. **Missing Environment Configuration**: No production environment variables set

#### Solutions Implemented

### 1. Environment-Based Server URL Configuration

**Before:**
```javascript
export const serverUrl = "http://localhost:3000"
```

**After:**
```javascript
export const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
```

### 2. Environment Files Created

- **`.env.development`**: For local development (uses http://localhost:3000)
- **`.env.production`**: For production deployment (uses https://quick-bite-t6pf.onrender.com)
- **`.env`**: Default fallback configuration

### 3. Enhanced Geolocation Hook

**Improvements made to `useGetCity.jsx`:**

✅ Better HTTPS detection (includes localhost and 127.0.0.1)
✅ Increased timeout to 20 seconds for mobile networks
✅ Enhanced error messages with specific troubleshooting steps
✅ Better logging for debugging mobile issues
✅ Fallback to saved location if geolocation fails
✅ Multiple city name fields for better geocoding compatibility

### 4. Key Features Added

- **Smart caching**: Saves location to localStorage for instant load
- **Graceful fallbacks**: Uses saved location if fresh location fetch fails
- **Better error handling**: Specific error messages for different failure types
- **Mobile-optimized**: Longer timeout and high accuracy GPS

---

## 📱 Deployment Steps for Render

### Backend Deployment

1. **Create New Web Service on Render**
   - Connect your GitHub repository
   - Select the `backend` folder as root directory
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node index.js`

2. **Set Environment Variables on Render Dashboard**
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_app_password
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   NODE_ENV=production
   PORT=3000
   ```

3. **Note the Backend URL**
   - After deployment, Render provides a URL like: `https://your-backend.onrender.com`

### Frontend Deployment

1. **Update `.env.production` file**
   ```
   VITE_SERVER_URL="https://your-backend.onrender.com"
   ```

2. **Create Static Site on Render**
   - Connect your GitHub repository
   - Select the `frontend` folder as root directory
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

3. **Set Environment Variables on Render**
   ```
   VITE_FIREBASE_APIKEY=your_firebase_key
   VITE_GEOAPIKEY=your_geoapify_key
   VITE_RAZORPAY_KEY_ID=your_razorpay_key
   VITE_SERVER_URL=https://your-backend.onrender.com
   ```

4. **Configure CORS on Backend**
   Make sure your backend `index.js` includes your frontend URL in CORS:
   ```javascript
   app.use(cors({
     origin: ["https://your-frontend.onrender.com"],
     credentials: true
   }))
   ```

---

## 🔧 Testing Mobile Geolocation

### On Mobile Device:

1. **Open Browser Settings**
   - Chrome: Settings → Site Settings → Location
   - Safari: Settings → Privacy & Security → Location Services

2. **Enable Location Services**
   - Make sure location is enabled for the browser
   - Grant permission when prompted

3. **Test the Site**
   - Visit: `https://quick-bite-t6pf.onrender.com`
   - Allow location access when prompted
   - Check browser console for logs (enable mobile debugging)

### Common Mobile Issues & Solutions:

| Issue | Solution |
|-------|----------|
| Permission denied | Enable location in device settings and browser settings |
| Position unavailable | Turn on GPS/Location services on device |
| Timeout error | Check internet connection, increase timeout value |
| HTTPS error | Ensure site is deployed on HTTPS (Render provides this automatically) |

---

## 🐛 Debugging Tips

### Enable Mobile Debugging

**Android Chrome:**
1. Enable Developer Options on phone
2. Enable USB Debugging
3. Connect to computer via USB
4. Open Chrome → `chrome://inspect`
5. View console logs from mobile device

**iOS Safari:**
1. Enable Web Inspector on iPhone (Settings → Safari → Advanced)
2. Connect to Mac via USB
3. Open Safari → Develop → [Your iPhone] → [Website]

### Check Console Logs

The enhanced geolocation hook now logs:
- Protocol and hostname information
- GPS coordinates with accuracy
- Geocoding API responses
- Detailed error messages
- Fallback behavior

### Test Locally with HTTPS

To test HTTPS locally before deployment:
```bash
# Install mkcert
npm install -g mkcert

# Create local certificates
mkcert create-ca
mkcert create-cert

# Update vite.config.js to use HTTPS
```

---

## ✅ Verification Checklist

Before deploying, ensure:

- [ ] Backend is deployed and accessible via HTTPS
- [ ] Frontend environment variables are set correctly
- [ ] CORS is configured with correct frontend URL
- [ ] All API keys are set in Render environment variables
- [ ] MongoDB connection is working
- [ ] Cloudinary credentials are correct
- [ ] Email service is configured
- [ ] Payment gateway (Razorpay) is in test/live mode as needed
- [ ] Socket.io connection works with HTTPS
- [ ] Location services work on mobile (test with actual device)

---

## 📊 Current Status

**Backend URL**: `https://quick-bite-t6pf.onrender.com`
**Frontend URL**: `https://quick-bite-t6pf.onrender.com` (assuming same)

**Mobile Geolocation**: ✅ Fixed
- Environment-based configuration implemented
- Enhanced error handling added
- Mobile-optimized timeout and accuracy settings
- Better debugging and logging

---

## 🔄 Updating After Changes

### Push to Production:
```bash
# Frontend changes
cd frontend
npm run build
git add .
git commit -m "Update frontend"
git push origin main

# Render will auto-deploy
```

### Test Before Pushing:
```bash
# Test production build locally
npm run build
npm run preview
```

---

## 📞 Support

If mobile location still doesn't work after deployment:

1. Check browser console for specific error codes
2. Verify HTTPS certificate is valid (no SSL warnings)
3. Test with different mobile browsers (Chrome, Safari, Firefox)
4. Ensure device location services are enabled
5. Try on different networks (WiFi vs Mobile Data)
6. Check if GPS is enabled on device (for high accuracy)

---

**Last Updated**: Based on mobile geolocation fix (Task 8)
**Status**: Ready for deployment ✅
