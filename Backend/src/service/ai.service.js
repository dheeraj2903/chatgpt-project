require("dotenv").config();
const OpenAI = require("openai/index.js");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function generateResponse(userMessage) {
  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant", // ✅ CURRENTLY SUPPORTED
    messages: [
      {
        role: "system",
        content: "You are a helpful AI assistant. Answer clearly and simply."
      },
      {
        role: "user",
        content: String(userMessage)
      }
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

module.exports = { generateResponse };
