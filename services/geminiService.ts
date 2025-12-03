import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ContentType, Difficulty, GeneratedItem } from "../types";

// Initialize Gemini Client
// WARNING: In a real production app, never expose API keys on the client side.
// This should be proxied through a backend.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to construct schemas based on content type
const getResponseSchema = (type: ContentType): Schema => {
  const baseItemProps = {};
  
  if (type === ContentType.MCQ) {
    return {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['MCQ'] },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ['type', 'question', 'options', 'correctAnswer', 'explanation']
      }
    };
  }
  
  if (type === ContentType.SHORT_QA || type === ContentType.LONG_QA) {
    return {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['QA'] },
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
          points: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['type', 'question', 'answer']
      }
    };
  }

  if (type === ContentType.FLASHCARD) {
    return {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['FLASHCARD'] },
          front: { type: Type.STRING },
          back: { type: Type.STRING }
        },
        required: ['type', 'front', 'back']
      }
    };
  }

  return { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {} } };
};

export const generateStudyMaterial = async (
  textContext: string,
  type: ContentType,
  count: number,
  difficulty: Difficulty
): Promise<GeneratedItem[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const schema = getResponseSchema(type);
  
  const systemInstruction = `
    You are an expert educational content creator. 
    Your goal is to generate high-quality study materials based strictly on the provided text.
    Target Audience: High School / University Students.
    Difficulty: ${difficulty}.
    Language: English.
    
    Rules:
    1. Do not hallucinate information not present in the text, but you may use general knowledge to explain concepts found in the text.
    2. Format output strictly as JSON.
    3. For MCQs, provide 4 distinct options.
    4. For Flashcards, keep the front concise (concept/term) and back detailed (definition).
    5. For Long QA, provide a structured answer.
  `;

  const prompt = `
    Based on the following text, generate ${count} items of type ${type}.
    
    TEXT CONTEXT:
    "${textContext.substring(0, 30000)}" 
    // Truncating to safe limit, though Flash supports large context.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7, // Balance creativity and accuracy
      }
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    // Ensure the data is an array
    return Array.isArray(data) ? data : [];

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate content. Please try again or reduce the text size.");
  }
};
