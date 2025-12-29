
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from "../types";

export class GeminiService {
  async auditStatement(statement: string): Promise<AuditResult> {
    // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
    // Use this process.env.API_KEY string directly when initializing the @google/genai client instance.
    // Create a new instance right before making an API call to ensure it always uses the most up-to-date API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Audit the following founder statement for cognitive biases and reasoning flaws: "${statement}"`,
        config: {
          systemInstruction: `You are a cognitive bias auditor for startup founders. Your role is to detect flawed thinking and hidden blind spots. 
          Tone: Analytical, skeptical, neutral, precise. 
          Constraint: Do not encourage. Do not suggest pivots. Only audit. 
          Follow the structure provided in the JSON schema. Be brutally honest and precise.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedBiases: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of specific cognitive biases identified in the statement."
              },
              evidence: {
                type: Type.STRING,
                description: "Direct quotes or references from the statement that prove the bias."
              },
              reasoningFlaws: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Specific logical fallacies or errors in the chain of reasoning."
              },
              weakAssumptions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Foundational beliefs that lack sufficient data or evidence."
              },
              counterHypotheses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Plausible alternative explanations that contradict the founder's view."
              },
              killCriteria: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Specific metrics or events that, if observed, should result in immediate termination of the current strategy."
              },
              riskAssessment: {
                type: Type.OBJECT,
                properties: {
                  level: {
                    type: Type.STRING,
                    description: "The assessed risk level. Expected values: Low, Moderate, High, or Extreme."
                  },
                  summary: {
                    type: Type.STRING,
                    description: "A one-sentence cold summary of the logical risk."
                  }
                },
                required: ["level", "summary"],
                propertyOrdering: ["level", "summary"]
              }
            },
            required: [
              "detectedBiases", 
              "evidence", 
              "reasoningFlaws", 
              "weakAssumptions", 
              "counterHypotheses", 
              "killCriteria", 
              "riskAssessment"
            ],
            propertyOrdering: [
              "detectedBiases", 
              "evidence", 
              "reasoningFlaws", 
              "weakAssumptions", 
              "counterHypotheses", 
              "killCriteria", 
              "riskAssessment"
            ]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("The model did not return any logical analysis.");
      }
      return JSON.parse(text.trim()) as AuditResult;
    } catch (error: any) {
      console.error("Gemini Audit Error:", error);
      
      const errorMessage = error.message || "";
      // If the request fails with an error message containing "Requested entity was not found.", 
      // reset the key selection state and prompt the user to select a key again via openSelectKey() in the UI.
      if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("API key")) {
        throw new Error("API configuration error. Please re-select your API key.");
      }
      
      throw new Error(errorMessage || "The auditor failed to process the logic. Check your network or API key.");
    }
  }
}
