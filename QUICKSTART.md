# Firebase EgLaptop - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Firebase account (free tier)
- GitHub account with SSH configured
- Vercel account

---

## Step 1: Setup Local Development (2 min)

```bash
# Clone the repository
git clone git@github.com:Arbvps/eglaptop.git
cd eglaptop

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

---

## Step 2: Configure Firebase (2 min)

### Get Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: `eglaptop-com`
3. Register web app
4. Copy the configuration object

### Fill `.env.local`
Edit `.env.local` with your Firebase credentials:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Enable Firebase Services
In Firebase Console:
1. **Firestore Database** → Create Database → Start in production mode → Select region `europe-west1`
2. **Cloud Storage** → Create Bucket → Use default settings
3. **Authentication** → Enable Email/Password, Google, Phone
4. **Cloud Messaging** → Copy VAPID key → Add to `.env.local`

---

## Step 3: Deploy Security Rules (1 min)

### Deploy Firestore Rules
1. In Firebase Console → Firestore → Rules
2. Paste rules from [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#firestore-security-rules)
3. Click Publish

### Deploy Storage Rules
1. In Firebase Console → Storage → Rules
2. Paste rules from [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#cloud-storage-security-rules)
3. Click Publish

---

## Step 4: Run Locally (1 min)

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
```

### Test the App
- ✅ Visit home page
- ✅ Sign up with email
- ✅ Sign in with Google
- ✅ Browse products (empty initially)
- ✅ Submit contact form
- ✅ Access dashboard

---

## Step 5: Deploy to Vercel (Optional - 2 min setup, auto-deploy on push)

### Connect to Vercel
1. Go to [Vercel](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repo
4. Click Import

### Add Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_DATABASE_URL
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_FIREBASE_VAPID_KEY
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Deploy
```bash
# Just push to GitHub
git add .
git commit -m "Configure Firebase"
git push origin main

# Vercel automatically deploys!
```

---

## 📊 Add Sample Data

### Create Sample Products
```bash
# In Firebase Console → Firestore → Collections
# Click "Start collection" → products

# Add document:
{
  "id": "laptop-1",
  "name": "Dell XPS 15",
  "description": "Professional laptop with powerful specs",
  "price": 15000,
  "category": "Professional",
  "stock": 5,
  "rating": 4.5,
  "specs": {
    "processor": "Intel i7",
    "ram": "16GB",
    "storage": "512GB SSD"
  },
  "images": [],
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

### Create Admin User
```bash
# In Firebase Auth → Create user
# Email: admin@eglaptop.com
# Password: secure-password

# In Firestore → users → {uid}
{
  "email": "admin@eglaptop.com",
  "displayName": "Admin",
  "role": "admin",
  "createdAt": timestamp
}
```

---

## 🔑 Key Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm start              # Run production build

# Linting
npm run lint           # Check code

# Firebase CLI (optional)
firebase deploy        # Deploy rules
firebase emulators:start  # Run local emulator
```

---

## 📁 Project Structure

```
eglaptop/
├── app/               # Pages and routes
│   ├── (public)/      # Public pages
│   ├── (auth)/        # Auth pages
│   └── (dashboard)/   # User dashboard
├── lib/
│   ├── firebase/      # Firebase services
│   ├── hooks/         # React hooks
│   └── types.ts       # TypeScript types
├── components/        # React components
├── public/            # Static files
└── docs/              # Documentation
```

---

## 🐛 Quick Troubleshooting

### "Firebase not initialized"
```bash
# Check .env.local has all required variables
# Restart dev server: npm run dev
# Check browser console for specific error
```

### "Permission denied" on Firestore
```bash
# Check security rules are deployed
# Verify user is authenticated
# Check rule syntax in Firebase Console
```

### Images not uploading
```bash
# Check Cloud Storage bucket name
# Verify CORS configuration
# Check file size < 5MB
```

### App not loading
```bash
# Clear browser cache and cookies
# Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)
# Check browser console for errors
```

---

## 📚 Detailed Guides

For more detailed information:

- **Firebase Setup**: See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- **Deployment**: See [SSH_DEPLOYMENT.md](./SSH_DEPLOYMENT.md)
- **Project Overview**: See [README.md](./README.md)
- **Implementation Details**: See [FIREBASE_IMPLEMENTATION.md](./FIREBASE_IMPLEMENTATION.md)

---

## ✨ Next Steps

After getting started:

1. **Customize branding**
   - Update colors in components
   - Add company logo
   - Modify theme

2. **Add products**
   - Create products via admin dashboard
   - Upload product images
   - Set categories and specs

3. **Configure email**
   - Setup email service for confirmations
   - Email on order placed
   - Password reset emails

4. **Setup payments**
   - Integrate Stripe or Payfort
   - Configure checkout flow
   - Test payment processing

5. **Deploy to production**
   - Configure custom domain
   - Setup SSL certificates
   - Enable analytics

---

## 📞 Need Help?

- **Firebase Issues**: Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#common-issues--solutions)
- **Deployment Issues**: Check [SSH_DEPLOYMENT.md](./SSH_DEPLOYMENT.md#troubleshooting)
- **Code Issues**: Check documentation comments in files
- **Contact EgLaptop**: 
  - 📞 01145457535
  - 💬 WhatsApp: 01027830290
  - 📧 contact@eglaptop.com

---

## 🎯 Success Checklist

- [ ] Local development running
- [ ] Can sign up and login
- [ ] Firebase console shows data
- [ ] Contact form submits
- [ ] Admin dashboard accessible
- [ ] Deployed to Vercel
- [ ] Custom domain configured
- [ ] Analytics tracking working

---

## 🎉 You're Ready!

Your Firebase EgLaptop platform is now running. Start by:

1. Adding sample products
2. Creating an admin account
3. Testing the admin dashboard
4. Configuring email notifications
5. Setting up payment processing

**Happy coding! 🚀**

Need the detailed setup? Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
