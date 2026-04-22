# Deployment Guide — WriteSpace

## Overview

WriteSpace is a static Single Page Application (SPA) built with **React 18+ and Vite**. It is designed to be deployed as a fully static site on **Vercel** (or any static hosting provider).

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or equivalent pnpm/yarn)
- A [Vercel](https://vercel.com) account (free tier is sufficient)

---

## Build Commands

### Install dependencies

```bash
npm install
```

### Development server

```bash
npm run dev
```

### Production build

```bash
npm run build
```

This runs `vite build` and outputs static assets to the `dist/` directory.

### Preview production build locally

```bash
npm run preview
```

---

## Vercel Deployment

### Option 1: Deploy via Vercel CLI

1. Install the Vercel CLI globally:

   ```bash
   npm install -g vercel
   ```

2. From the project root, run:

   ```bash
   vercel
   ```

3. Follow the prompts:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. For production deployment:

   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Configure the project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

Vercel will automatically redeploy on every push to the main branch.

---

## vercel.json Configuration

Create a `vercel.json` file in the project root to ensure proper SPA routing. All routes must be rewritten to `index.html` so that client-side routing (React Router) handles navigation correctly.

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Why rewrites are necessary

WriteSpace uses client-side routing. Without the rewrite rule, navigating directly to a route like `/editor` or `/settings` would return a **404** from Vercel because no physical file exists at that path. The rewrite ensures all requests are served by `index.html`, allowing React Router to resolve the correct view.

---

## Environment Variables

WriteSpace accesses environment variables through Vite's `import.meta.env` mechanism. All custom environment variables **must** be prefixed with `VITE_`.

### Setting environment variables on Vercel

1. Go to your project on the Vercel dashboard.
2. Navigate to **Settings** → **Environment Variables**.
3. Add each variable with the `VITE_` prefix.
4. Select the appropriate environments (Production, Preview, Development).
5. Redeploy for changes to take effect.

### Local development

Create a `.env` file in the project root (this file is gitignored):

```env
VITE_API_URL=http://localhost:3000/api
```

> **Important**: Never use `process.env` in client-side code. Always use `import.meta.env.VITE_*`. Variables without the `VITE_` prefix are **not** exposed to the browser bundle.

---

## SPA Routing Verification

After deployment, verify that client-side routing works correctly:

### Manual verification steps

1. **Home page**: Visit `https://your-app.vercel.app/` — the app should load normally.

2. **Direct route access**: Navigate directly to a nested route (e.g., `https://your-app.vercel.app/editor`) by typing the URL in the browser address bar. The app should load and display the correct view — **not** a 404 page.

3. **Page refresh**: Navigate to any route within the app using in-app links, then press the browser refresh button. The page should reload and display the same view.

4. **Browser back/forward**: Use the browser's back and forward buttons after navigating between routes. Navigation history should work as expected.

5. **404 handling**: Visit a route that does not exist (e.g., `https://your-app.vercel.app/nonexistent-page`). The app should display its own 404/not-found component rather than a Vercel error page.

### Automated verification (curl)

```bash
# Should return 200 with HTML content
curl -s -o /dev/null -w "%{http_code}" https://your-app.vercel.app/

# Should return 200 (not 404) due to SPA rewrite
curl -s -o /dev/null -w "%{http_code}" https://your-app.vercel.app/editor

# Should return 200 (not 404) due to SPA rewrite
curl -s -o /dev/null -w "%{http_code}" https://your-app.vercel.app/any/deep/route
```

All three commands should output `200`.

---

## Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| 404 on direct route access | Missing SPA rewrite rule | Add `vercel.json` with the rewrites configuration shown above |
| Blank page after deploy | Incorrect output directory | Ensure `outputDirectory` is set to `dist` in `vercel.json` |
| Environment variables undefined | Missing `VITE_` prefix or not set on Vercel | Prefix all client-side env vars with `VITE_` and add them in Vercel dashboard |
| Assets not loading (404 on JS/CSS) | Incorrect `base` in Vite config | Ensure `base` in `vite.config.js` is set to `'/'` (default) |
| Build fails on Vercel | Node.js version mismatch | Set the Node.js version in Vercel project settings or add `"engines"` to `package.json` |

---

## Build Output Structure

After running `npm run build`, the `dist/` directory will contain:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── ...
```

This entire directory is deployed as static files. No server-side runtime is required.