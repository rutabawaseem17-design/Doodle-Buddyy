
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API key is not configured on the server.",
      });
    }

    const { contents } = req.body ?? {};

    if (!Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({
        error: "Please provide a conversation to send.",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: `
          You are Doodle Buddy, a friendly and helpful AI assistant.

          Your personality is warm, creative, encouraging, and playful.
          Use occasional cute emojis, but do not overuse them.
          Give accurate and useful answers.
          Adapt your tone to the user's needs.
          Explain difficult topics in simple, clear steps.
          Help with coding, studying, writing, brainstorming, and everyday questions.
        `,
      },
    });

    const reply = response.text?.trim();

    if (!reply) {
      return res.status(502).json({
        error: "Gemini didn't return a text response. Please try again.",
      });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error);

    return res.status(500).json({
      error: "Something went wrong while contacting Gemini. Please try again.",
    });
  }
}
