# SSH Setup & Vercel Deployment Guide

## Table of Contents
1. [SSH Key Generation](#ssh-key-generation)
2. [GitHub SSH Configuration](#github-ssh-configuration)
3. [Vercel Setup & Deployment](#vercel-setup--deployment)
4. [Automated Deployments](#automated-deployments)
5. [Production Checklist](#production-checklist)

---

## SSH Key Generation

### Step 1: Generate SSH Key Pair
```bash
# Generate ED25519 key (recommended - more secure, smaller)
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/eglaptop_key

# OR generate RSA key (if ED25519 not available)
ssh-keygen -t rsa -b 4096 -C "your-email@example.com" -f ~/.ssh/eglaptop_key

# When prompted for passphrase:
# Enter a secure passphrase (recommended for security)
# Re-enter the passphrase
```

Output:
```
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/user/.ssh/eglaptop_key): 
Enter passphrase (empty for no passphrase): [Enter passphrase]
Enter same passphrase again: [Enter passphrase]
```

### Step 2: Verify Key Generation
```bash
# List SSH keys
ls -la ~/.ssh/

# Should see:
# eglaptop_key (private key)
# eglaptop_key.pub (public key)

# Check key format
cat ~/.ssh/eglaptop_key.pub
# Should start with: ssh-ed25519 or ssh-rsa
```

### Step 3: Add Key to SSH Agent
```bash
# Start SSH agent
eval "$(ssh-agent -s)"
# Output: Agent pid XXXXX

# Add key to agent
ssh-add ~/.ssh/eglaptop_key

# Verify key was added
ssh-add -l
```

---

## GitHub SSH Configuration

### Step 1: Add Public Key to GitHub
1. Copy your public key:
```bash
cat ~/.ssh/eglaptop_key.pub
# Copies to clipboard (macOS):
pbcopy < ~/.ssh/eglaptop_key.pub
# Copies to clipboard (Linux):
xclip -selection clipboard < ~/.ssh/eglaptop_key.pub
```

2. Go to GitHub Settings:
   - Visit: https://github.com/settings/keys
   - Click "New SSH key"
   - Title: `EgLaptop Dev Machine`
   - Key type: `Authentication Key`
   - Paste your public key
   - Click "Add SSH key"

### Step 2: Configure SSH for GitHub
Create `~/.ssh/config`:
```bash
cat >> ~/.ssh/config << EOF
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/eglaptop_key
    AddKeysToAgent yes
    IdentitiesOnly yes
EOF
```

Set permissions:
```bash
chmod 600 ~/.ssh/config
```

### Step 3: Test GitHub SSH Connection
```bash
# Test SSH connection
ssh -T git@github.com

# Expected output:
# Hi [your-github-username]! You've successfully authenticated,
# but GitHub does not provide shell access.
```

### Step 4: Update Git to Use SSH
```bash
# Go to your project directory
cd /path/to/eglaptop-project

# If using HTTPS, change to SSH
git remote set-url origin git@github.com:Arbvps/eglaptop.git

# Verify remote
git remote -v
# Should show:
# origin  git@github.com:Arbvps/eglaptop.git (fetch)
# origin  git@github.com:Arbvps/eglaptop.git (push)
```

---

## Vercel Setup & Deployment

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Grant Vercel access to your GitHub account

### Step 2: Connect GitHub Repository
1. Go to Vercel Dashboard
2. Click "New Project"
3. Select "Import Git Repository"
4. Search for `eglaptop` repository
5. Click "Import"

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

**Production Variables:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAlGsidCDMkfRkBXtYKWsyBNNdUptxD_oI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=eglaptop-com.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://eglaptop-com-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=eglaptop-com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=eglaptop-com.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=43028466863
NEXT_PUBLIC_FIREBASE_APP_ID=1:43028466863:web:40f664a9260d4043db985a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-BQ0SW31MGS
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
NEXT_PUBLIC_APP_URL=https://eglaptop.com
FIREBASE_SERVICE_ACCOUNT_KEY=your-base64-encoded-service-account-key
```

### Step 4: Configure Build Settings
In Vercel Dashboard → Project Settings → Build & Development Settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x (or latest LTS)

### Step 5: Configure Custom Domain
1. Go to Project → Settings → Domains
2. Add custom domain: `eglaptop.com`
3. Update DNS records (Vercel will provide details):

**DNS Records to add:**
```
Type: CNAME
Name: www
Value: cname.vercel.com
TTL: 3600

Type: A
Name: @
Value: 76.76.19.0
TTL: 3600
```

4. Wait for DNS propagation (5-48 hours)

### Step 6: Deploy
1. Push code to GitHub:
```bash
git add .
git commit -m "Initial Firebase setup"
git push origin main
```

2. Vercel automatically deploys on push
3. Check deployment status in Vercel Dashboard
4. View production URL once complete

---

## Automated Deployments

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Run linter
        run: npm run lint --if-present

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_DATABASE_URL: ${{ secrets.NEXT_PUBLIC_FIREBASE_DATABASE_URL }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Add Secrets to GitHub
1. Go to Repository → Settings → Secrets and variables → Actions
2. Add Repository Secrets:
   - `VERCEL_TOKEN`: Get from Vercel → Account Settings → Tokens
   - `VERCEL_ORG_ID`: From Vercel project settings
   - `VERCEL_PROJECT_ID`: From Vercel project settings
   - Firebase config variables

---

## Production Checklist

Before deploying to production:

### Security
- [ ] All environment variables configured in Vercel
- [ ] Firebase security rules deployed and tested
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] No sensitive data in code
- [ ] API keys restricted to specific domains
- [ ] Rate limiting configured

### Performance
- [ ] Build time < 5 minutes
- [ ] Bundle size optimized
- [ ] Images optimized (WebP format)
- [ ] Lazy loading implemented
- [ ] CSS/JS minified
- [ ] Lighthouse score > 80

### Testing
- [ ] Authentication flow tested
- [ ] All forms validated
- [ ] API endpoints tested
- [ ] Cross-browser compatibility checked
- [ ] Mobile responsiveness verified
- [ ] Performance tested

### Monitoring
- [ ] Firebase console monitoring enabled
- [ ] Error tracking configured (Sentry optional)
- [ ] Analytics tracking verified
- [ ] Backup strategy defined
- [ ] Uptime monitoring enabled

### Documentation
- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment procedure documented
- [ ] Database schema documented
- [ ] Emergency contact list created

---

## Daily Operations

### Monitor Deployments
```bash
# Check deployment status
# Visit: https://vercel.com/dashboard/eglaptop

# View live logs
# Click deployment → Logs tab
```

### Rollback Deployment
If issues occur:
```bash
# In Vercel Dashboard:
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click three dots → "Promote to Production"
```

### View Logs
```bash
# Application logs
# Vercel Dashboard → Project → Logs

# Firebase logs
# Firebase Console → Cloud Functions → Logs (if using CF)

# Browser console
# Development tools → Console tab
```

### Database Backups
Firebase automatically backs up daily, but you can manually export:
```bash
# Using Firebase CLI (must be installed)
firebase emulators:export ./backup

# Or through Firebase Console:
# Firestore Database → Backups → Create Backup
```

---

## Troubleshooting

### SSH Connection Failed
```bash
# Verify SSH key
ssh -v git@github.com

# Check if key is in agent
ssh-add -l

# Re-add key if needed
ssh-add ~/.ssh/eglaptop_key
```

### Deployment Failed
1. Check Vercel build logs:
   - Click failed deployment → Logs
2. Common issues:
   - Missing environment variables
   - Invalid Node.js version
   - Build script errors

### Environment Variables Not Loading
```bash
# Verify in Vercel:
# 1. Project Settings → Environment Variables
# 2. Check for typos
# 3. Ensure correct environment (Production/Preview)

# In code, verify access:
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
```

### Firebase Authentication Not Working
1. Check Firebase credentials in `.env.local`
2. Verify authentication domain in Firebase Console
3. Check browser console for specific error messages
4. Test with Firebase Emulator locally

---

## Security Best Practices

### Protect Your SSH Key
```bash
# Never share your private key
# Never commit to git
# Use passphrase for extra security
# Back up key in secure location
```

### Rotate Credentials
```bash
# Generate new SSH key every 6-12 months
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/eglaptop_key_new

# Update GitHub with new key
# Remove old key from GitHub
```

### Monitor Access
1. Check GitHub login activity: https://github.com/settings/security
2. Review SSH keys: https://github.com/settings/keys
3. Check Vercel activity: Vercel Dashboard → Team → Audit Log

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub SSH Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [Firebase Deployment Docs](https://firebase.google.com/docs/hosting)
- [Next.js Deployment](https://nextjs.org/docs/deployment/vercel)
