const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // ✅ IMPORTANT

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;

app.post("/chat", async (req, res) => {
  const { message, systemPrompt } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt }, // ✅ YOUR PROMPT
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // ✅ Send clean response
    res.json(data);

  } catch (error) {
    console.log(error);
    res.json({
      reply: "⚠️ Server error. Try again.",
      hasCorrection: false
    });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));