
// import { GoogleGenAI } from "@google/genai";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const apiKey = process.env.GEMINI_API_KEY;

//     if (!apiKey) {
//       return res.status(500).json({
//         error: "Gemini API key is not configured on the server.",
//       });
//     }

//     const { contents } = req.body ?? {};

//     if (!Array.isArray(contents) || contents.length === 0) {
//       return res.status(400).json({
//         error: "Please provide a conversation to send.",
//       });
//     }

//     const ai = new GoogleGenAI({ apiKey });

//     const response = await ai.models.generateContent({
//       model: "gemini-3.8-flash",
//       contents,
//       config: {
//         systemInstruction: `
//           You are Doodle Buddy, a friendly and helpful AI assistant.

//           Your personality is warm, creative, encouraging, and playful.
//           Use occasional cute emojis, but do not overuse them.
//           Give accurate and useful answers.
//           Adapt your tone to the user's needs.
//           Explain difficult topics in simple, clear steps.
//           Help with coding, studying, writing, brainstorming, and everyday questions.
//         `,
//       },
//     });

//     const reply = response.text?.trim();

//     if (!reply) {
//       return res.status(502).json({
//         error: "Gemini didn't return a text response. Please try again.",
//       });
//     }

//     return res.status(200).json({ reply });
//   } catch (error) {
//     console.error("Gemini API error:", error);

//     return res.status(500).json({
//       error: "Something went wrong while contacting Gemini. Please try again.",
//     });
//   }
// }




import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

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

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        abortSignal: AbortSignal.timeout(25_000),
        maxOutputTokens: 800,
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
    const status = Number(error?.status);
    const message = String(error?.message ?? "");

    console.error("Gemini API error:", {
      status,
      name: error?.name,
      message,
    });

    if (
      error?.name === "TimeoutError" ||
      error?.name === "AbortError" ||
      /timed?\s*out|timeout/i.test(message)
    ) {
      return res.status(504).json({
        error: "Doodle Buddy took too long to respond. Please try again.",
      });
    }

    if (status === 429) {
      return res.status(429).json({
        error: "Doodle Buddy is busy right now. Please try again shortly.",
      });
    }

    if (status === 503 || status === 502) {
      return res.status(503).json({
        error: "Gemini is temporarily busy. Please try again shortly.",
      });
    }

    return res.status(500).json({
      error: "Doodle Buddy couldn't complete your request. Please try again.",
    });
  }
}
