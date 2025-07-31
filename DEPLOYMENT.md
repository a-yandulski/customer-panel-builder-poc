# GitHub Pages Deployment Guide

This guide explains how to deploy your Customer Panel POC to GitHub Pages using the manual deployment approach.

## 🚀 Quick Deploy

```bash
npm run deploy
```

That's it! Your app will be built and deployed to GitHub Pages automatically.

## 📋 Available Deployment Commands

### `npm run deploy`
- Builds the app for production with MSW enabled
- Deploys to the `gh-pages` branch
- Preserves existing files in the branch

### `npm run deploy:clean`
- Same as above, but cleans the `gh-pages` branch first
- Use this if you want to ensure no old files remain

### `npm run build:github-pages`
- Only builds the app (doesn't deploy)
- Useful for testing the build locally

## 🔧 How It Works

1. **Build Process**: Runs `cross-env VITE_ENABLE_MSW=true vite build`
   - Enables Mock Service Worker for production demo
   - Sets base path to `/customer-panel-builder-poc/`
   - Outputs to `dist/spa/` directory

2. **Deployment**: Uses `gh-pages -d dist/spa`
   - Pushes contents of `dist/spa/` to `gh-pages` branch
   - GitHub Pages serves from this branch automatically

## 🌐 Live Site

After deployment, your app is available at:
**https://a-yandulski.github.io/customer-panel-builder-poc/**

## ✅ Features Enabled in Production

- 🎭 **Mock Service Worker**: Realistic API responses for demo
- 🔐 **Authentication**: Demo login with persistent state
- 📊 **Live Dashboard**: Interactive charts and real-time data
- 🔧 **Service Management**: Domain, hosting, and billing management
- 📱 **Mobile Responsive**: Works on all device sizes
- 🛣️ **Client-Side Routing**: All routes work with direct URL access

## 🔍 Testing the Deployment

The deployment includes comprehensive testing utilities accessible via browser console:

```javascript
// Test different error scenarios
window.mswTestScenarios.auth.forceUnauthorized();
window.mswTestScenarios.api.forceServerError();

// Test network conditions
window.mswTestScenarios.api.forceSlowNetwork(5000);

// Reset to normal behavior
window.mswTestScenarios.reset();
```

## 🛠️ Troubleshooting

### Build Issues
```bash
# Clear build cache and rebuild
rm -rf dist/
npm run build:github-pages
```

### Deployment Issues
```bash
# Force clean deployment
npm run deploy:clean
```

### GitHub Pages Not Updating
1. Check your repository's Pages settings
2. Ensure it's set to deploy from `gh-pages` branch
3. Wait a few minutes for GitHub's CDN to update

## 🔄 Development Workflow

1. **Make changes** to your code
2. **Test locally**: `npm run dev`
3. **Deploy**: `npm run deploy`
4. **Verify**: Visit the live site

## 📁 Repository Structure

```
├── dist/spa/           # Built files (auto-generated)
├── client/             # React source code
├── server/             # Express server (dev only)
├── public/             # Static assets
│   ├── 404.html       # GitHub Pages SPA fallback
│   └── mockServiceWorker.js  # MSW service worker
└── package.json        # Deployment scripts
```

## 🎯 Next Steps

Your Customer Panel POC is now live and ready for demonstration! The app includes:

- **Realistic Demo Data**: Powered by Mock Service Worker
- **Interactive Features**: Fully functional dashboard and management tools
- **Production Ready**: Optimized build with proper routing
- **Easy Updates**: Simple `npm run deploy` workflow

Perfect for showcasing your customer panel capabilities to stakeholders!
