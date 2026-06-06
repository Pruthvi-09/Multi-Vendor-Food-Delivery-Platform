# ✅ Deployment Checklist - QuickBite

## Pre-Deployment Checklist

### 📋 Local Testing
- [ ] Backend runs successfully on `http://localhost:3000`
- [ ] Frontend runs successfully on `http://localhost:5173`
- [ ] Location detection works on laptop
- [ ] All API endpoints respond correctly
- [ ] Socket.io real-time updates work
- [ ] Image upload to Cloudinary works
- [ ] Email sending works (check spam folder)
- [ ] Payment integration works (test mode)
- [ ] No console errors in browser

### 🔑 Environment Variables Ready

#### Backend Variables
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Secure random string
- [ ] `CLOUDINARY_CLOUD_NAME` - From Cloudinary dashboard
- [ ] `CLOUDINARY_API_KEY` - From Cloudinary dashboard
- [ ] `CLOUDINARY_API_SECRET` - From Cloudinary dashboard
- [ ] `EMAIL_USER` - Gmail address
- [ ] `EMAIL_PASS` - Gmail app-specific password
- [ ] `RAZORPAY_KEY_ID` - From Razorpay dashboard
- [ ] `RAZORPAY_KEY_SECRET` - From Razorpay dashboard
- [ ] `NODE_ENV` - Set to `production`
- [ ] `FRONTEND_URL` - Your frontend Render URL
- [ ] `PORT` - Set to `3000`

#### Frontend Variables
- [ ] `VITE_SERVER_URL` - Your backend Render URL (HTTPS)
- [ ] `VITE_FIREBASE_APIKEY` - From Firebase console
- [ ] `VITE_GEOAPIKEY` - From Geoapify dashboard
- [ ] `VITE_RAZORPAY_KEY_ID` - Same as backend (public key)

### 📦 Code Ready
- [ ] All changes committed to Git
- [ ] No `.env` files committed (in `.gitignore`)
- [ ] `.env.example` files committed for reference
- [ ] README.md is up to date
- [ ] No `console.log` statements with sensitive data
- [ ] No hardcoded URLs or credentials

---

## Render Deployment Steps

### Step 1: Deploy Backend

1. **Create New Web Service**
   - [ ] Log into Render dashboard
   - [ ] Click "New +" → "Web Service"
   - [ ] Connect GitHub repository
   - [ ] Select repository

2. **Configure Backend Service**
   - [ ] Name: `quickbite-backend`
   - [ ] Region: Choose closest to users
   - [ ] Branch: `main`
   - [ ] Root Directory: `backend`
   - [ ] Environment: `Node`
   - [ ] Build Command: `npm install`
   - [ ] Start Command: `node index.js`
   - [ ] Plan: Free (or paid for production)

3. **Add Environment Variables**
   - [ ] Click "Environment" tab
   - [ ] Add all backend variables listed above
   - [ ] Double-check each value
   - [ ] Save changes

4. **Deploy Backend**
   - [ ] Click "Create Web Service"
   - [ ] Wait for deployment (5-10 minutes)
   - [ ] Check logs for errors
   - [ ] Note the backend URL (e.g., `https://quickbite-backend.onrender.com`)
   - [ ] Test backend health: `curl https://your-backend-url.onrender.com/api/health`

### Step 2: Deploy Frontend

1. **Create Static Site**
   - [ ] Click "New +" → "Static Site"
   - [ ] Connect same GitHub repository
   - [ ] Select repository

2. **Configure Frontend Service**
   - [ ] Name: `quickbite-frontend`
   - [ ] Region: Same as backend
   - [ ] Branch: `main`
   - [ ] Root Directory: `frontend`
   - [ ] Build Command: `npm install && npm run build:prod`
   - [ ] Publish Directory: `dist`

3. **Add Environment Variables**
   - [ ] Add `VITE_SERVER_URL` with your backend URL (HTTPS!)
   - [ ] Add `VITE_FIREBASE_APIKEY`
   - [ ] Add `VITE_GEOAPIKEY`
   - [ ] Add `VITE_RAZORPAY_KEY_ID`
   - [ ] Save changes

4. **Deploy Frontend**
   - [ ] Click "Create Static Site"
   - [ ] Wait for build and deployment (5-10 minutes)
   - [ ] Check logs for build errors
   - [ ] Note the frontend URL (e.g., `https://quickbite.onrender.com`)

### Step 3: Update CORS Configuration

1. **Update Backend Environment Variables**
   - [ ] Go to backend service on Render
   - [ ] Environment tab
   - [ ] Update `FRONTEND_URL` with your actual frontend URL
   - [ ] Save (will trigger redeploy)

2. **Verify CORS Works**
   - [ ] Open frontend URL in browser
   - [ ] Open browser console (F12)
   - [ ] Check for CORS errors
   - [ ] Should see successful API calls

---

## Post-Deployment Testing

### Desktop Testing
- [ ] Open site in Chrome
- [ ] Sign up new account
- [ ] Verify email received
- [ ] Sign in successfully
- [ ] Location detected automatically
- [ ] Browse shops and items
- [ ] Add items to cart
- [ ] Checkout process works
- [ ] Payment gateway loads
- [ ] Create shop (owner role)
- [ ] Add food items
- [ ] Upload images successfully
- [ ] Receive order notification
- [ ] Update order status
- [ ] Socket.io real-time updates work

### Mobile Testing (Critical!)
- [ ] Open site on Android phone
- [ ] HTTPS shows in URL (🔒 icon)
- [ ] Allow location permission when prompted
- [ ] Location detected (may take 10-20 seconds)
- [ ] City name displayed correctly
- [ ] Shops loaded for detected city
- [ ] All features work (cart, orders, etc.)
- [ ] Test on iOS device as well
- [ ] Test in different browsers (Chrome, Safari, Firefox)

### Mobile Geolocation Specific Tests
- [ ] Permission prompt appears
- [ ] GPS coordinates logged in console
- [ ] Geocoding API returns city name
- [ ] City saved to localStorage
- [ ] Refresh page - instant city load from cache
- [ ] Try in airplane mode - uses cached city
- [ ] Clear cache - fresh location detection

### Error Scenarios
- [ ] Deny location permission - see helpful error message
- [ ] Turn off GPS - see appropriate error
- [ ] Poor internet - timeout handled gracefully
- [ ] Invalid API keys - appropriate error logged

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Check Render dashboard for service health
- [ ] Monitor error logs
- [ ] Check API usage quotas (Geoapify, Cloudinary)
- [ ] Verify emails are being sent

### Weekly Checks
- [ ] Review user feedback
- [ ] Check MongoDB storage usage
- [ ] Monitor Cloudinary storage
- [ ] Review Razorpay transactions
- [ ] Check for any security alerts

### Monthly Checks
- [ ] Update dependencies (`npm outdated`)
- [ ] Review and rotate API keys if needed
- [ ] Backup MongoDB data
- [ ] Review performance metrics
- [ ] Check SSL certificate validity

---

## Troubleshooting

### Backend Issues
| Problem | Check | Solution |
|---------|-------|----------|
| 503 Service Unavailable | Render logs | Check for startup errors, verify environment variables |
| MongoDB connection failed | Connection string | Verify MongoDB Atlas is accessible, check IP whitelist |
| Socket.io not connecting | CORS config | Ensure `FRONTEND_URL` is correct |
| Images not uploading | Cloudinary logs | Verify API keys, check file size limits |
| Emails not sending | Email settings | Check Gmail app password, verify 2FA is enabled |

### Frontend Issues
| Problem | Check | Solution |
|---------|-------|----------|
| Blank page | Browser console | Check for JS errors, verify build completed |
| API calls failing | Network tab | Verify `VITE_SERVER_URL` is correct HTTPS URL |
| CORS errors | Backend CORS config | Ensure frontend URL is in `allowedOrigins` |
| Location not working | Console errors | See MOBILE_TROUBLESHOOTING.md |
| Payment not loading | Razorpay key | Verify `VITE_RAZORPAY_KEY_ID` is set |

### Mobile-Specific Issues
See detailed guide: [MOBILE_TROUBLESHOOTING.md](./MOBILE_TROUBLESHOOTING.md)

Quick fixes:
- Ensure HTTPS (check for 🔒 icon)
- Check device location settings
- Grant browser location permission
- Wait 20 seconds for GPS lock
- Try in open outdoor area
- Clear browser cache

---

## Rollback Procedure

If critical issues occur:

1. **Immediate Rollback**
   - [ ] Go to Render dashboard
   - [ ] Find the service
   - [ ] Go to "Events" tab
   - [ ] Click "Rollback" on last working deploy

2. **Investigate Issues**
   - [ ] Download logs from Render
   - [ ] Reproduce issue locally
   - [ ] Fix the issue
   - [ ] Test thoroughly locally

3. **Redeploy**
   - [ ] Commit fixes to Git
   - [ ] Push to main branch
   - [ ] Render auto-deploys
   - [ ] Verify fix on production

---

## Success Criteria

### ✅ Deployment is successful when:
- Backend is live and responding at HTTPS URL
- Frontend is live and loads without errors
- HTTPS certificate is valid (🔒 icon)
- Desktop location detection works
- **Mobile location detection works** (KEY FIX!)
- Users can sign up and receive email
- Users can browse and order food
- Shop owners can manage items
- Delivery partners can accept orders
- Real-time updates work across all roles
- Payment gateway loads correctly
- No CORS errors in console
- No critical errors in Render logs

### 🎯 Performance Goals
- Page load time < 3 seconds
- Location detection < 20 seconds on mobile
- API response time < 500ms
- Image upload < 10 seconds
- Real-time updates < 1 second delay

---

## Important URLs

### Development
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

### Production (Update with your URLs)
- Frontend: `https://quick-bite-t6pf.onrender.com`
- Backend: `https://quickbite-backend.onrender.com`
- MongoDB: `mongodb+srv://...`

### External Services
- Cloudinary Dashboard: https://cloudinary.com/console
- Razorpay Dashboard: https://dashboard.razorpay.com
- Geoapify Dashboard: https://myprojects.geoapify.com
- MongoDB Atlas: https://cloud.mongodb.com
- Firebase Console: https://console.firebase.google.com

---

## Documentation Links
- [README.md](./README.md) - Project overview
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- [MOBILE_TROUBLESHOOTING.md](./MOBILE_TROUBLESHOOTING.md) - Mobile-specific fixes
- [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md) - Recent changes and fixes

---

**Last Updated**: After mobile geolocation fix
**Status**: Ready for production deployment ✅
**Priority**: Test mobile location thoroughly!
