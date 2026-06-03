# Portfolio CMS Setup Complete

## Infrastructure Created

### Cloudflare Resources (via Wrangler)
- ✅ **R2 Bucket**: `portfolio-images` — stores original image files
- ✅ **D1 Database**: `portfolio-cms` (ID: `8cb2c2fe-bcb0-48e9-a40c-693dd73d3a0c`)
- ✅ **Cloudflare Access**: Google OAuth configured at `https://mattiasbaldi.cloudflareaccess.com`
  - AUD tag: `fccbb536d304a229b3f805f28ba6b4188439d9e8590c9f84d8f1a99e35ec37ac`
  - Protects `/admin*` path
  - Only `mattiasbaldi@gmail.com` can access

### Cloudflare Services (Dashboard)
- ✅ **Cloudflare Images Transformations** — enabled for domain
- ✅ **Images Free Plan** — 5,000 unique transformations/month included

## Code Structure

### Pages Functions (Backend API)
```
portfolio/functions/
├── _middleware.ts              # JWT validation for all /api/* routes
├── api/
│   ├── upload.ts               # POST /api/upload — multipart upload to R2 + D1 metadata
│   └── images/
│       ├── index.ts            # GET /api/images?project=slug — list images per project
│       └── [id].ts             # DELETE /api/images/:id — delete from R2 + D1
```

### Frontend (React Router)
```
src/
├── App.tsx                     # Router setup (/ = Home, /admin = Admin)
├── pages/
│   ├── Home.tsx                # Portfolio home page (original App.tsx content)
│   └── Admin.tsx               # Admin panel — upload/manage images
├── styles/
│   ├── main.css                # Portfolio styles
│   └── admin.css               # Admin UI styles (dropzone, gallery grid, etc.)
```

### Configuration
- `wrangler.toml` — D1 + R2 bindings, env vars, Pages build config
- `schema.sql` — D1 table: `images` (id, project_slug, filename, r2_key, caption, sort_order, uploaded_at)

## Deployment Steps

### 1. Deploy Pages Functions + Build
```bash
cd portfolio
npm run build
wrangler pages deploy dist
```

This deploys:
- Static SPA to `mattiasbaldi.com/` (or Pages domain)
- Pages Functions to `/api/*` and `/admin/*`

### 2. Verify Access
- Visit `https://mattiasbaldi.com/admin` → redirects to Google login (Cloudflare Access)
- Sign in with `mattiasbaldi@gmail.com` → lands on admin panel
- Try `/api/upload` without auth header → 401 error (JWT validation works)

### 3. Images Workflow
1. Upload via admin panel → stored in R2 bucket
2. Metadata stored in D1 (id, filename, r2_key, caption)
3. Admin retrieves list via `GET /api/images?project=slug`
4. Frontend can serve images via transform URLs:
   ```
   https://mattiasbaldi.com/cdn-cgi/image/width=1200,quality=85/portfolio-images/[key]
   ```
   Cloudflare Images auto-transforms + caches on first request

## API Endpoints

### Upload Image
```bash
POST /api/upload
Content-Type: multipart/form-data

Form fields:
- file: <File>
- projectSlug: "spice-my-way"
- caption: (optional)

Response:
{
  "id": "uuid",
  "r2_key": "spice-my-way/uuid.jpg",
  "filename": "original.jpg",
  "url": "https://...cdn-cgi/image/width=1200.../r2-key"
}
```

### List Images
```bash
GET /api/images?project=spice-my-way

Response:
{
  "images": [
    {
      "id": "uuid",
      "project_slug": "spice-my-way",
      "filename": "image.jpg",
      "r2_key": "spice-my-way/uuid.jpg",
      "caption": "...",
      "sort_order": 0,
      "uploaded_at": "2026-06-03T..."
    }
  ]
}
```

### Delete Image
```bash
DELETE /api/images/{id}

Response:
{ "success": true }
```

## Authentication

All `/api/*` endpoints require a valid Cloudflare Access JWT in the `Cf-Access-Jwt-Assertion` header. This is automatically set by Cloudflare when you access `/admin/*` after logging in via Google.

**For local testing**: Use `cloudflared access` CLI to get a token:
```bash
cloudflared access login https://mattiasbaldi.cloudflareaccess.com
# Then use the token in Authorization header
```

## Next Steps

1. **Update portfolio data**: Replace static image paths in `src/data/data.json` with API calls to `GET /api/images?project=slug`
2. **Custom image variants**: Define predefined variants in D1 for different sizes (thumbnail, hero, etc.)
3. **Image optimization**: Add watermarks, filters, or other transforms via Cloudflare Workers (Images binding)
4. **Backup**: Set up automated R2 bucket backups via lifecycle rules

## Troubleshooting

### 401 Unauthorized on /api/*
- Ensure you accessed `/admin` and logged in first (Cloudflare Access sets the JWT)
- Check `CF_ACCESS_AUD` in wrangler.toml matches your Access app AUD tag

### Images not appearing in admin
- Verify D1 database is bound correctly (`wrangler d1 execute portfolio-cms --remote -- "SELECT * FROM images"`)
- Check R2 bucket has objects (`wrangler r2 object list portfolio-images`)

### Transform URLs 404
- Ensure Cloudflare Images Transformations is enabled for your domain
- Check R2 key format: `{projectSlug}/{uuid}.{ext}`

## Costs
- **R2**: Free tier covers this use case (10 GB storage free/month)
- **Cloudflare Images**: Free tier covers this use case (5,000 transforms/month)
- **D1**: Free tier limits apply (enforced 2025-02-10 for free Workers plan)
- **Pages**: Free tier covers this project
- **Access**: Part of Zero Trust; free tier may have limits — check your plan

**Total monthly cost**: $0 (free tier) or upgrade Workers plan to $5/mo for higher D1 limits if needed.
