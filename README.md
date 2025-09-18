git clone https://github.com/Mrunalgaikwad002/CabNet-Backend.git
cd cabnet-backend

2. Install Dependencies

npm install

3. Setup Environment Variables

Create a .env file in root:

PORT=5000
Supabase_URI
JWT_SECRET=your_jwt_secret_key

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Maps / Geolocation API
GOOGLE_MAPS_API_KEY=your_google_maps_key

4. Run Server

npm run dev

Server runs on: http://localhost: your_port-number


---

🚀 API Endpoints

🔑 Auth

POST /api/auth/register → Register user/driver

POST /api/auth/login → Login & get token


👤 User

GET /api/user/profile → Get profile

PUT /api/user/profile → Update profile


🚖 Ride

POST /api/rides/book → Book a ride

GET /api/rides/:id → Get ride details

POST /api/rides/confirm → Confirm ride (driver)

POST /api/rides/complete → Mark ride completed


📍 Tracking

POST /api/tracking/update → Update driver’s live location

GET /api/tracking/:rideId → Get ride live tracking


💳 Payments

POST /api/payments/create → Create payment intent (Stripe)

POST /api/payments/confirm → Confirm payment


📜 History

GET /api/rides/history → Get user/driver ride history



---

🛡 Middleware

Auth Middleware → Protects private routes with JWT

Error Handler → Centralized error handling



---

📊 Features

User & Driver Authentication (JWT)

Book Ride, Confirm Ride, Complete Ride

Live Location Tracking

Stripe Payment Integration

Ride & Earnings History

Driver & User Profile Management



---

🛠 Tech Stack

Backend: Node.js, Express.js

Database: Supabase

Authentication: JWT

Payments: Stripe API

Maps: Leaflet+ Open Street Maps

