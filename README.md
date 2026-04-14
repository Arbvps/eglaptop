# EgLaptop - Firebase-Powered E-Commerce Platform

## 📱 About EgLaptop

EgLaptop is a modern e-commerce platform for high-performance laptops and computers. Built with Next.js and Firebase, it provides a seamless shopping experience with advanced features like real-time inventory, user authentication, admin dashboard, and cloud storage for product images.

**الوصف بالعربية:**
EgLaptop مركز ابتكار وتجهيز العتاد الرقمي الفائق. نوفر أحدث الأجهزة بمختلف الفئات (Professional, Gaming, Business, Student) مع ضمان الأداء والأمان.

---

## 🚀 Key Features

- **User Authentication**: Email/password, Google OAuth, Phone authentication
- **Product Catalog**: Browse products by category with filters and search
- **Admin Dashboard**: Full product management with create/edit/delete
- **Real-time Database**: Firestore for instant data synchronization
- **Cloud Storage**: Product images stored in Firebase Cloud Storage
- **Push Notifications**: FCM for order updates and alerts
- **Analytics**: Track user behavior and engagement
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Multi-language**: RTL support for Arabic

---

## 📋 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Storage, Cloud Messaging)
- **Hosting**: Vercel
- **Package Manager**: npm

### Dependencies
```json
{
  "firebase": "^10.0.0",
  "react-hook-form": "^7.54.1",
  "zod": "^3.24.1",
  "recharts": "^2.15.0",
  "next-themes": "^0.4.6",
  "swr": "^2.4.1"
}
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ (with npm)
- Firebase account (free tier works)
- Git SSH configured (see [SSH_DEPLOYMENT.md](./SSH_DEPLOYMENT.md))

### 1. Clone Repository
```bash
# Clone with SSH (recommended)
git clone git@github.com:Arbvps/eglaptop.git
cd eglaptop

# Or clone with HTTPS
git clone https://github.com/Arbvps/eglaptop.git
cd eglaptop
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Firebase Project
Follow the [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) guide:
1. Create Firebase project
2. Enable Firestore, Storage, Authentication, Cloud Messaging
3. Create service account key
4. Set up security rules

### 4. Configure Environment Variables
```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your Firebase credentials
nano .env.local
```

Add your Firebase config from the Firebase Console:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
# ... (see .env.example for all variables)
```

### 5. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000 to see your app!

---

## 📁 Project Structure

```
eglaptop/
├── app/                          # Next.js app directory
│   ├── (public)/                 # Public pages
│   │   ├── page.tsx              # Home page
│   │   ├── products/
│   │   │   ├── page.tsx          # Products listing
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Product detail
│   │   └── contact/page.tsx      # Contact form
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/              # User dashboard
│   │   ├── page.tsx              # Dashboard home
│   │   ├── orders/page.tsx
│   │   ├── wishlist/page.tsx
│   │   └── admin/
│   │       ├── products/page.tsx # Product management
│   │       ├── orders/page.tsx   # Order management
│   │       └── analytics/page.tsx
│   ├── api/                      # API routes
│   │   └── firebase/
│   │       └── store-fcm-token/route.ts
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── lib/
│   ├── firebase/
│   │   ├── config.ts             # Firebase initialization
│   │   ├── auth.ts               # Authentication utilities
│   │   ├── database.ts           # Firestore utilities
│   │   ├── storage.ts            # Cloud Storage utilities
│   │   ├── messaging.ts          # FCM utilities
│   │   └── analytics.ts          # Analytics utilities
│   ├── hooks/
│   │   ├── useAuth.ts            # Auth state hook
│   │   └── useFirestore.ts       # Firestore data hook
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Utility functions
├── components/
│   ├── navbar.tsx                # Navigation component
│   ├── footer.tsx                # Footer component
│   └── ui/                       # shadcn/ui components
├── public/
│   └── images/                   # Static images
├── FIREBASE_SETUP.md             # Firebase configuration guide
├── SSH_DEPLOYMENT.md             # SSH & Vercel deployment guide
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## 🔧 Configuration

### Firebase Setup
See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions on:
- Creating Firebase project
- Setting up Firestore database
- Configuring authentication
- Setting up Cloud Storage
- Configuring FCM for push notifications
- Security rules configuration

### SSH & Deployment
See [SSH_DEPLOYMENT.md](./SSH_DEPLOYMENT.md) for:
- Generating SSH keys
- GitHub SSH configuration
- Vercel deployment setup
- Custom domain configuration
- Automated deployments with GitHub Actions

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Push to GitHub (automatically deploys)
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

**Manual Deployment:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Select your GitHub repository
4. Add environment variables
5. Click "Deploy"

### Production Checklist
Before deploying:
- [ ] All Firebase credentials configured
- [ ] Security rules deployed
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured
- [ ] HTTPS enabled
- [ ] Analytics tracking verified
- [ ] Error monitoring set up

See [SSH_DEPLOYMENT.md](./SSH_DEPLOYMENT.md) for full deployment guide.

---

## 📱 API Routes

### Firebase
- `POST /api/firebase/store-fcm-token` - Store FCM token for user

### Authentication
- Email/Password: Built-in Firebase
- Google OAuth: Firebase provider
- Phone: Firebase provider

---

## 🔐 Security

### Firestore Security Rules
- User data: Private to each user
- Products: Public read, admin write only
- Orders: Private to order owner
- Reviews: Public read, authenticated write

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#security-rules) for full rules.

### Best Practices
- Never commit sensitive keys to Git
- Use environment variables for all secrets
- Enable HTTPS (automatic with Vercel)
- Implement rate limiting on APIs
- Validate all user input
- Use strong passwords
- Keep dependencies updated

---

## 📊 Database Schema

### Collections
- **users/**: User profiles and preferences
- **products/**: Product catalog with images and specs
- **orders/**: Customer orders and status
- **reviews/**: Product reviews and ratings
- **messages/**: Contact form submissions
- **fcm_tokens/**: Push notification tokens

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#database-schema) for detailed schema.

---

## 🧪 Testing

### Local Testing
```bash
# Start development server
npm run dev

# Run tests (if configured)
npm test

# Run linter
npm run lint
```

### Test Checklist
- [ ] Sign up with email
- [ ] Sign in with Google
- [ ] Browse products
- [ ] Filter by category
- [ ] Search products
- [ ] View product details
- [ ] Add to wishlist
- [ ] Proceed to checkout
- [ ] Admin: Add product
- [ ] Admin: Edit product
- [ ] Admin: Delete product
- [ ] Submit contact form
- [ ] Reset password
- [ ] Logout

---

## 🐛 Troubleshooting

### Firebase Not Initialized
**Error**: "Firebase not initialized"
```
Solution:
1. Check .env.local has all required variables
2. Restart dev server: npm run dev
3. Check browser console for specific error
```

### Authentication Not Working
**Error**: "Permission denied"
```
Solution:
1. Verify Firebase security rules
2. Check user authentication status
3. Clear browser cache and cookies
```

### Image Upload Failed
**Error**: "Storage bucket not found"
```
Solution:
1. Verify storage bucket name in .env.local
2. Check Cloud Storage CORS configuration
3. Ensure file size < 5MB
```

### Deployment Failed
**Error**: Build failed in Vercel
```
Solution:
1. Check Vercel build logs
2. Verify all environment variables
3. Ensure Next.js is compatible
4. Check for circular imports
```

See detailed troubleshooting in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#common-issues--solutions).

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase SDK v9+ Modular](https://firebase.google.com/docs/reference/js/v9)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [React Firebase Hooks](https://react-firebase-hooks.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel Deployment](https://vercel.com/docs)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/awesome-feature`
2. Commit changes: `git commit -m "Add awesome feature"`
3. Push to branch: `git push origin feature/awesome-feature`
4. Open Pull Request

---

## 📞 Contact & Support

**EgLaptop Contact Information:**
- 📍 Address: مول البستان - الدور الثالث - باب اللوق - القاهرة
- 📞 Phone: 01145457535, 01044045500
- 💬 WhatsApp: 01027830290
- 📧 Email: contact@eglaptop.com

---

## 📄 License

This project is proprietary. All rights reserved © 2024 EgLaptop.

---

## 🎯 Roadmap

- [ ] Payment integration (Stripe/Payfort)
- [ ] Wishlist functionality
- [ ] Product recommendations
- [ ] Customer reviews & ratings
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Order tracking
- [ ] User profile management
- [ ] Analytics dashboard
- [ ] Inventory management
- [ ] Multi-language support

---

## 🙏 Acknowledgments

- Firebase for powerful backend services
- Vercel for seamless deployment
- Next.js team for incredible framework
- Tailwind CSS for beautiful styling
- Our customers for the opportunity to serve

---

**Happy coding! 🚀**

For detailed setup instructions, see:
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase configuration
- [SSH_DEPLOYMENT.md](./SSH_DEPLOYMENT.md) - SSH & Vercel deployment
