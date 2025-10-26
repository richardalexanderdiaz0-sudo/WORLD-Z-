import { GoogleGenAI, Type } from "@google/genai";

// Assume process.env.API_KEY is available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const moderationSchema = {
  type: Type.OBJECT,
  properties: {
    isHateSpeech: {
      type: Type.BOOLEAN,
      description: "True if the text contains hate speech, bullying, harassment, or violates community guidelines.",
    },
    reason: {
        type: Type.STRING,
        description: "A brief reason why the content was flagged, if it was."
    }
  },
  required: ['isHateSpeech']
};

/**
 * Checks if a given text contains hate speech or violates community guidelines.
 * @param text The text to analyze.
 * @returns A boolean indicating if the text is considered hate speech.
 */
export const checkForHateSpeech = async (text: string): Promise<boolean> => {
  if (!text.trim()) {
    return false;
  }

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following text for any violations of our community guidelines. Check for hate speech (racism, homophobia, transphobia, sexism, etc.), bullying, harassment, encouragement of self-harm, violent threats, or explicit content. The text is: "${text}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: moderationSchema,
            temperature: 0.0, // Be deterministic for moderation
        },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    
    console.log("Moderation result:", result);
    return result.isHateSpeech || false;

  } catch (error) {
    console.error("Error checking for hate speech:", error);
    // Fail open: If the moderation service fails, allow the post to go through.
    // In a real-world scenario, you might want to flag this for manual review.
    return false;
  }
};
