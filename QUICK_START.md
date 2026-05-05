# Quick Start Guide - 3RD WAY FITNESS

## 5-Minute Setup

### 1. Install & Start
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

## Feature Overview

### For Users

**Sign Up/Login**
- Click "JOIN NOW" button
- Sign in with Google
- Profile auto-created

**Browse Merchandise**
- Navigate to "ARMORY"
- Filter by category
- Add items to cart
- Checkout with M-Pesa

**Book Sessions**
- Go to "MY TRAINING" dashboard
- Browse available sessions
- Click "Book Now"
- Confirm reservation

**Generate Workout Plan**
- In dashboard, enter fitness goal
- Select duration (weekly/daily)
- AI generates custom plan
- Download or share

**Manage Profile**
- Click profile icon
- Edit name, bio, phone
- Update progression level
- View member statistics

### For Admins

**Access Admin Panel**
- Must be added to `admins` collection in Firestore
- Navigate to `/admin`
- Complete dashboard control

**Manage Programs**
- Add new fitness programs
- Set pricing and frequency
- Edit descriptions
- Delete old programs

**Manage Products**
- Add merchandise items
- Upload images (Unsplash URLs)
- Set inventory
- Track sales

**View Members**
- See all registered members
- Update progression levels
- Track member activity
- View join dates

**Process Orders**
- View all merchandise orders
- Track payment status
- Manage fulfillment
- Export order reports

**Manage Content**
- Edit site text
- Add promotional content
- Update pricing tiers
- Manage CMS

## Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Main app routing and layout |
| `AuthContext.tsx` | Authentication state management |
| `LandingPage.tsx` | Homepage with programs and pricing |
| `MemberDashboard.tsx` | User portal for bookings and plans |
| `AdminDashboard.tsx` | Admin control panel |
| `MerchandisePage.tsx` | E-commerce storefront |
| `ProfilePage.tsx` | User profile management |

## Database Structure

### Essential Collections

1. **members** - User accounts
2. **admins** - Admin user IDs
3. **programs** - Fitness classes
4. **products** - Merchandise
5. **orders** - Purchase history
6. **bookings** - Session reservations
7. **workout_plans** - AI-generated plans
8. **membership_plans** - Pricing tiers

## Configuration

### Update Firebase Config
Edit `firebase-applet-config.json`:
```json
{
  "apiKey": "YOUR_KEY",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID",
  "firestoreDatabaseId": "(default)"
}
```

### Add Test Admin User
1. Go to Firebase Console
2. Create collection: `admins`
3. Add document with user UID as ID
4. Set `role: "admin"`

### Add Sample Data
Add to Firebase Console:

**Sample Product:**
```json
{
  "name": "Elite Training Tee",
  "description": "Heavyweight cotton, premium breathability",
  "price": 1800,
  "category": "Apparel",
  "stock": 50,
  "imageUrl": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000"
}
```

**Sample Program:**
```json
{
  "name": "House of Pain",
  "description": "Elite strength & conditioning. Weekly high-intensity cycles.",
  "category": "gym",
  "price": 1000,
  "frequency": "weekly"
}
```

## Common Tasks

### Create New Membership Plan
1. Login as admin
2. Go to Admin → Plans
3. Click "NEW PLAN"
4. Fill in name, target age, rates
5. Save

### Add Product
1. Admin → Merchandise
2. Click "NEW PRODUCT"
3. Upload image URL
4. Set price and stock
5. Save

### Generate Workout Plan (as member)
1. Go to Member Dashboard
2. Enter fitness goal
3. Select duration
4. Click generate
5. View AI-generated plan

### View Orders (as admin)
1. Admin → Orders
2. See all customer purchases
3. Filter by date/status
4. Export if needed

### Manage Members
1. Admin → Members
2. See member list
3. Update progression level
4. Track activity

## Troubleshooting

**Login not working:**
- Verify Firebase project is active
- Check Google OAuth is enabled
- Ensure redirect URLs are correct

**Can't see admin panel:**
- Must add your user ID to `admins` collection
- Check Firebase Console for your UID

**Images not loading:**
- Verify image URLs are valid
- Check CORS settings
- Use Unsplash URLs

**AI plans not generating:**
- Add GEMINI_API_KEY to .env.local
- Verify API key is valid
- Check API quota

**Payment not working:**
- This is a simulation - no real money charged
- Enter format: 07XX XXX XXX for M-Pesa
- Orders still save to database

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+K` | Open search (not implemented yet) |
| `Esc` | Close modals |
| `Enter` | Submit forms |

## Performance Tips

- Use Unsplash for product images (free & fast)
- Keep descriptions concise
- Limit real-time listeners in Firestore
- Cache user preferences
- Optimize bundle size

## API Integrations

### Gemini AI (Workout Plans)
```typescript
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const response = await ai.models.generateContent({
  model: "gemini-3-flash-preview",
  contents: prompt
});
```

### Firebase Authentication
- Google OAuth implemented
- Custom claims for admin role
- Automatic profile creation

### Firestore Database
- Real-time synchronization
- Optimized queries with indexes
- Batch writes for performance

## Support & Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)

## Next Steps

1. ✅ Install and run locally
2. ✅ Add Firebase credentials
3. ✅ Create test admin user
4. ✅ Add sample products/programs
5. ✅ Test user flows
6. ✅ Deploy to Firebase Hosting
7. ✅ Monitor analytics

## Getting Help

**Documentation**: See `IMPLEMENTATION_GUIDE.md`
**Deployment**: See `DEPLOYMENT_CHECKLIST.md`
**Issues**: Check browser console and Firebase Console

---

**Ready to launch?** See `DEPLOYMENT_CHECKLIST.md` for production setup.
