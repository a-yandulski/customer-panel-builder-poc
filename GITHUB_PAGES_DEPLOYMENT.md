# Customer Panel Builder POC - GitHub Pages Deployment

This React application has been configured for deployment to GitHub Pages using gh-pages.

## Deployment Setup

### Automatic Deployment (Recommended)

The application is configured with GitHub Actions for automatic deployment:

1. **Push to main branch**: Any push to the `main` branch will automatically trigger a deployment
2. **GitHub Actions**: The workflow in `.github/workflows/deploy.yml` handles the build and deployment process
3. **No manual intervention required**: Once set up, deployments are fully automated

### Manual Deployment

You can also deploy manually using the npm scripts:

```bash
# Build and deploy to GitHub Pages
npm run deploy

# Or run the steps separately
npm run build:gh-pages  # Build the application
gh-pages -d dist/spa    # Deploy to gh-pages branch
```

## Configuration Details

### Key Changes Made for GitHub Pages

1. **Base Path Configuration**: 
   - Added `base: "/customer-panel-builder-poc/"` to `vite.config.gh-pages.ts`
   - Updated `BrowserRouter` with `basename="/customer-panel-builder-poc"`

2. **Package.json Updates**:
   - Added `homepage` field pointing to GitHub Pages URL
   - Added `gh-pages` dependency
   - Added deployment scripts (`build:gh-pages`, `predeploy`, `deploy`)

3. **SPA Routing Support**:
   - Added `404.html` to handle client-side routing
   - Added SPA routing script to `index.html`
   - Added `.nojekyll` file to prevent Jekyll processing

4. **GitHub Actions Workflow**:
   - Automatic deployment on push to main branch
   - Uses Node.js 18 and npm cache for faster builds
   - Deploys built files to `gh-pages` branch

### File Structure Changes

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── public/
│   ├── 404.html               # SPA routing fallback
│   └── .nojekyll              # Disable Jekyll processing
├── vite.config.gh-pages.ts    # Vite config for GitHub Pages
└── package.json               # Updated with deployment scripts
```

## Setup Instructions

### 1. Repository Settings

1. Go to your GitHub repository settings
2. Navigate to "Pages" section
3. Set source to "Deploy from a branch"
4. Select "gh-pages" branch and "/ (root)" folder
5. Save the settings

### 2. First Deployment

Option A: **Automatic (via GitHub Actions)**
- Simply push to the main branch
- GitHub Actions will handle the rest

Option B: **Manual**
```bash
npm install
npm run deploy
```

### 3. Verify Deployment

Your application will be available at:
`https://a-yandulski.github.io/customer-panel-builder-poc`

## Development vs Production

### Development
```bash
npm run dev  # Uses regular vite config with Express middleware
```

### GitHub Pages Build
```bash
npm run build:gh-pages  # Uses vite.config.gh-pages.ts with correct base path
```

### Regular Build (for other deployments)
```bash
npm run build  # Builds both client and server for full-stack deployment
```

## Troubleshooting

### Common Issues

1. **404 errors on page refresh**: 
   - Ensure `404.html` is present in `public/` folder
   - Check that the SPA routing script is in `index.html`

2. **Assets not loading**:
   - Verify the `base` path in `vite.config.gh-pages.ts` matches your repository name
   - Check the `basename` in BrowserRouter matches the repository name

3. **Deployment fails**:
   - Check GitHub Actions logs in the repository's Actions tab
   - Ensure the build completes successfully locally with `npm run build:gh-pages`

### Repository Name Changes

If you change the repository name, update these files:
- `package.json`: Update the `homepage` field
- `vite.config.gh-pages.ts`: Update the `base` path
- `client/App.tsx`: Update the `basename` in BrowserRouter

## Scripts Reference

- `npm run dev` - Start development server
- `npm run build:gh-pages` - Build for GitHub Pages
- `npm run deploy` - Build and deploy to GitHub Pages
- `npm run build` - Build for production (full-stack)
- `npm run test` - Run tests
- `npm run typecheck` - Run TypeScript type checking
