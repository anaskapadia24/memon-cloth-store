# Memon Cloth Store - Full Stack E-Commerce Application

## Overview
Complete e-commerce solution with Node.js/Express backend, MongoDB database, and responsive frontend.

## Features
- **Customer Frontend**: Product browsing, cart, checkout, user authentication, order history, wishlist
- **Admin Panel**: Product management, order management, customer management, categories, settings
- **Backend API**: RESTful API with JWT authentication, image upload, MongoDB integration
- **Database**: MongoDB with Mongoose ODM

## Project Structure
```
memon-store/
├── backend/
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   └── seed.js        # Default data seeder
│   ├── models/
│   │   ├── User.js        # User model
│   │   ├── Product.js     # Product model
│   │   ├── Order.js       # Order model
│   │   ├── Category.js    # Category model
│   │   └── Setting.js     # Settings model
│   ├── routes/
│   │   ├── auth.js        # Authentication routes
│   │   ├── products.js    # Product CRUD routes
│   │   ├── orders.js      # Order management routes
│   │   ├── categories.js  # Category routes
│   │   └── users.js       # User management routes
│   ├── middleware/
│   │   ├── auth.js        # JWT & admin authentication
│   │   └── upload.js      # Image upload middleware
│   ├── uploads/           # Uploaded images
│   ├── server.js          # Express server
│   ├── package.json
│   └── .env               # Environment variables
└── frontend/
    ├── index.html         # Customer-facing website
    ├── admin.html         # Admin panel
    └── Memon_logo.png     # Store logo
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Setup Steps

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Configure Environment Variables**
Edit `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/memon-store
JWT_SECRET=your-secret-key-change-this
ADMIN_PASSWORD=memon2025
PORT=5000
NODE_ENV=development
```

For MongoDB Atlas, use your connection string:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/memon-store
```

3. **Start the Server**
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:5000
- Admin Panel: http://localhost:5000/admin.html
- API: http://localhost:5000/api

## Deployment

### Backend (Choose one)

#### Option 1: Render.com (Recommended - Free)
1. Push code to GitHub
2. Go to render.com and create a new Web Service
3. Connect your GitHub repository
4. Set root directory to `backend`
5. Add environment variables:
   - `MONGO_URI` (your MongoDB Atlas connection string)
   - `JWT_SECRET` (generate a random secret)
   - `ADMIN_PASSWORD` (your admin password)
   - `PORT` = 5000
6. Deploy

#### Option 2: Railway.app (Free tier)
1. Install Railway CLI
2. Run `railway login`
3. Run `railway init` in backend folder
4. Add environment variables
5. Run `railway up`

#### Option 3: Heroku (Free tier)
1. Install Heroku CLI
2. Run `heroku create your-app-name`
3. Set environment variables: `heroku config:set MONGO_URI=... JWT_SECRET=... ADMIN_PASSWORD=...`
4. Run `git push heroku main`

### Database

#### MongoDB Atlas (Free)
1. Go to mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Whitelist IP address 0.0.0.0/0 for access from anywhere
6. Use the connection string in your `MONGO_URI`

### Frontend (Choose one)

#### Option 1: Netlify (Recommended - Free)
1. Go to netlify.com
2. Drag and drop the `frontend` folder
3. Or connect GitHub repository
4. Update API_BASE in frontend files to point to your backend URL

#### Option 2: Vercel (Free)
1. Go to vercel.com
2. Import your GitHub repository
3. Set root directory to `frontend`
4. Deploy

### Update Frontend API URL

After deploying backend, update the API_BASE in both frontend files:

**In `frontend/index.html` and `frontend/admin.html`:**
```javascript
const API_BASE = 'https://your-backend-url.com/api';
```

Or use relative URL if frontend and backend are on same domain:
```javascript
const API_BASE = '/api';
```

## Admin Panel Access

1. Navigate to `/admin.html`
2. Login with password: `memon2025` (or your custom password from .env)

### Admin Features
- Dashboard with statistics
- Product management (add, edit, delete, image upload)
- Order management (view, update status, delete)
- Customer management (view customers, contact via WhatsApp/phone)
- Category management
- Store settings
- Data export/import/reset

## Default Credentials

**Admin Password:** `memon2025` (change in `.env` file)

## API Endpoints

### Public Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/categories` - Get all categories
- `GET /api/settings` - Get store settings

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)
- `PUT /api/auth/password` - Change password (requires auth)
- `POST /api/auth/address` - Add address (requires auth)
- `DELETE /api/auth/address/:id` - Delete address (requires auth)

### Orders
- `POST /api/orders` - Create order (requires auth)
- `GET /api/orders/my-orders` - Get user's orders (requires auth)
- `GET /api/orders` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)
- `DELETE /api/orders/:id` - Delete order (admin)

### Admin Endpoints (require X-Admin-Password header)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/export` - Export all data
- `POST /api/admin/import` - Import data
- `POST /api/admin/reset` - Reset to defaults
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `PUT /api/settings` - Update settings
- `GET /api/users` - Get all users

## Security Notes

1. **Change JWT_SECRET** - Use a strong random string
2. **Change ADMIN_PASSWORD** - Don't use default password in production
3. **MongoDB Atlas** - Restrict IP access in production
4. **HTTPS** - Always use HTTPS in production
5. **Environment Variables** - Never commit `.env` file to Git

## Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running (local)
- Verify connection string in `.env`
- Check MongoDB Atlas IP whitelist

### Products Not Loading
- Check browser console for errors
- Verify backend is running
- Check API_BASE URL in frontend files

### Image Upload Not Working
- Ensure `uploads` folder exists and has write permissions
- Check file size (max 5MB)
- Verify file type (JPG, PNG, WebP only)

### Admin Login Not Working
- Check ADMIN_PASSWORD in `.env`
- Clear browser cache
- Check browser console for errors

## Support

For issues or questions, contact the development team.

---

**Built with:** Node.js, Express, MongoDB, Mongoose, JWT, Multer
