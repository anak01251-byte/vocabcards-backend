const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_KEY = process.env.GROQ_KEY;

app.post("/ask", async (req, res) => {
  try {
    const { system, messages } = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          ...messages
        ]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", data);
      return res.status(500).json({ error: "Groq API error", detail: data });
    }

    const text = data.choices?.[0]?.message?.content || "";

    // Return in same format as Anthropic so the app doesn't need changes
    res.json({ content: [{ type: "text", text }] });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

app.get("/health", (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`VocabCards backend running on port ${PORT}`));

