
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initializing with the API key exclusively from process.env.API_KEY as a named parameter.
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async auditStatement(statement: string): Promise<AuditResult> {
    // Using gemini-3-pro-preview for complex reasoning tasks like cognitive bias auditing.
    const response = await this.ai.models.generateContent({
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

    try {
      // Accessing the text property directly without calling it as a function as per SDK guidelines.
      const text = response.text;
      if (!text) {
        throw new Error("The model did not return any logical analysis.");
      }
      return JSON.parse(text.trim()) as AuditResult;
    } catch (error) {
      console.error("Failed to parse audit result:", error);
      throw new Error("The auditor failed to process the logic correctly. Please try rephrasing.");
    }
  }
}
