# Instagram Downloader for Netlify

This project is a small static frontend + Netlify Functions (serverless) that fetch public Instagram posts and return media URLs (images/videos). It includes a proxy function to avoid CORS issues.

**Important legal note:** Use only for public posts and with permission. Respect Instagram's Terms of Use and creators' rights.

## How to deploy to Netlify

1. Install Netlify CLI (optional for local dev):
   ```
   npm i -g netlify-cli
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Deploy:
   - Option A: Drag & drop the project folder to Netlify UI is not enough because functions need building.
   - Option B (recommended):
     - Initialize a Git repo and push to GitHub.
     - Connect the repo to Netlify and set build command to `npm run build` (no-op) and publish directory `publish`.
     - Netlify will install dependencies and deploy functions automatically.

4. Locally test:
   ```
   netlify dev
   ```

## Notes & improvements
- This is a best-effort scraper for public posts. Instagram may change markup — update parsing logic if needed.
- For production, add rate-limiting, caching, logging, and abuse protection.
- The official Instagram Graph API is recommended for production use and requires permissions and tokens.

