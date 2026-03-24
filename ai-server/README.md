# AI Server (Vercel Ready)

## Local run
1. Copy `.env.example` to `.env`
2. Set `GEMINI_API_KEY`
3. Install dependencies and start:

```bash
npm install
npm start
```

## Deploy to Vercel
1. Import `ai-server` as a Vercel project
2. Set environment variable `GEMINI_API_KEY`
3. Deploy

After deploy, endpoint is:

- `POST https://<your-vercel-domain>/ai`
