# Vercel Deployment Setup & Diagnostics

## Issue Diagnosed

**Dashboard not opening after login on Vercel** — This was caused by missing Supabase public environment variables in the Vercel environment.

When users logged in successfully (role stored in localStorage), the redirect to `/dashboard` would load the SuperAdminDashboard component, which attempted to:
1. Initialize Supabase client using `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
2. Subscribe to realtime Supabase channels

On Vercel, if these env vars were not configured, the Supabase client initialization would **fail silently or crash**, making the dashboard appear as a blank/unresponsive page.

---

## Fixes Applied

### 1. **Supabase Configuration Guard** (SuperAdminDashboard.tsx)
- Added `SUPABASE_CONFIGURED` flag that checks both env vars exist
- All Supabase operations (queries, subscriptions) now skip execution if env vars missing
- Clear error message displays instead of blank dashboard: 
  > "Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in Vercel, then redeploy."

### 2. **Enhanced Error Logging**
- Added console.error logs in safeSelect and fetchDashboard for Vercel production debugging
- Errors now surface in Vercel logs so you can see what's failing

### 3. **Diagnostic UI Alert**
- Dashboard now displays a red alert box if Supabase credentials are missing
- Alert shows exact env var names needed
- This prevents the blank page problem

---

## What You Need To Do on Vercel

### Step 1: Add Environment Variables
Go to your Vercel project → Settings → Environment Variables → Add:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Format: `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable key | OR use `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

**Where to get these:**
1. Go to your Supabase project
2. Navigate to Settings → API
3. Copy "Project URL" → paste as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy "anon public" key → paste as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Step 2: Redeploy
After adding env vars:
1. Trigger a new deployment (git push or click "Redeploy" in Vercel dashboard)
2. Wait for build to complete

### Step 3: Test Login Flow
1. Visit your Vercel URL
2. Navigate to `/login`
3. Select "Super Admin" and click credentials to autofill
4. Click Login
5. Should redirect to `/dashboard`
6. Dashboard should load with data (or show "LIVE DATA" status)

---

## What To Do If Dashboard Still Doesn't Load

### Check Vercel Logs
1. Go to Vercel dashboard → Deployments → select latest
2. Open "Logs" tab
3. Look for errors containing:
   - `Supabase environment variables are missing`
   - `Dashboard fetch error`
   - `Supabase query error`

### Common Issues

| Problem | Solution |
|---------|----------|
| "Supabase environment variables are missing" appears | Verify env vars are added in Vercel and redeploy |
| Dashboard loads but shows "NO DATA - SETUP REQUIRED" | Run `/api/seed` endpoint to populate database, or add Supabase data manually |
| Page is blank/unresponsive | Check browser console (F12 → Console) for JavaScript errors |
| Login works but redirect fails | Check that `/dashboard`, `/store-admin`, `/employee` routes exist (they do) |

### Testing Locally
If Vercel is still failing, test locally first:
```bash
# Make sure Supabase env vars are in .env.local
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=xxx

# Run production build
npm run build

# Start production server
npm start
```

Then try login flow and check browser console for errors.

---

## Login Flow Diagram

```
User at /login
    ↓
Enters credentials (demo mode, no auth backend)
    ↓
localStorage.setItem('userRole', 'super_admin')
    ↓
router.push('/dashboard')
    ↓
/dashboard page loads
    ↓
SuperAdminDashboard component renders
    ↓
useEffect → calls fetchDashboard()
    ↓
Check: SUPABASE_CONFIGURED? (env vars present?)
    ├─ NO → Display error alert, stop
    └─ YES → Query all 17 Supabase tables in parallel
    ↓
setSnapshot() with fetched data
    ↓
Dashboard renders with live data
```

---

## Database Seeding (Optional)

If your Supabase database is empty, you can populate it with demo data:

```bash
# Local testing
curl -X POST http://localhost:3000/api/seed

# Or use the dashboard UI
# After dashboard loads, click "Seed Database" button
```

This creates demo locations, employees, attendance, payroll, etc.

---

## Key Files Modified

- `components/SuperAdminDashboard.tsx` — Added env var guards and error logging
- No changes needed to login, routing, or other components

---

## Next Steps

1. ✅ Add Supabase env vars to Vercel
2. ✅ Redeploy
3. ✅ Test login → dashboard flow
4. ✅ If data is missing, run `/api/seed` or add manually
5. ✅ Monitor Vercel logs for any runtime errors

---

**Support**: If you get a specific error message, share the Vercel log output and I can help troubleshoot.
