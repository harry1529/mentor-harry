# Mentor Harry — backend + website

This folder contains everything needed to run Mentor Harry as a real,
public website: the site itself (`public/mentor-harry.html`) and a small
server (`server.js`) that keeps your Groq API key private and relays
AI requests on its behalf.

## 1. Get a free Groq API key

1. Go to https://console.groq.com
2. Sign in (no credit card needed)
3. API Keys → Create API Key
4. Copy it (starts with `gsk_...`)

## 2. Run it on your own computer first

You'll need [Node.js](https://nodejs.org) installed (get the LTS version).

```
cd mentor-harry-app
npm install
cp .env.example .env
```

Open `.env` and paste your real key after `GROQ_API_KEY=`.

Then start it:

```
npm start
```

Open http://localhost:3000/mentor-harry.html in your browser. The intake,
career discovery, comparison tool, and chatbox should all work.

Note: Groq's free tier is rate-limited (roughly 30 requests/minute, ~1,000/day
on the model this uses) — plenty for testing and a real early-stage site, but
worth knowing if traffic grows.

## 3. Put it on the internet

Pick one of these free/cheap hosts — any of them can run this exact folder:

**Render (easiest)**
1. Push this folder to a GitHub repository
2. Go to https://render.com → New → Web Service → connect your repo
3. Build command: `npm install`   Start command: `npm start`
4. Add an environment variable: `GROQ_API_KEY` = your key
5. Deploy — you'll get a live URL like `mentor-harry.onrender.com`

**Railway / Vercel / Fly.io** work the same way: connect the repo, set the
`GROQ_API_KEY` environment variable in their dashboard (never in code),
and let them run `npm install` + `npm start`.

## 4. Point a real domain at it (optional)

Buy a domain (Namecheap, GoDaddy, Google Domains — ~$10-15/year) and follow
your host's "custom domain" instructions to connect it.

## 5. Turn it into an installable app

Once the site is live at a real URL, tools like
[PWABuilder](https://www.pwabuilder.com) can package that URL into Android
and iOS app files for the Play Store and App Store, without rewriting any
code.

## Notes

- Never put your API key directly in `public/mentor-harry.html` or commit
  `.env` to GitHub — it must only live in the server's environment
  variables. `.env` is already excluded via `.gitignore`.
- The built-in rate limiter (20 AI requests/minute per visitor) protects
  you from hitting Groq's own free-tier limits too fast — adjust the number
  in `server.js` as you learn your real traffic.
