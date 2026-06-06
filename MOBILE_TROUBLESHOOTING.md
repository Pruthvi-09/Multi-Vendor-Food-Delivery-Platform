# 📱 Mobile Troubleshooting Guide

## Issue: Location Not Working on Mobile

### Quick Checklist ✅

1. **Is the site using HTTPS?**
   - Check URL starts with `https://`
   - Mobile browsers REQUIRE HTTPS for geolocation
   - ✅ Render provides HTTPS automatically

2. **Are location services enabled on device?**
   - **iOS**: Settings → Privacy & Security → Location Services → ON
   - **Android**: Settings → Location → ON

3. **Is location permission granted to browser?**
   - **iOS Safari**: Settings → Safari → Location → "Ask" or "Allow"
   - **Android Chrome**: Settings → Site Settings → Location → Allow

4. **Is GPS/High Accuracy enabled?**
   - **iOS**: Location Services should be ON
   - **Android**: Location → Mode → High Accuracy

### Step-by-Step Debugging

#### Step 1: Check Browser Console

Enable mobile debugging:
- **Android Chrome**: Use `chrome://inspect` on desktop
- **iOS Safari**: Connect to Mac, use Safari Developer Tools

Look for these messages:
```
✅ GOOD: "Using saved location: CityName"
✅ GOOD: "GPS Coordinates: {latitude: ..., longitude: ...}"
✅ GOOD: "Location updated successfully: CityName"

❌ BAD: "Geolocation is not supported by this browser"
❌ BAD: "Geolocation requires HTTPS"
❌ BAD: "User denied location permission"
❌ BAD: "Location unavailable"
```

#### Step 2: Test Location Permission

1. Open the website in mobile browser
2. You should see a permission prompt asking for location access
3. Click **"Allow"** or **"OK"**
4. If no prompt appears, check browser settings

#### Step 3: Clear Browser Cache

Sometimes old configurations cause issues:
- **iOS Safari**: Settings → Safari → Clear History and Website Data
- **Android Chrome**: Settings → Privacy → Clear Browsing Data

#### Step 4: Test with Different Browser

Try opening the site in:
- Chrome
- Safari
- Firefox
- Samsung Internet

This helps identify browser-specific issues.

### Common Error Messages & Solutions

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Please allow location access in your browser settings" | Permission denied | Go to browser settings and enable location for the website |
| "Location information is unavailable" | GPS is off or weak signal | Turn on GPS, move to open area with better signal |
| "Location request timed out" | Poor network or GPS | Check internet connection, wait for GPS lock (can take 20+ seconds) |
| "Location services require HTTPS" | Site not on HTTPS | Contact developer - site must be on HTTPS |
| "Location services are not supported by your browser" | Old browser version | Update browser to latest version |

### Advanced Troubleshooting

#### Check Environment Variables

The frontend needs correct backend URL:

**Production `.env` should have:**
```env
VITE_SERVER_URL="https://quick-bite-t6pf.onrender.com"
```

**NOT:**
```env
VITE_SERVER_URL="http://localhost:3000"  ❌
```

#### Verify CORS Configuration

Backend must allow your frontend URL in CORS:

```javascript
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173']
```

Environment variable should be:
```env
FRONTEND_URL=https://quick-bite-t6pf.onrender.com
NODE_ENV=production
```

#### Test Geolocation API Manually

Open browser console on mobile and run:
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log('Success!', position.coords);
  },
  (error) => {
    console.error('Failed:', error.message);
  }
);
```

This tests if geolocation works at all on the device.

### Mobile-Specific Code Improvements

Our implementation includes:

1. **20-second timeout** (mobile networks are slower)
```javascript
timeout: 20000
```

2. **High accuracy GPS**
```javascript
enableHighAccuracy: true
```

3. **No cached positions**
```javascript
maximumAge: 0
```

4. **Multiple city name fields**
```javascript
const cityName = locationData.county || 
                locationData.city || 
                locationData.state_district?.replace(" District", "") ||
                locationData.town ||
                locationData.village ||
                "Unknown City"
```

5. **localStorage fallback**
- Saves location on first successful fetch
- Uses saved location if new fetch fails
- Provides instant load on subsequent visits

### Testing Checklist Before Reporting Bug

- [ ] Site is accessed via HTTPS
- [ ] Device location services are enabled
- [ ] Browser has location permission
- [ ] GPS/High accuracy mode is on
- [ ] Browser is updated to latest version
- [ ] Tried in multiple browsers
- [ ] Checked browser console for errors
- [ ] Cleared browser cache and cookies
- [ ] Tested in different location (indoor vs outdoor)
- [ ] Internet connection is stable

### Still Not Working?

If location still fails after all checks:

1. **Check Geoapify API Key**
   - Verify `VITE_GEOAPIKEY` is valid
   - Check API quota hasn't been exceeded
   - Log into Geoapify dashboard to verify

2. **Use Manual Location Input (Fallback)**
   - Can be implemented as a fallback UI
   - Let users type their city name
   - Store in localStorage

3. **Check Server Logs**
   - Look for API rate limit errors
   - Verify geocoding API responses

### Example: Good Mobile Experience

```
User opens site on mobile
  ↓
Browser requests location permission
  ↓
User clicks "Allow"
  ↓
GPS acquires location (5-20 seconds)
  ↓
Geocoding API converts to city name
  ↓
City saved to localStorage
  ↓
Shows shops and items in user's city
  ↓
Next visit: instant load from localStorage
```

### Performance Tips

- **First load**: May take 10-20 seconds for GPS lock
- **Subsequent loads**: Instant (uses cached location)
- **Indoor vs Outdoor**: GPS works better outdoors
- **WiFi vs Mobile Data**: Both work, but WiFi can assist GPS

### Contact Support

If issues persist:
1. Screenshot the browser console errors
2. Note device model and OS version
3. Note browser name and version
4. Describe what happens vs what should happen
5. Share whether it worked before or never worked

---

**Last Updated**: After mobile geolocation fix implementation
**Status**: Mobile geolocation fully functional ✅
