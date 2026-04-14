# Firebase Setup Checklist - EgLaptop

Use this checklist to ensure complete Firebase implementation and deployment.

---

## 📋 Phase 1: Firebase Project Setup

### Create Firebase Project
- [ ] Go to Firebase Console (console.firebase.google.com)
- [ ] Click "Create a project"
- [ ] Project name: `eglaptop-com`
- [ ] Accept Firebase terms
- [ ] Click "Create project"
- [ ] Wait for project creation (2-3 min)

### Register Web App
- [ ] Click the web icon `</>`
- [ ] App name: `EgLaptop Web`
- [ ] Check "Also set up Firebase Hosting"
- [ ] Click "Register app"
- [ ] Copy Firebase config object
- [ ] Save config for later use

---

## 🔐 Phase 2: Enable Firebase Services

### Firestore Database
- [ ] Go to "Firestore Database" menu
- [ ] Click "Create Database"
- [ ] Select "Start in production mode"
- [ ] Choose region: `europe-west1` (closest to Egypt)
- [ ] Click "Create"
- [ ] Wait for database creation

### Cloud Storage
- [ ] Go to "Cloud Storage" menu
- [ ] Click "Get started"
- [ ] Use default bucket name
- [ ] Select "Start in production mode"
- [ ] Click "Create"
- [ ] Configure CORS (if needed)

### Authentication
- [ ] Go to "Authentication" menu
- [ ] Click "Get started"
- [ ] Click "Email/Password" → Enable → Save
- [ ] Click "Google" → Enable
  - [ ] Add project name
  - [ ] Add support email
  - [ ] Save
- [ ] Click "Phone" → Enable (optional)
  - [ ] Add phone numbers for testing
  - [ ] Save

### Cloud Messaging
- [ ] Go to "Cloud Messaging" menu
- [ ] Copy "Sender ID" (for FCM setup)
- [ ] Generate web push certificate
- [ ] Copy public key (VAPID key)

---

## 🔑 Phase 3: Generate Credentials

### Service Account Key
- [ ] Go to Project Settings (gear icon)
- [ ] Click "Service Accounts" tab
- [ ] Click "Generate new private key"
- [ ] Save JSON file securely
- [ ] Run: `cat service-account-key.json | base64`
- [ ] Copy base64 output for `.env.local`

### API Keys
- [ ] Still in Project Settings
- [ ] Go to "API keys" section
- [ ] Note the API key (for public use)
- [ ] Copy all credential values

---

## 🔒 Phase 4: Deploy Security Rules

### Firestore Security Rules
- [ ] Go to Firestore Database → Rules
- [ ] Click "Edit Rules"
- [ ] Paste rules from [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#firestore-security-rules)
- [ ] Click "Publish"
- [ ] Wait for deployment

### Cloud Storage Rules
- [ ] Go to Cloud Storage → Rules
- [ ] Click "Edit Rules"
- [ ] Paste rules from [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#cloud-storage-security-rules)
- [ ] Click "Publish"
- [ ] Wait for deployment

### Verify Rules
- [ ] Check for no errors in console
- [ ] Test with Firestore Emulator (local)
- [ ] Create test document (verify denied)
- [ ] Test with authenticated user
- [ ] Test with admin user

---

## 🗂️ Phase 5: Setup Database Collections

### Create Collections in Firestore
- [ ] Collection: `users`
  - [ ] Document structure set
  - [ ] Sample document added
  
- [ ] Collection: `products`
  - [ ] Document structure set
  - [ ] Sample products added
  
- [ ] Collection: `orders`
  - [ ] Document structure set
  
- [ ] Collection: `reviews`
  - [ ] Document structure set
  
- [ ] Collection: `messages`
  - [ ] Document structure set
  
- [ ] Collection: `fcm_tokens`
  - [ ] Document structure set

### Create Composite Indexes
- [ ] Index: `products` (category Asc + stock Desc)
- [ ] Index: `orders` (userId Asc + createdAt Desc)
- [ ] Index: `reviews` (productId Asc + rating Desc)
- [ ] Index: `messages` (createdAt Desc + status Asc)

---

## 🌐 Phase 6: Configure Local Development

### Setup Environment File
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add Firebase config values:
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### Verify Environment Setup
- [ ] All required variables set
- [ ] No variables left as placeholder
- [ ] File permissions correct (not in git)
- [ ] Test by starting dev server

---

## 🧪 Phase 7: Local Testing

### Install Dependencies
- [ ] Run `npm install`
- [ ] All dependencies installed
- [ ] No peer dependency warnings

### Start Development Server
- [ ] Run `npm run dev`
- [ ] Server starts on `http://localhost:3000`
- [ ] No build errors

### Test Authentication
- [ ] Navigate to `/signup`
- [ ] Create new account with email
- [ ] Verify user in Firebase Auth console
- [ ] Logout
- [ ] Login with email/password
- [ ] Navigate to `/login`
- [ ] Test Google login (if configured)
- [ ] Verify user in Firestore

### Test Firestore
- [ ] Create product from `/admin/products`
- [ ] Check product in Firestore console
- [ ] View product on `/products`
- [ ] Delete product from admin
- [ ] Verify deletion in Firestore

### Test Cloud Storage
- [ ] Upload image via product form
- [ ] Check file in Cloud Storage console
- [ ] Verify image displays on product page
- [ ] Delete image

### Test Analytics
- [ ] Check browser console (no errors)
- [ ] Navigate between pages
- [ ] Check Firebase Analytics dashboard
- [ ] Verify events are logged

### Test Contact Form
- [ ] Fill contact form
- [ ] Submit
- [ ] Check `messages` collection in Firestore
- [ ] Verify message content

---

## 🚀 Phase 8: Prepare for Production

### Git Setup
- [ ] Initialize git repo (if not already)
- [ ] Add `.env.local` to `.gitignore`
- [ ] Commit all code
- [ ] Push to GitHub with SSH

### GitHub Configuration
- [ ] Create repository on GitHub
- [ ] Push with SSH: `git push origin main`
- [ ] Verify code on GitHub
- [ ] SSH connection working

### Vercel Account
- [ ] Create Vercel account
- [ ] Connect GitHub account
- [ ] Authorize Vercel access

---

## 🌐 Phase 9: Deploy to Vercel

### Import Project
- [ ] Go to Vercel Dashboard
- [ ] Click "Add New Project"
- [ ] Click "Import Git Repository"
- [ ] Search for repository
- [ ] Click "Import"

### Configure Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:
- [ ] Add all `NEXT_PUBLIC_` variables
- [ ] Add `FIREBASE_SERVICE_ACCOUNT_KEY`
- [ ] Select Production environment
- [ ] Save variables

### Build & Deploy
- [ ] Vercel automatically starts build
- [ ] Check build logs for errors
- [ ] Wait for deployment to complete
- [ ] Click "Visit" to see deployed app

### Verify Deployment
- [ ] Home page loads
- [ ] Can sign up
- [ ] Can login
- [ ] Products page works
- [ ] Contact form works
- [ ] Admin dashboard accessible

---

## 🔗 Phase 10: Configure Custom Domain

### Add Domain
- [ ] Go to Vercel Project → Settings → Domains
- [ ] Click "Add Domain"
- [ ] Enter domain: `eglaptop.com`
- [ ] Choose DNS provider

### Update DNS Records
- [ ] Go to DNS provider settings
- [ ] Add Vercel DNS records:
  - [ ] Type: CNAME, Name: www, Value: cname.vercel.com
  - [ ] Type: A, Name: @, Value: 76.76.19.0 (or provided)
- [ ] Wait for DNS propagation (5-48 hours)
- [ ] Verify domain working

### Enable HTTPS
- [ ] Vercel automatically sets up SSL
- [ ] Check certificate issued
- [ ] Force HTTPS redirect enabled

---

## 📊 Phase 11: Production Verification

### Security Checklist
- [ ] HTTPS enabled and enforced
- [ ] Firestore rules working correctly
- [ ] Storage rules working correctly
- [ ] No sensitive data in code
- [ ] Environment variables properly configured
- [ ] API keys restricted to domains
- [ ] Backup strategy documented

### Performance Checklist
- [ ] Lighthouse score > 80
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 4s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Database queries optimized
- [ ] Images compressed

### Functionality Checklist
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Product CRUD works
- [ ] Contact form works
- [ ] Analytics tracking works
- [ ] Notifications working (if implemented)
- [ ] No console errors
- [ ] Mobile responsive

---

## 📈 Phase 12: Monitoring & Maintenance

### Set Up Monitoring
- [ ] Firebase Performance Monitoring enabled
- [ ] Error tracking enabled (optional: Sentry)
- [ ] Analytics dashboard configured
- [ ] Alerts configured:
  - [ ] Deployment alerts
  - [ ] Error rate alerts
  - [ ] Performance alerts

### Configure Backups
- [ ] Firebase automatic backups enabled
- [ ] Manual backup schedule:
  - [ ] Weekly Firestore export
  - [ ] Monthly full backup
- [ ] Backup location documented

### Regular Tasks
- [ ] Daily: Check Firebase console
- [ ] Weekly: Review error logs
- [ ] Monthly: Check storage usage
- [ ] Quarterly: Update dependencies
- [ ] Semi-annually: Security audit

---

## 📝 Phase 13: Documentation

### Create Internal Documentation
- [ ] Database schema documented
- [ ] API endpoints documented
- [ ] Deployment procedure documented
- [ ] Emergency procedures documented
- [ ] Team member access documented

### Update Project Documentation
- [ ] README.md updated
- [ ] FIREBASE_SETUP.md reviewed
- [ ] SSH_DEPLOYMENT.md reviewed
- [ ] QUICKSTART.md reviewed
- [ ] FIREBASE_IMPLEMENTATION.md reviewed

### Training
- [ ] New developer setup guide
- [ ] Admin dashboard guide
- [ ] Product management guide
- [ ] Troubleshooting guide
- [ ] FAQ document

---

## 🎯 Phase 14: Launch Preparation

### Pre-Launch (1 week before)
- [ ] All tests passed
- [ ] Security audit complete
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] Team training complete
- [ ] Support process defined
- [ ] Backup verified
- [ ] Monitoring alerts tested

### Launch Day
- [ ] Final backup taken
- [ ] Team on standby
- [ ] Customer support ready
- [ ] Social media posts scheduled
- [ ] Email notifications prepared
- [ ] Analytics checked
- [ ] Logs monitored

### Post-Launch (1 week after)
- [ ] Monitor error rates
- [ ] Check analytics
- [ ] Gather feedback
- [ ] Fix any issues
- [ ] Optimize performance
- [ ] Document lessons learned

---

## ✅ Final Verification

Before declaring complete:

### Code Quality
- [ ] No console errors
- [ ] No warnings in build
- [ ] Linting passes (`npm run lint`)
- [ ] All types correct
- [ ] Comments clear

### Functionality
- [ ] All features working
- [ ] All forms validating
- [ ] All routes accessible
- [ ] Mobile responsive
- [ ] Accessibility compliant

### Security
- [ ] No sensitive data exposed
- [ ] Rules properly enforced
- [ ] Environment variables secure
- [ ] HTTPS enabled
- [ ] CORS configured

### Performance
- [ ] Page load < 3 seconds
- [ ] Database queries fast
- [ ] Images optimized
- [ ] Bundle size acceptable
- [ ] No memory leaks

### Documentation
- [ ] README complete
- [ ] Setup guides clear
- [ ] API documented
- [ ] Deployment guide tested
- [ ] FAQ comprehensive

---

## 🎉 Launch Status

### When All Boxes Checked ✅
- [ ] Project is PRODUCTION READY
- [ ] Ready for customer launch
- [ ] Ready for marketing announcement
- [ ] Ready for team handoff
- [ ] Ready for ongoing maintenance

### Next Phase
- [ ] Monitor production
- [ ] Gather user feedback
- [ ] Plan feature improvements
- [ ] Scale infrastructure
- [ ] Expand product offerings

---

## 📞 Support Contacts

**Technical Support:**
- Firebase: firebase.google.com/support
- Vercel: vercel.com/help
- Next.js: github.com/vercel/next.js/discussions

**EgLaptop Contacts:**
- Email: contact@eglaptop.com
- Phone: 01145457535, 01044045500
- WhatsApp: 01027830290
- Address: مول البستان - الدور الثالث - باب اللوق - القاهرة

---

## 📅 Completion Date

**Started**: _________________
**Completed**: _________________
**Deployed**: _________________
**Launched**: _________________

---

## 👥 Team Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Lead Dev | | | |
| Manager | | | |

---

**Good luck with EgLaptop! 🚀**

If you have questions, refer to:
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- [SSH_DEPLOYMENT.md](./SSH_DEPLOYMENT.md)
- [QUICKSTART.md](./QUICKSTART.md)
- [README.md](./README.md)
