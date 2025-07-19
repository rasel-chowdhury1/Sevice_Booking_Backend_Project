# 🌍 Guide Backend Project

The Guide Backend powers the server-side of the **Gydes** mobile app — a location-based platform that connects **Seekers** (service users) with **Guides** (verified service providers). Built using **Node.js**, **Express**, **TypeScript**, and **MongoDB**, the system is optimized for performance, scalability, and secure multi-role access.

---

## 📌 Project Features

- JWT-based secure **authentication** with **role-based access control**
- **Role switching**: Users can toggle between Seeker and Guide roles
- **Guide discovery** via geolocation (`$geoNear`) with advanced filters
- **Event discovery** based on user location and preferences
- **Service booking system** with live status tracking
- **Real-time notifications** using Socket.IO
- **Payment integration** with **Stripe** and **PayPal**
- **File/document uploads** using AWS S3
- **Admin panel features** for verification and moderation
- **Scheduled cron jobs** (e.g., data cleanup, reminders)
- Robust input validation using **Zod**
- Secure logging with **Winston**

---

## ⚙️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT
- **File Upload**: AWS S3 + Multer
- **Payments**: Stripe, PayPal
- **Realtime**: Socket.IO
- **Validation**: Zod
- **Others**: Winston, node-cron, Nodemailer

---

## 📁 Folder Structure
/src
/app
/modules # Feature modules (user, booking, etc.)
/routes # API endpoints
/middleware # Auth, error handlers, validations
/config # Environment and service configs
/DB # MongoDB connection
/helpers # Utility functions
/interface # TypeScript interfaces
/constants # Enums and constants
/socket # Socket.IO logic
/types # Global types
index.ts # Entry point
app.ts # Express app config
server.ts # HTTP & Socket server bootstrap

## 👥 User Roles

- **Seeker**: Looks for services/guides
- **Guide**: Offers verified services
- **Admin**: Reviews, verifies, and manages platform activity

### 🔁 Role Switching

Users can switch between **Seeker** and **Guide** roles without creating a new account. When switching to Guide, document verification is required and managed by Admin.

---

## 🔐 Authentication Flow

- Signup with email, password, and role
- Passwords are hashed using `bcrypt`
- JWT token issued on login
- Role-based access enforced using middleware
- Secure .env config for sensitive keys

---

## 📍 Guide Discovery

- Guides discovered within **5km** radius via `$geoNear`
- Filters:
  - Verified by admin
  - Not already booked by same seeker
  - Matching interests (optional)
- Results sorted by rating

---

## 📅 Event Discovery

- Events found within **30km** of user location
- Only **future**, **active**, and **non-deleted** events shown
- Displays whether:
  - User has joined
  - Event is in calendar

---

## 🔁 Booking Logic

- Seekers can book Guides
- Booking status: `pending`, `active`, `done`, `cancelled`
- A seeker cannot rebook the same Guide until current booking is done or cancelled

---

## 💳 Payment Flow

- Payments initiated from frontend
- Backend processes:
  - Stripe/PayPal webhooks
  - Booking status updates
- Payment securely tied to a unique booking ID

---

## 🔐 Data Security

- Hashed passwords (`bcrypt`)
- Secure `.env` for secrets
- Input validation with `Zod`
- 2dsphere indexes for geolocation
- Middleware-based RBAC

---

## 🔌 API Reference

📫 [View full Postman API Documentation](https://documenter.getpostman.com/view/40841938/2sB34kDeA9)

---

## 🧪 Development & Testing

git clone https://github.com/rasel-chowdhury1/Sevice_Booking_Backend_Project
- cd Sevice_Booking_Backend_Project

# Install dependencies
npm install

# Start the server 
npm run dev

