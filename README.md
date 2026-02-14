# Phone E-commerce Frontend

A modern, responsive React frontend for a phone e-commerce platform with guest browsing, cart/wishlist management, and secure checkout with OTP verification.

## Features

- 📱 **Browse Products**: View all phones with details and variants
- 🛒 **Guest Shopping**: Add to cart/wishlist without login
- 🔐 **Secure Authentication**: Login/signup with JWT tokens  
- ✉️ **OTP Verification**: Email OTP during checkout
- 📦 **Order Tracking**: Track order status with visual timeline
- 💳 **Complete Checkout**: Email → OTP → Shipping Address flow
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **React 19** with JavaScript
- **React Router** for navigation
- **Axios** for API calls
- **Vanilla CSS** with modern gradients and animations
- **Context API** for state management

## Backend API Base URL

The app connects to: `http://127.0.0.1:8000`

Update in `src/config/api.js` if your backend runs on a different URL.

## Installation

```bash
npm install
```

## Running the App

```bash
npm run dev
```

The app will run on http://localhost:5173/

## User Flow

### 1. Guest Browsing
- View all phones on home page
- Click on any phone to see details and variants
- Add items to cart/wishlist (stored in localStorage)

### 2. Checkout Process
When user tries to checkout from cart:
- If not logged in → Redirect to Login page
- After login → Merge guest cart/wishlist with user account
- Proceed to Checkout page

### 3. Checkout Steps
1. **Email Entry**: Enter email and click "Send OTP"
2. **OTP Verification**: Popup appears → Enter OTP → Verify
3. **Shipping Address**: Fill address form → Place Order

### 4. Order Tracking
- View all orders in "My Orders" page
- Click "View Details & Track" to see order timeline
- Visual progress indicator shows order status

## API Endpoints Used

### Products
- `GET /products/` - All products
- `GET /products/{product_id}` - Product details
- `GET /products/{product_id}/variants` - Product variants

### Cart
- `POST /cart/add` - Add to cart
- `GET /cart/` - Get cart items
- `PUT /cart/update` - Update quantity
- `DELETE /cart/remove/{cart_item_id}` - Remove item

### Wishlist
- `POST /wishlist/add` - Add to wishlist
- `GET /wishlist/` - Get wishlist items
- `DELETE /wishlist/remove/{wishlist_item_id}` - Remove item

### Authentication
- `POST /users/create` - Register new user
- `POST /auth/login` - Login user

### OTP
- `POST /otp/send` - Send OTP to email
- `POST /otp/verify` - Verify OTP code

### Orders
- `POST /checkout/place-order` - Place order
- `GET /orders/my` - My orders list
- `GET /orders/{order_id}` - Order details

## Development Notes

### Backend Requirements
Ensure your backend:
1. Returns `access_token` and `user` object on login
2. Accepts `Bearer` token in Authorization header
3. Returns proper CORS headers for `http://localhost:5173`

## Build for Production

```bash
npm run build
```
