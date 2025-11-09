# Deployment Guide

## Quick Deploy to GitHub Pages

### 1. Create GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit - X-Ray QC PWA"
git remote add origin https://github.com/YOUR_USERNAME/xray-qc-pwa.git
git push -u origin main
```

### 2. Configure GitHub Pages
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**

### 3. Update Base Path (if needed)
If your repository is named something other than `xray-qc-pwa`, update `vite.config.ts`:

```typescript
base: '/your-actual-repo-name/'
```

Also update `src/App.tsx`:
```typescript
<Router basename="/your-actual-repo-name">
```

### 4. Push and Deploy
```bash
git add .
git commit -m "Update base path"
git push
```

The GitHub Action will automatically:
- Install dependencies
- Build the app
- Deploy to GitHub Pages

Your app will be available at:
`https://YOUR_USERNAME.github.io/your-repo-name/`

## Alternative Deployment Options

### Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set base path in `vite.config.ts` to `/`

### Vercel
1. Import your GitHub repository
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set base path in `vite.config.ts` to `/`

### Custom Server
1. Build the app: `npm run build`
2. Upload the `dist/` folder to your web server
3. Configure your server to serve the `index.html` for all routes
4. Ensure HTTPS is enabled (required for PWA features)

## Post-Deployment Checklist

- [ ] App loads correctly
- [ ] All routes work (Dashboard, New Session, History, etc.)
- [ ] PWA can be installed (check browser install prompt)
- [ ] Offline functionality works
- [ ] IndexedDB stores data
- [ ] PDF export works
- [ ] Chart.js renders linearity graph
- [ ] Hospital logo upload works

## PWA Installation Testing

### Desktop (Chrome/Edge)
1. Visit your deployed URL
2. Click the install icon in the address bar (➕)
3. Click "Install"

### Mobile (iOS Safari)
1. Visit your deployed URL
2. Tap the Share button
3. Tap "Add to Home Screen"

### Mobile (Android Chrome)
1. Visit your deployed URL
2. Tap the menu (⋮)
3. Tap "Add to Home Screen" or "Install app"

## Troubleshooting

### PWA Not Installing
- Ensure site is served over HTTPS
- Check browser console for manifest/service worker errors
- Verify `manifest.webmanifest` is accessible
- Check PWA requirements in Chrome DevTools (Application tab)

### Routes Not Working
- Ensure base path matches deployment location
- Configure server for client-side routing (serve index.html for all routes)

### Assets Not Loading
- Check base path configuration in `vite.config.ts`
- Verify all paths are relative
- Check browser network tab for 404 errors

## Performance Optimization

### Lighthouse Audit
Run in Chrome DevTools:
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"

Target scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- PWA: 90+

### Tips for Better Performance
- Ensure images are optimized
- Minimize CSS/JS bundle size
- Enable HTTP/2 on server
- Use CDN for static assets
- Enable gzip/brotli compression

## Security Considerations

- Always use HTTPS in production
- Regularly update dependencies: `npm audit fix`
- Review and update `Content-Security-Policy` if needed
- Consider implementing rate limiting for API calls (if added later)
- Backup IndexedDB data regularly (user responsibility)

## Monitoring

### Check Service Worker Status
Chrome DevTools → Application → Service Workers

### Check IndexedDB Data
Chrome DevTools → Application → IndexedDB → XRayQCDatabase

### View PWA Manifest
Chrome DevTools → Application → Manifest

## Updates and Maintenance

### Deploying Updates
```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push

# GitHub Actions will automatically redeploy
```

### Service Worker Updates
The app uses `autoUpdate` registration type, so:
- New service worker installs automatically
- Users get updates on next app load
- No manual update required

### Cache Clearing
If users experience issues:
1. Uninstall PWA
2. Clear browser data
3. Reinstall PWA

## Support

For deployment issues:
- Check GitHub Actions logs for build errors
- Review browser console for runtime errors
- Test locally first: `npm run build && npm run preview`
- Ensure all dependencies are installed: `npm ci`

Happy deploying! 🚀
