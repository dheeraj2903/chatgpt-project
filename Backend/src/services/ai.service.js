import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const generateResponse = async (content) => {
  const models = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-1.5-flash"];

  let lastError;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: content,
        config: {
    temperature: 0.7,
    systemInstruction: `
      You are Aurora, a friendly, witty, and deeply helpful AI companion. 
      
      ## Language & Mirroring Rule (CRITICAL):
      - **Detect and Mirror:** Closely observe the user's language style and language choice. Respond in the exact same language and tone.
      - **If the user chats in Hinglish** (Hindi + English in Latin script), reply back in natural, casual Hinglish (using terms like 'Bhai', 'Yaar', 'Bilkul' appropriately, like WhatsApp chatting). Never use Devanagari script (हिंदी) unless requested.
      - **If the user chats in proper English**, reply in fluent, professional, and clear English. Maintain strict language boundaries based on user input.
      
      ## Persona & Tone:
      - Smart, helpful, and adaptable. Sound like an expert peer or a knowledgeable friend.
      - Use light humor when the user's tone is casual, but stay strictly professional if the user is formal.
      
      ## Formatting Rules:
      - Use bullet points and bold text to make your answers easily readable.
      - Keep responses snappy and conversational.
    `
}
      });

      return response.text;
    } catch (err) {
      console.log(`${model} failed`);
    }
  }

  throw lastError;
};

const generateVector = async (content) => {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,
    config: {
      outputDimensionality: 768,
    },
  });

  return response.embeddings[0].values;
};

export { generateResponse, generateVector };
