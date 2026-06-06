# 🏗️ QuickBite Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER DEVICES                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Desktop    │  │    Mobile    │  │    Tablet    │      │
│  │   Browser    │  │   Browser    │  │   Browser    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                     HTTPS Required                           │
│                     (Mobile GPS)                             │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│                https://quick-bite.onrender.com               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Components:                                            │ │
│  │  • Home Page (Browse shops/items)                      │ │
│  │  • Cart & Checkout                                     │ │
│  │  • Order Tracking (Real-time map)                     │ │
│  │  • Shop Management (Owner dashboard)                   │ │
│  │  • Delivery Partner Interface                          │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Redux Store:                                           │ │
│  │  • User State (auth, location, orders)                │ │
│  │  • Cart State                                          │ │
│  │  • Shop & Items State                                  │ │
│  │  • Socket.io Connection                                │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬───────────────────┬─────────────────┘
                        │                   │
                   REST APIs          WebSocket (Socket.io)
                        │                   │
                        ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│               BACKEND (Node.js + Express)                    │
│          https://quickbite-backend.onrender.com              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Routes:                                            │ │
│  │  • /api/auth      (signup, signin, logout)            │ │
│  │  • /api/user      (profile, location)                 │ │
│  │  • /api/shop      (CRUD operations)                    │ │
│  │  • /api/item      (CRUD, rating, search)              │ │
│  │  • /api/order     (create, track, update)             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Middleware:                                            │ │
│  │  • Authentication (JWT verification)                   │ │
│  │  • File Upload (Multer)                                │ │
│  │  • CORS (Environment-based)                            │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Socket.io Server:                                      │ │
│  │  • newOrder          (shop owner notifications)        │ │
│  │  • orderStatusUpdate (customer notifications)          │ │
│  │  • shopOrderUpdate   (delivery partner updates)       │ │
│  └────────────────────────────────────────────────────────┘ │
└──┬───────┬────────┬─────────┬──────────┬──────────────────┘
   │       │        │         │          │
   ▼       ▼        ▼         ▼          ▼
┌──────┐ ┌────┐ ┌──────┐ ┌────────┐ ┌─────────┐
│MongoDB│ │JWT │ │Bcrypt│ │Nodemailer│ │Razorpay │
│ Atlas │ │Auth│ │Hash  │ │  SMTP  │ │ Gateway │
└───────┘ └────┘ └──────┘ └────────┘ └─────────┘
   │                           │
   ▼                           ▼
┌──────────────┐         ┌──────────┐
│  Database    │         │  Gmail   │
│  Collections:│         │  Server  │
│  • users     │         └──────────┘
│  • shops     │
│  • items     │
│  • orders    │
│  • ratings   │
└──────────────┘

External Services:
┌──────────────┐  ┌─────────────┐  ┌─────────────┐
│  Cloudinary  │  │  Geoapify   │  │  Firebase   │
│  (Images)    │  │  (Geocoding)│  │  (Optional) │
└──────────────┘  └─────────────┘  └─────────────┘
```

## Data Flow Diagrams

### 1. User Registration & Authentication

```
User Browser                    Backend                    Database
     │                            │                            │
     │───── POST /api/auth/signup ─────────────────────────────▶│
     │         (email, password)  │                            │
     │                            │                            │
     │                            │──── Check if user exists ─▶│
     │                            │◀──── User not found ──────│
     │                            │                            │
     │                            │──── Hash password ─────────│
     │                            │    (bcrypt)                │
     │                            │                            │
     │                            │──── Create user ──────────▶│
     │                            │◀──── User created ─────────│
     │                            │                            │
     │                            │──── Generate JWT ──────────│
     │◀──── Set cookie + user data ────────────────────────────│
     │                            │                            │
     │                     (JWT stored in                      │
     │                      HTTP-only cookie)                  │
```

### 2. Location Detection (Mobile - The Key Fix!)

```
Mobile Browser            Frontend Hook           Geoapify API
     │                         │                        │
     │──── Load page ─────────▶│                        │
     │                         │                        │
     │                         │─ Check localStorage ───│
     │                         │  (cached city?)        │
     │                         │                        │
     │◀─── Show cached city ───│                        │
     │     (instant!)          │                        │
     │                         │                        │
     │                         │─ Check HTTPS ──────────│
     │                         │  ✓ Required!           │
     │                         │                        │
     │◀─── Location permission ─│                        │
     │     prompt?             │                        │
     │                         │                        │
     │──── Allow ─────────────▶│                        │
     │                         │                        │
     │                         │─ navigator.geolocation │
     │                         │  .getCurrentPosition() │
     │                         │  (20 sec timeout)      │
     │                         │                        │
     │◀─── GPS coordinates ────│                        │
     │     (lat, lon)          │                        │
     │                         │                        │
     │                         │───── Reverse geocode ─────────▶│
     │                         │      (lat, lon)               │
     │                         │◀──── City name ───────────────│
     │                         │      (county/city/town)       │
     │                         │                                │
     │◀─── Display city ───────│─ Save to localStorage ────────│
     │                         │                                │
     │                   (Next visit: instant load!)            │
```

### 3. Real-time Order Flow

```
Customer          Frontend         Backend         Shop Owner      Delivery Partner
   │                 │                │                │                  │
   │─ Place order ──▶│                │                │                  │
   │                 │─ POST /order ─▶│                │                  │
   │                 │                │─ Save to DB ──│                  │
   │                 │                │                │                  │
   │                 │                │═══ Socket.io: newOrder ════════▶│
   │                 │                │                │ (Notification)   │
   │◀─ Confirmation ─│◀─ Order ID ───│                │                  │
   │                 │                │                │                  │
   │                 │                │                │                  │
   │                 │                │◀─ Update: preparing ─────────────│
   │                 │                │                                   │
   │                 │◀══ Socket.io: orderStatusUpdate ═══════════════════│
   │◀─ Status update ─│                │                                   │
   │   "Preparing"   │                │                                   │
   │                 │                │                                   │
   │                 │                │◀─ Update: ready ──────────────────│
   │◀─ Status update ─│◀══ Socket ═══│                                   │
   │   "Ready"       │                │                                   │
   │                 │                │                                   │
   │                 │                │──── Assign delivery ─────────────▶│
   │                 │                │◀─── Accept ──────────────────────│
   │                 │                │                                   │
   │◀─ Status update ─│◀══ Socket ═══│                                   │
   │   "Out for      │                │                                   │
   │   delivery"     │                │                                   │
   │                 │                │                                   │
   │◀─ Track map ────│                │                                   │
   │   (live route)  │                │                                   │
   │                 │                │                                   │
   │                 │                │◀─ OTP verified ──────────────────│
   │◀─ Delivered! ───│◀══ Socket ═══│                                   │
   │                 │                │                                   │
```

### 4. Rating System (No Duplicates!)

```
User                Frontend            Backend              Database
  │                    │                   │                     │
  │─ Rate item (4★) ──▶│                   │                     │
  │                    │─ POST /rating ───▶│                     │
  │                    │   {itemId, rating}│                     │
  │                    │                   │                     │
  │                    │                   │─ Check existing ───▶│
  │                    │                   │   rating for        │
  │                    │                   │   (user, item)      │
  │                    │                   │◀─ Found! ──────────│
  │                    │                   │                     │
  │                    │                   │─ UPDATE rating ────▶│
  │                    │                   │   (not INSERT)      │
  │                    │                   │                     │
  │                    │                   │─ Recalculate avg ───│
  │                    │                   │   (count stays same)│
  │                    │                   │                     │
  │                    │◀─ Success ────────│                     │
  │◀─ Updated! ────────│                   │                     │
  │   (shows 4★)       │                   │                     │
  │                    │                   │                     │
  │  (Try to rate again)                   │                     │
  │─ Rate item (5★) ──▶│─ POST /rating ───▶│                     │
  │                    │                   │─ Check existing ───▶│
  │                    │                   │◀─ Found same! ─────│
  │                    │                   │                     │
  │                    │                   │─ UPDATE rating ────▶│
  │                    │                   │   4★ → 5★           │
  │                    │                   │   (count still 1!)  │
  │                    │◀─ Success ────────│                     │
  │◀─ Updated! ────────│                   │                     │
  │   (shows 5★)       │                   │                     │
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (customer|shopOwner|deliveryBoy),
  location: {
    city: String,
    state: String,
    address: String,
    coordinates: {
      lat: Number,
      lon: Number
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Shops Collection
```javascript
{
  _id: ObjectId,
  owner: ObjectId (ref: User),
  name: String,
  image: String (Cloudinary URL),
  city: String,
  address: String,
  items: [ObjectId] (ref: Item),
  createdAt: Date,
  updatedAt: Date
}
```

### Items Collection
```javascript
{
  _id: ObjectId,
  shop: ObjectId (ref: Shop),
  name: String,
  category: String,
  foodType: String (veg|non-veg),
  price: Number,
  image: String (Cloudinary URL),
  rating: {
    average: Number (default: 0),
    count: Number (default: 0)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Ratings Collection (Prevents Duplicates!)
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  item: ObjectId (ref: Item),
  rating: Number (1-5),
  createdAt: Date,
  updatedAt: Date,
  // UNIQUE INDEX on (user, item) - ensures one rating per user per item!
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  shopOrders: [{
    shop: ObjectId (ref: Shop),
    owner: ObjectId (ref: User),
    status: String (placed|preparing|ready|out-for-delivery|delivered),
    shopOrderItems: [{
      items: ObjectId (ref: Item),
      name: String,
      price: Number,
      quantity: Number
    }],
    subtotal: Number,
    otp: String
  }],
  deliveryAddress: String,
  deliveryLocation: {
    lat: Number,
    lon: Number
  },
  totalAmount: Number,
  paymentMethod: String (cod|online),
  payment: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Configuration

### Development (.env.development)
```
VITE_SERVER_URL=http://localhost:3000
```

### Production (.env.production)
```
VITE_SERVER_URL=https://quickbite-backend.onrender.com
```

**Key Insight**: Using environment-based configuration ensures:
- ✅ Localhost works on desktop
- ✅ HTTPS works on mobile in production
- ✅ No hardcoded URLs
- ✅ Easy testing in both environments

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Security Layers                      │
├─────────────────────────────────────────────────────────┤
│  1. HTTPS (TLS/SSL)                                     │
│     • Required for geolocation on mobile                │
│     • Encrypts data in transit                          │
│     • Provided automatically by Render                  │
├─────────────────────────────────────────────────────────┤
│  2. Authentication (JWT)                                │
│     • HTTP-only cookies (XSS protection)               │
│     • Token expiration                                  │
│     • Secure secret key                                 │
├─────────────────────────────────────────────────────────┤
│  3. Authorization                                       │
│     • Role-based access control                        │
│     • Middleware on protected routes                   │
│     • User-specific data isolation                     │
├─────────────────────────────────────────────────────────┤
│  4. Password Security                                   │
│     • Bcrypt hashing (salt rounds: 10)                │
│     • No plain-text storage                            │
│     • OTP verification for reset                       │
├─────────────────────────────────────────────────────────┤
│  5. CORS Configuration                                  │
│     • Whitelist specific origins                       │
│     • Credentials: true (for cookies)                  │
│     • Environment-based origins                        │
├─────────────────────────────────────────────────────────┤
│  6. Input Validation                                    │
│     • Server-side validation                           │
│     • MongoDB injection prevention                     │
│     • File upload restrictions                         │
├─────────────────────────────────────────────────────────┤
│  7. Rate Limiting (to be added)                        │
│     • Prevent brute force                              │
│     • API quota management                             │
└─────────────────────────────────────────────────────────┘
```

## Performance Optimizations

1. **Location Caching**
   - Saves city to localStorage
   - Instant load on subsequent visits
   - Reduces API calls to Geoapify

2. **Redux State Management**
   - Centralized state
   - Prevents unnecessary re-renders
   - Real-time updates without full refresh

3. **Image Optimization**
   - Cloudinary automatic optimization
   - Responsive image serving
   - CDN delivery

4. **Socket.io Connection**
   - Single persistent connection
   - Multiplexed events
   - Automatic reconnection

5. **Database Indexes**
   - Unique index on (user, item) for ratings
   - City index for shop queries
   - User email index for auth

## Scalability Considerations

### Current Architecture (Good for MVP)
- ✅ Supports hundreds of concurrent users
- ✅ Real-time updates work well
- ✅ Geographic filtering by city

### Future Enhancements (for Growth)
- 🔄 Load balancer for multiple backend instances
- 🔄 Redis for session management
- 🔄 Database read replicas
- 🔄 CDN for static assets
- 🔄 ElasticSearch for advanced search
- 🔄 Microservices architecture
- 🔄 Kubernetes deployment

---

**Architecture Status**: Production-ready ✅
**Key Fix**: Environment-based configuration for mobile HTTPS support
