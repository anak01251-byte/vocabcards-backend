const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

app.post("/ask", async (req, res) => {
  try {
    const { system, messages } = req.body;
    const userMessage = messages[messages.length - 1].content;
    const fullPrompt = system ? `${system}\n\n${userMessage}` : userMessage;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { maxOutputTokens: 1000 }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      return res.status(500).json({ error: "Gemini API error", detail: data });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

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

