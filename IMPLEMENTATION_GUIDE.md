# 3RD WAY FITNESS - Production Ready Implementation

A comprehensive, full-featured fitness gym management and e-commerce platform built with React, TypeScript, Firebase, and Tailwind CSS. This is a production-ready application with complete functionality, error handling, and user notifications.

## 🎯 Features Implemented

### Authentication & Authorization
- ✅ Google OAuth Authentication via Firebase
- ✅ Role-based access control (Member/Admin)
- ✅ Persistent authentication state
- ✅ Protected routes with automatic redirects
- ✅ User profile creation and management

### Member Dashboard (Authenticated Users)
- ✅ AI-Powered Workout Plan Generation (Google Gemini API)
- ✅ Session Booking System
- ✅ Booking History & Reservations
- ✅ Multiple workout duration options (weekly, daily)
- ✅ Plan history and tracking

### Admin Dashboard (Admins Only)
- ✅ Complete CRUD for Programs/Services
- ✅ Merchandise/Product Management
- ✅ Membership Plan Configuration
- ✅ Member Management & Progression Tracking
- ✅ Booking Overview
- ✅ Order Management
- ✅ AI-Generated Plans Monitoring
- ✅ Site Content Management (CMS)
- ✅ Form validation and error handling
- ✅ Statistics Overview

### E-Commerce System (Merchandise)
- ✅ Product Catalog with Filtering
- ✅ Shopping Cart Management
- ✅ Multiple Payment Methods:
  - M-Pesa STK Push
  - Lipa Na M-Pesa
  - Pochi la Biashara
  - Paybill (Manual)
- ✅ Order Processing & History
- ✅ Real-time cart updates

### User Experience
- ✅ User Profile Management
- ✅ Toast Notifications (Success, Error, Warning, Info)
- ✅ Error Boundaries with fallback UI
- ✅ Loading States & Skeletons
- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Dark Theme with Premium Styling
- ✅ Smooth Animations (Motion/Framer Motion)

### Data Management
- ✅ Firebase Firestore Integration
- ✅ Real-time Data Sync
- ✅ Server Timestamps
- ✅ Optimized Database Queries
- ✅ Batch Operations

### Utilities & Services
- ✅ Input Validation System
- ✅ Phone Number Formatting & Validation
- ✅ Email Validation
- ✅ Form Validation Helpers
- ✅ Currency Formatting (KES)
- ✅ Notification Manager
- ✅ Error Boundary Component

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+
- npm or yarn
- Firebase Project Account
- Google Cloud Project with Gemini API enabled

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_FIREBASE_API_KEY=your_firebase_key
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

3. **Update Firebase Configuration**
   Replace the Firebase config in `firebase-applet-config.json` with your project credentials:
   ```json
   {
     "apiKey": "YOUR_API_KEY",
     "authDomain": "your-project.firebaseapp.com",
     "projectId": "your-project-id",
     "storageBucket": "your-project.appspot.com",
     "messagingSenderId": "YOUR_SENDER_ID",
     "appId": "YOUR_APP_ID",
     "firestoreDatabaseId": "(default)"
   }
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

5. **Build for Production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.tsx              # Navigation with auth
│   ├── Footer.tsx              # Footer component
│   ├── ToastContainer.tsx      # Notification system
│   └── ErrorBoundary.tsx       # Error fallback
├── context/
│   └── AuthContext.tsx         # Auth state management
├── pages/
│   ├── LandingPage.tsx         # Home page
│   ├── MemberDashboard.tsx     # Member portal
│   ├── AdminDashboard.tsx      # Admin panel
│   ├── MerchandisePage.tsx     # E-commerce
│   └── ProfilePage.tsx         # User profile
├── lib/
│   ├── utils.ts                # Utility functions
│   ├── validation.ts           # Form validation
│   └── notifications.ts        # Toast manager
├── firebase.ts                 # Firebase config
├── App.tsx                     # Main app component
└── main.tsx                    # Entry point
```

## 🔐 Firebase Setup

### Firestore Collections

1. **members** - User profile data
   ```
   {
     uid: string,
     email: string,
     displayName: string,
     photoURL?: string,
     ageCategory: string,
     progressionLevel: string,
     bio?: string,
     phone?: string,
     createdAt: timestamp
   }
   ```

2. **admins** - Admin user IDs

3. **programs** - Fitness programs/classes
   ```
   {
     name: string,
     description: string,
     category: string,
     price: number,
     frequency: string
   }
   ```

4. **membership_plans** - Subscription tiers
   ```
   {
     name: string,
     targetAge: string,
     rates: { hourly, weekly, monthly, per_session },
     benefits: array
   }
   ```

5. **products** - Merchandise items
   ```
   {
     name: string,
     description: string,
     category: string,
     price: number,
     stock: number,
     imageUrl: string
   }
   ```

6. **orders** - Customer orders
   ```
   {
     memberId: string,
     items: array,
     total: number,
     paymentMethod: string,
     status: string,
     createdAt: timestamp
   }
   ```

7. **bookings** - Session bookings
   ```
   {
     memberId: string,
     programId: string,
     status: string,
     pricePaid: number,
     bookingDate: string,
     createdAt: timestamp
   }
   ```

8. **workout_plans** - AI-generated plans
   ```
   {
     memberId: string,
     goal: string,
     duration: string,
     planContent: string (markdown),
     createdAt: timestamp
   }
   ```

9. **site_content** - CMS content
   ```
   {
     section: string,
     title: string,
     body: string,
     imageUrl?: string
   }
   ```

## 🛡️ Security

### Security Rules (Firestore)
Set these rules in Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public collections
    match /products/{document=**} {
      allow read;
    }
    match /programs/{document=**} {
      allow read;
    }
    match /membership_plans/{document=**} {
      allow read;
    }
    match /site_content/{document=**} {
      allow read;
    }
    
    // User data
    match /members/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Admin only
    match /admins/{document=**} {
      allow read: if exists(/databases/$(database)/documents/admins/$(request.auth.uid));
      allow write: if false;
    }
    
    // Orders
    match /orders/{document=**} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid == resource.data.memberId || 
                      exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Bookings
    match /bookings/{document=**} {
      allow create, read: if request.auth != null;
    }
    
    // Workout Plans
    match /workout_plans/{document=**} {
      allow create, read: if request.auth.uid == resource.data.memberId || request.auth != null;
    }
  }
}
```

## 🎨 Styling & Design

- **Framework**: Tailwind CSS 4.1+
- **Animation**: Motion (Framer Motion)
- **Color Theme**: 
  - Primary Brand: `#F5821F` (Orange)
  - Background: `#000000` (Black)
  - Cards: `#151619` (Dark Gray)
- **Typography**: Inter, Anton, Playfair Display, JetBrains Mono

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Hamburger menu for mobile navigation
- Touch-friendly buttons and inputs

## 🔔 Notifications System

The app uses a toast notification system for user feedback:

```typescript
import { notificationManager } from '@/lib/notifications';

// Success
notificationManager.success('Operation completed!');

// Error
notificationManager.error('Something went wrong');

// Warning
notificationManager.warning('Be careful!');

// Info
notificationManager.info('FYI: Something happened');
```

## ⚠️ Error Handling

All pages are wrapped with an ErrorBoundary component that:
- Catches React errors
- Displays user-friendly fallback UI
- Provides recovery button
- Logs errors to console

## 🧪 Testing

```bash
# Type checking
npm run lint

# Build
npm run build
```

## 📦 Dependencies

Key dependencies:
- `react@19.0.1` - UI framework
- `react-router-dom@7.14.2` - Routing
- `firebase@12.12.1` - Backend
- `tailwindcss@4.1.14` - Styling
- `motion@12.23.24` - Animations
- `lucide-react@0.546.0` - Icons
- `date-fns@4.1.0` - Date utilities
- `@google/genai@1.29.0` - Gemini AI

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run preview
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

### Environment Variables for Production
Set these in your deployment environment:
- `GEMINI_API_KEY` - Google Gemini API key
- All Firebase credentials via `firebase-applet-config.json`

## 📊 Admin Dashboard Features

- **Overview**: Stats cards for members, programs, products, orders
- **Programs**: CRUD operations for fitness programs
- **Merchandise**: Full product management
- **Members**: View all members, manage progression levels
- **Plans**: Manage membership tiers and pricing
- **Bookings**: View all class bookings
- **AI Plans**: Monitor AI-generated workout plans
- **Orders**: Track all merchandise orders
- **CMS**: Manage site content

## 👤 User Roles

### Anonymous Users
- View landing page
- View merchandise
- Browse pricing

### Members (Authenticated)
- Book fitness sessions
- Generate AI workout plans
- View booking history
- Purchase merchandise
- Manage profile
- View workout history

### Admins
- Full access to admin dashboard
- Manage all content
- Track member progress
- View analytics
- Process orders

## 🐛 Known Limitations

- M-Pesa integration is simulated (implement actual API for production)
- Gemini API key required in .env for AI features
- Email notifications not yet implemented
- SMS notifications not yet implemented

## 🔄 Future Enhancements

- [ ] Email notification system
- [ ] SMS notifications via Twilio
- [ ] Real M-Pesa payment gateway
- [ ] Video streaming for classes
- [ ] Progress photos/gallery
- [ ] Social features (leaderboards)
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] Export reports
- [ ] Subscription management

## 📞 Support

For issues or questions:
1. Check Firebase Console for errors
2. Review browser console for errors
3. Verify environment variables
4. Check Firestore security rules

## 📄 License

Apache 2.0 License - See LICENSE file

---

**Built with ❤️ for Nairobi's Elite Fitness Community**

3RD WAY FITNESS - Where Iron Meets Grit - Where Grit Meets Glory
