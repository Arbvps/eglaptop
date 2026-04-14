# Firebase Setup & Configuration Guide for EgLaptop

## Table of Contents
1. [Firebase Project Setup](#firebase-project-setup)
2. [Environment Configuration](#environment-configuration)
3. [Database Schema](#database-schema)
4. [Security Rules](#security-rules)
5. [Service Configuration](#service-configuration)
6. [Verification & Testing](#verification--testing)

---

## Firebase Project Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Project name: `eglaptop-com`
4. Accept Firebase terms, continue
5. Disable Google Analytics (optional)
6. Click "Create project"

### Step 2: Register Web App
1. Click the web icon `</>` in the project overview
2. App name: `EgLaptop Web`
3. Check "Also set up Firebase Hosting"
4. Register app
5. Copy the Firebase config (you'll need this)

### Step 3: Enable Firestore Database
1. Go to "Firestore Database" in left menu
2. Click "Create database"
3. Start in production mode
4. Select region: `europe-west1` (closest to Egypt)
5. Enable Firestore

### Step 4: Enable Cloud Storage
1. Go to "Cloud Storage" in left menu
2. Click "Get started"
3. Create default bucket (use the suggested name)
4. Start in production mode
5. Set retention policy to 30 days for temp uploads

### Step 5: Enable Authentication
1. Go to "Authentication" in left menu
2. Click "Get started"
3. Enable providers:
   - Email/Password
   - Google
   - Phone (optional)

### Step 6: Enable Cloud Messaging (FCM)
1. Go to "Cloud Messaging" in left menu
2. Generate server key (if not auto-generated)
3. Save the server key and sender ID

---

## Environment Configuration

### Create `.env.local` (Development)
```bash
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAlGsidCDMkfRkBXtYKWsyBNNdUptxD_oI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=eglaptop-com.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://eglaptop-com-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=eglaptop-com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=eglaptop-com.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=43028466863
NEXT_PUBLIC_FIREBASE_APP_ID=1:43028466863:web:40f664a9260d4043db985a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-BQ0SW31MGS
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Create `.env.production` (Vercel)
Same as above but with production URLs:
```bash
NEXT_PUBLIC_APP_URL=https://eglaptop.com
```

### Generate VAPID Key for FCM
```bash
# Using Node.js (run locally, not in production)
node -e "const admin = require('firebase-admin'); const messaging = admin.messaging(); messaging.getVapidKey().then(key => console.log('VAPID Key:', key));"
```

Or generate through Firebase Console:
1. Go to Cloud Messaging settings
2. Generate new web push certificate
3. Copy the public key

---

## Database Schema

### Collections to Create

#### 1. `users/` Collection
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string (optional),
  phone: string (optional),
  role: 'user' | 'admin',
  createdAt: timestamp,
  preferences: {
    newsletter: boolean,
    notifications: boolean,
  },
  lastLogin: timestamp
}
```

#### 2. `products/` Collection
```javascript
{
  id: string,
  name: string,
  description: string,
  price: number,
  category: 'Professional' | 'Gaming' | 'Business' | 'Student',
  specs: {
    processor: string,
    ram: string,
    storage: string,
    // ... more specs
  },
  images: string[], // URLs from Cloud Storage
  stock: number,
  rating: number (0-5),
  reviewCount: number,
  createdAt: timestamp,
  updatedAt: timestamp,
  published: boolean
}
```

#### 3. `orders/` Collection
```javascript
{
  id: string,
  userId: string,
  items: [
    {
      productId: string,
      name: string,
      price: number,
      quantity: number
    }
  ],
  totalPrice: number,
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  shippingAddress: {
    fullName: string,
    email: string,
    phone: string,
    address: string,
    city: string,
    postalCode: string
  },
  paymentStatus: 'pending' | 'completed' | 'failed',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 4. `reviews/` Collection
```javascript
{
  id: string,
  userId: string,
  userName: string,
  productId: string,
  rating: number (1-5),
  comment: string,
  createdAt: timestamp,
  helpful: number,
  verified: boolean
}
```

#### 5. `messages/` Collection (Contact Form)
```javascript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string,
  createdAt: timestamp,
  status: 'new' | 'read' | 'responded',
  response: string (optional)
}
```

#### 6. `fcm_tokens/` Collection
```javascript
{
  userId: string,
  token: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  browser: string,
  platform: string
}
```

---

## Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Default: deny all
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Users: read own, write own
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Products: public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
      allow create: if isAdmin();
      allow delete: if isAdmin();
      
      // Reviews subcollection
      match /reviews/{reviewId} {
        allow read: if true;
        allow create: if isLoggedIn() && request.auth.uid == request.resource.data.userId;
        allow update: if isLoggedIn() && request.auth.uid == resource.data.userId;
        allow delete: if isLoggedIn() && request.auth.uid == resource.data.userId || isAdmin();
      }
    }
    
    // Orders: user read/write own, admin read all
    match /orders/{orderId} {
      allow read: if isLoggedIn() && (
        request.auth.uid == resource.data.userId || 
        isAdmin()
      );
      allow create: if isLoggedIn() && request.auth.uid == request.resource.data.userId;
      allow update: if isLoggedIn() && (
        request.auth.uid == resource.data.userId || 
        isAdmin()
      );
      allow delete: if isAdmin();
    }
    
    // Reviews: public read, user create own
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isLoggedIn();
      allow update: if isLoggedIn() && request.auth.uid == resource.data.userId;
      allow delete: if isLoggedIn() && request.auth.uid == resource.data.userId || isAdmin();
    }
    
    // Messages: anyone create, admin read
    match /messages/{messageId} {
      allow create: if validateContactForm(request.resource.data);
      allow read, write: if isAdmin();
    }
    
    // FCM Tokens: user read/write own
    match /fcm_tokens/{tokenId} {
      allow read, write: if isLoggedIn() && request.auth.uid == resource.data.userId;
    }
    
    // Admin collection
    match /admin/{document=**} {
      allow read, write: if isAdmin();
    }
    
    // Helper functions
    function isLoggedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isLoggedIn() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function validateContactForm(data) {
      return data.name is string && data.name.size() > 0 &&
        data.email is string && data.email.matches('.*@.*\\..*') &&
        data.phone is string && data.phone.size() > 0 &&
        data.message is string && data.message.size() > 10 &&
        data.message.size() <= 5000;
    }
  }
}
```

### Cloud Storage Security Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Default: deny all
    match /{allPaths=**} {
      allow read, write: if false;
    }
    
    // Public product images
    match /products/{productId}/{fileName} {
      allow read: if true;
      allow write: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // User avatars
    match /users/{userId}/{fileName} {
      allow read: if true;
      allow write: if isLoggedIn() && request.auth.uid == userId;
      allow delete: if isLoggedIn() && request.auth.uid == userId;
    }
    
    // Temporary uploads (auto-cleanup after 24h)
    match /temp/{fileName} {
      allow write: if isLoggedIn() && request.resource.size < 10 * 1024 * 1024; // 10MB
      allow read: if isLoggedIn();
    }
    
    function isLoggedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isLoggedIn();
      // Add more sophisticated admin check if needed
    }
  }
}
```

---

## Service Configuration

### Create Service Account Key (for server-side operations)
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Encode it to base64:
```bash
cat path/to/service-account-key.json | base64
```
5. Add to `.env.local`:
```
FIREBASE_SERVICE_ACCOUNT_KEY=<base64-encoded-key>
```

### Configure Firestore Indexes
1. Go to Firestore Database → Indexes
2. Create composite indexes:
   - `products` → `category` (Asc) + `stock` (Desc)
   - `orders` → `userId` (Asc) + `createdAt` (Desc)
   - `reviews` → `productId` (Asc) + `rating` (Desc)

### Email Configuration
1. Go to Authentication → Email Templates
2. Customize:
   - Email Verification
   - Password Reset
   - Email Change
   - SMS (if using phone auth)

---

## Verification & Testing

### Local Testing
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Visit http://localhost:3000
```

### Test Checklist
- [ ] User can sign up with email
- [ ] User can sign in with Google
- [ ] Products load on `/products`
- [ ] User can view product details
- [ ] Admin can add/edit products on `/admin/products`
- [ ] Contact form submits successfully
- [ ] Authentication persists on page reload
- [ ] Logout works correctly

### Monitor in Firebase Console
1. **Firestore**: Monitor read/write operations
2. **Authentication**: Check user sign-ups
3. **Cloud Storage**: Verify file uploads
4. **Realtime Database**: Monitor activity
5. **Cloud Functions**: Check logs (if using)

---

## Common Issues & Solutions

### Issue: "Missing or insufficient permissions"
**Solution**: Check Firestore security rules and ensure user is authenticated

### Issue: "Firebase not initialized"
**Solution**: Ensure environment variables are set correctly in `.env.local`

### Issue: "Storage bucket not found"
**Solution**: Verify storage bucket name in Firebase config

### Issue: "CORS error when uploading files"
**Solution**: Configure CORS in Cloud Storage settings

```bash
# Create cors.json
cat > cors.json << EOF
[
  {
    "origin": ["https://eglaptop.com", "http://localhost:3000"],
    "method": ["GET", "HEAD", "DELETE", "PUT", "POST"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Apply CORS config (requires gcloud)
gsutil cors set cors.json gs://eglaptop-com.firebasestorage.app
```

---

## Performance Optimization

### Enable Firestore Caching
```typescript
// Automatically done in config.ts for client SDK
```

### Optimize Query Performance
- Create composite indexes for common filters
- Limit collection reads to necessary fields
- Use pagination for large datasets
- Cache frequently accessed data

### Cloud Storage Optimization
- Compress images before upload
- Use appropriate image formats (WebP, JPEG)
- Implement CDN caching (Cloudflare, Firebase Hosting)
- Set appropriate cache headers

---

## Privacy & Compliance

### GDPR Compliance
1. **Data Collection**: Only collect necessary data
2. **User Rights**: Implement data export/deletion endpoints
3. **Consent**: Request explicit consent for analytics
4. **Privacy Policy**: Create and link privacy policy

### Data Retention
- Delete old messages after 90 days
- Archive old orders after 1 year
- Clean up temp files daily

### Encryption
- Firebase handles encryption at rest
- Use HTTPS for all communications
- Don't store sensitive data (passwords, payment info)

---

## Next Steps
1. Set up Vercel deployment
2. Configure custom domain
3. Set up automated backups
4. Implement monitoring and alerts
5. Create admin dashboard
6. Set up payment processing (if needed)
