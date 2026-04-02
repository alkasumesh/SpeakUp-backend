const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 API KEY from Render
const API_KEY = process.env.API_KEY;

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend working 🚀");
});

// ✅ MAIN CHAT ROUTE
app.post("/chat", async (req, res) => {
  const { message, systemPrompt } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://alkasumesh.github.io/SpeakUp/",
        "X-Title": "SpeakUp AI"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    console.log("FULL RESPONSE:", data);

    // 🔴 HANDLE OPENROUTER ERROR
    if (data.error) {
      console.log("OPENROUTER ERROR:", data.error);

      return res.json({
        reply: "⚠️ AI error: " + data.error.message,
        hasCorrection: false
      });
    }

    // 🔴 HANDLE EMPTY RESPONSE
    if (!data.choices || data.choices.length === 0) {
      return res.json({
        reply: "⚠️ No response from AI",
        hasCorrection: false
      });
    }

    const raw = data.choices[0].message.content;

    // 🔥 EXTRACT JSON FROM AI RESPONSE
    let parsed;
    try {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      parsed = JSON.parse(raw.substring(start, end + 1));
    } catch {
      parsed = {
        reply: raw,
        hasCorrection: false
      };
    }

    res.json(parsed);

  } catch (error) {
    console.log("SERVER ERROR:", error);

    res.json({
      reply: "⚠️ Server error occurred",
      hasCorrection: false
    });
  }
});

// ✅ START SERVER
app.listen(3000, () => console.log("Server running on port 3000"));