const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 API KEY from Render Environment
const API_KEY = process.env.API_KEY;

// ✅ Test route (optional)
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
        model: "openai/gpt-3.5-turbo", // ✅ stable model
        max_tokens: 500,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

console.log("FULL RESPONSE:", JSON.stringify(data, null, 2));

    // 🔍 Debug (check Render logs if needed)
    console.log("OpenRouter Response:", JSON.stringify(data, null, 2));

    // ✅ If OpenRouter fails
    if (!data || !data.choices) {
      return res.json({
        reply: "⚠️ AI not responding properly. Try again.",
        hasCorrection: false
      });
    }

    // ✅ Extract AI reply
    const raw = data.choices[0].message.content;

// 🔥 Extract JSON from AI response
let parsed;

try {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  const jsonString = raw.substring(start, end + 1);
  parsed = JSON.parse(jsonString);
} catch (err) {
  console.log("JSON PARSE ERROR:", err);
  parsed = {
    reply: raw,
    hasCorrection: false
  };
}

// ✅ Send correct format to frontend
res.json(parsed);

  } catch (error) {
    console.log("ERROR:", error);

    res.json({
      reply: "⚠️ Server error. Try again.",
      hasCorrection: false
    });
  }
});

// ✅ START SERVER
app.listen(3000, () => console.log("Server running on port 3000"));