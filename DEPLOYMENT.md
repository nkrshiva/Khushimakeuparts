# Atelier Platform & Khushi Makeup Arts — Production Deployment Guide

## 1. Required Node Version
- Node.js: `v18.x`, `v20.x` (Recommended for Vercel and production builds) or `v22.x`
- npm: `v9.x` or higher

## 2. Install Command
```bash
npm install
```

## 3. Development Command
```bash
npm run dev
# Starts Vite local dev server at http://localhost:3000/
```

## 4. Lint Command
```bash
npm run lint
# Executes `tsc --noEmit` to verify type safety
```

## 5. Build Command
```bash
npm run build
# Compiles production assets into the `dist/` directory via Vite
```

## 6. Required Environment Variables
The application contains robust fallbacks to the configured Firebase project (`khushimakeuparts865`). For production or custom deployments, the following variables can be configured:
- `VITE_FIREBASE_API_KEY`: Firebase Web API Key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase Auth domain (e.g. `khushimakeuparts865.firebaseapp.com`)
- `VITE_FIREBASE_PROJECT_ID`: Cloud Firestore project ID (`khushimakeuparts865`)
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase Storage bucket (`khushimakeuparts865.firebasestorage.app`)
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Cloud Messaging Sender ID
- `VITE_FIREBASE_APP_ID`: Web App ID
- `VITE_FIREBASE_MEASUREMENT_ID`: Google Analytics 4 Measurement ID
See `.env.example` for the environment template.

## 7. Firebase Project Configuration
- **Project ID**: `khushimakeuparts865`
- **Default Database**: `(default)` in Cloud Firestore (Standard mode)
- **Configuration File**: `.firebaserc` maps `default` to `khushimakeuparts865`.

## 8. Firebase Authentication Configuration
- In the Firebase Console (**Authentication > Sign-in method**):
  - **Email/Password**: Must be enabled.
  - **Email link (passwordless sign-in)**: Optional.
- In **Authentication > Settings > Authorized domains**:
  - Add the Vercel production domain (e.g. `*.vercel.app` or specific `khushimakeuparts.vercel.app`).
  - Add custom production domain(s) if attached.

## 9. Firestore Rules Deployment
The authoritative security rules live in `firestore.rules`.
To deploy rules to production:
```bash
npx firebase deploy --only firestore:rules
```
*Note: The rules in `firestore.rules` have passed all 105 automated security regression tests on the Cloud Firestore Emulator. Do not alter rules without verifying against the test suite.*

## 10. Vercel Configuration
- **Framework Preset**: Vite (auto-detected)
- **Root Directory**: `./` (or repository root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Single Page App Routing**: `vercel.json` rewrites all requests to `/index.html` to support client-side paths (`/platform`, `/`).

## 11. Production Verification
After deployment:
1. Verify public Storefront loads at root URL `/`.
2. Verify Universal Platform loads at `/platform`, `#platform`, or `#portal`.
3. Verify Universal Login authenticates valid accounts and routes via `IdentityResolutionService`:
   - Master Admin (`naveen.kr.shiva@gmail.com`) ➔ Master Admin Cockpit
   - Tenant Owners ➔ Tenant Admin CMS
   - Staff / Employees ➔ Employee Workspace
   - Unassigned accounts ➔ No Workspace checkpoint
