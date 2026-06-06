# 🍔 QuickBite - Food Delivery Platform

A full-stack MERN (MongoDB, Express, React, Node.js) food delivery application with real-time order tracking, geolocation services, and multiple user roles.

## ✨ Features

### 👤 For Customers
- 🔐 Secure authentication with JWT
- 📍 Automatic location detection using GPS
- 🔍 Search food items and restaurants by city
- ⭐ Rate and review food items (one rating per user per item)
- 🛒 Shopping cart with real-time updates
- 💳 Multiple payment options (COD, Razorpay)
- 📦 Real-time order tracking with live map
- 📧 Email notifications for order updates

### 🏪 For Shop Owners
- 🏬 Create and manage restaurant/shop profile
- 🍕 Add, edit, delete food items with images
- 📊 Dashboard to view incoming orders
- ✅ Update order status (preparing, ready, delivered)
- 🔔 Real-time notifications for new orders
- 📈 View order history and analytics

### 🛵 For Delivery Partners
- 🚀 View assigned deliveries with customer details
- 🗺️ Interactive map with route to customer location
- 🔢 OTP verification for order delivery
- 💰 Earnings tracking (₹40 per delivery)
- 📜 Delivery history with past orders

### 🔔 Real-time Features
- Live order status updates via Socket.io
- Real-time notifications for all user types
- Instant rating updates without page refresh
- Live delivery tracking on map

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Leaflet** - Interactive maps
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **Firebase** - Authentication (additional)
- **Recharts** - Analytics charts

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Cloudinary** - Image storage
- **Multer** - File upload handling
- **Razorpay** - Payment gateway

## 📁 Project Structure

```
MERN-PROJECT/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Authentication & file upload
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── utils/          # Helper functions (mail, token, cloudinary)
│   ├── socket.js       # Socket.io event handlers
│   └── index.js        # Server entry point
│
└── frontend/
    ├── public/         # Static assets
    ├── src/
    │   ├── assets/     # Images
    │   ├── components/ # React components
    │   ├── hooks/      # Custom React hooks
    │   ├── pages/      # Page components
    │   ├── redux/      # Redux store & slices
    │   ├── App.jsx     # Main app component
    │   └── main.jsx    # Entry point
    └── index.html
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Geoapify API key
- Razorpay account (for payments)
- Gmail account (for email service)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "MERN PROJECT"
```

2. **Setup Backend**
```bash
cd backend
npm install
```

3. **Configure Backend Environment Variables**
Create `backend/.env` file:
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

4. **Setup Frontend**
```bash
cd ../frontend
npm install
```

5. **Configure Frontend Environment Variables**
Create `frontend/.env` file:
```env
VITE_SERVER_URL=http://localhost:3000
VITE_FIREBASE_APIKEY=your_firebase_key
VITE_GEOAPIKEY=your_geoapify_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

6. **Start Development Servers**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

## 🌐 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions on Render.

**Live Site**: [https://quick-bite-t6pf.onrender.com](https://quick-bite-t6pf.onrender.com)

## 🔑 Key Features Explained

### 1. Geolocation System
- Automatically detects user's city using browser GPS
- Caches location in localStorage for faster subsequent loads
- Shows only shops and items available in user's city
- Mobile-optimized with HTTPS support

### 2. Rating System
- Each user can rate an item only once
- Users can update their rating anytime
- Rating count remains accurate (no duplicate counting)
- Real-time rating updates visible on home page

### 3. Order Tracking
- Real-time status updates (placed → preparing → ready → out for delivery → delivered)
- Interactive map showing delivery partner's route
- OTP verification for secure delivery
- Email notifications at each stage

### 4. Real-time Communication
- Socket.io integration for instant updates
- Shop owners get instant notification of new orders
- Delivery partners see assignments immediately
- Customers see live order status changes

### 5. Multi-role System
- **Customer**: Browse, order, track, rate
- **Shop Owner**: Manage menu, process orders
- **Delivery Partner**: Accept deliveries, verify OTP, earn money

## 📱 Mobile Support

The application is fully responsive and works on:
- ✅ Desktop browsers
- ✅ Mobile browsers (iOS Safari, Android Chrome)
- ✅ Tablets

**Mobile Geolocation**: Fixed to work on HTTPS with proper error handling and user guidance.

## 🔒 Security Features

- JWT-based authentication
- HTTP-only cookies for token storage
- Password hashing with bcrypt
- OTP verification for sensitive actions
- CORS configuration for API security
- Input validation and sanitization
- Protected routes on frontend and backend

## 🐛 Known Issues & Solutions

### Issue: Location not working on mobile
**Solution**: Ensure the site is deployed on HTTPS. Render provides HTTPS automatically.

### Issue: Payment failing
**Solution**: Check Razorpay keys are correctly set in environment variables.

### Issue: Images not uploading
**Solution**: Verify Cloudinary credentials and check file size limits.

### Issue: Real-time updates not working
**Solution**: Check Socket.io CORS configuration includes your frontend URL.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Send OTP for password reset

### Shops
- `GET /api/shop/get-my-shop` - Get shop owned by logged-in user
- `POST /api/shop/create` - Create new shop
- `PUT /api/shop/update/:shopId` - Update shop details
- `GET /api/shop/get-by-city/:city` - Get all shops in a city

### Items
- `POST /api/item/add` - Add new food item
- `PUT /api/item/edit/:itemId` - Edit food item
- `DELETE /api/item/delete/:itemId` - Delete food item
- `GET /api/item/get-by-city/:city` - Get items by city
- `POST /api/item/rating` - Rate an item
- `POST /api/item/get-user-ratings` - Get user's ratings

### Orders
- `POST /api/order/create` - Create new order
- `GET /api/order/get-my-orders` - Get user's orders
- `PUT /api/order/update-status` - Update order status
- `POST /api/order/verify-otp` - Verify delivery OTP

### User
- `GET /api/user/current-user` - Get current user details
- `PUT /api/user/update-location` - Update user location

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Virtual Code**

## 🙏 Acknowledgments

- Geoapify for geocoding API
- Cloudinary for image hosting
- Razorpay for payment integration
- OpenStreetMap for map tiles

---

**Note**: This is a learning project for educational purposes. For production use, ensure proper security audits and testing.
