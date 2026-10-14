# Deploy

Hosting: **Vercel**, project linked to the `ikariwill/ror2-builds` repository.

## First time

1. vercel.com → **Add New… → Project** → import `ikariwill/ror2-builds`.
2. Vercel detects **Vite**. Check:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. **Deploy.** No environment variables.

## After that

- Push to `main` → automatic production deploy.
- Push to another branch or a PR → preview deploy with its own URL.

## Notes

- Routing is hash-based (`#/bandit`), so there are no route rewrites to configure.
- The icons live in `public/icons/` and are served as static files with Vercel's cache.
- The build runs `tsc --noEmit` before `vite build`: a type error breaks the deploy on purpose.
