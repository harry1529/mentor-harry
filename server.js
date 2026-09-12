// Mentor Harry backend
// - Serves the website (the /public folder)
// - Holds the Groq API key privately (never sent to the browser)
// - Proxies chat/intake/compare requests to Groq on the site's behalf

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GROQ_API_KEY;
const MODEL = 'openai/gpt-oss-120b'; // free-tier Groq model

if (!API_KEY) {
  console.error('Missing GROQ_API_KEY. Copy .env.example to .env and add your key.');
  process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Serve the website itself (public/mentor-harry.html and any assets)
app.use(express.static('public'));

// So visiting the root URL just works, instead of needing the full filename
app.get('/', (req, res) => res.redirect('/mentor-harry.html'));

// Basic protection so one visitor can't rack up unlimited API usage.
// 20 AI requests per minute per IP - adjust as you learn your real traffic.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests - please wait a moment and try again.' }
});

// The frontend calls this instead of talking to Groq directly.
// It accepts the same shape the site already sends (system, messages, max_tokens),
// translates it into Groq's OpenAI-compatible chat format, and adds the secret
// API key server-side, where the browser can never see it. The reply is
// translated back into the {content: [{text}]} shape the frontend already
// expects, so no frontend changes are needed when switching providers.
app.post('/api/messages', aiLimiter, async (req, res) => {
  try {
    const { system, messages, max_tokens } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const chatMessages = [];
    if (system) chatMessages.push({ role: 'system', content: system });
    messages.forEach(m => chatMessages.push({ role: m.role, content: m.content }));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: Math.min(max_tokens || 1000, 1500),
        messages: chatMessages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', data);
      return res.status(response.status).json({ error: data.error?.message || 'AI request failed' });
    }

    const text = data.choices?.[0]?.message?.content || '';

    // Reshaped to match what the frontend already parses
    res.json({ content: [{ type: 'text', text }] });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Mentor Harry backend running at http://localhost:${PORT}`);
});
