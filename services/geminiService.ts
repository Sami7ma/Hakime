
import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosticReport, MediaInput, MedicalQuestion } from "../types";

const SYSTEM_INSTRUCTION = `
You are HAKIM, a world-class Digital Physician specializing in rural and tropical medicine. 
You act as a fully autonomous diagnostic agent.

CLINICAL GUIDELINES:
1. AUTHORITY: Do not hesitate. Be direct, authoritative, and medically precise.
2. TRIAGE: Categorize every case into EMERGENCY (Immediate life threat), URGENT (Needs doctor within 12-24h), or NON-URGENT.
3. VISION SPECIALIZATION: 
   - THROAT: Identify tonsillar hypertrophy, exudates, and uvular deviation. 
   - SKIN: Evaluate using standard dermatological descriptors (macule, papule, etc.).
   - WOUNDS: Identify signs of sepsis or necrotic tissue.
4. LANGUAGE: Use professional MD terminology but ensure suggested actions are clear for a layperson.
5. DISCLAIMER: Always end with: "Disclaimer: This is an AI assessment. Seek human physician validation immediately if symptoms worsen."
`;

export async function generateQuestionnaire(symptoms: string): Promise<MedicalQuestion[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: `The patient presents with: "${symptoms}". As a doctor, what 4 specific clinical questions would you ask to differentiate potential diagnoses? Return as JSON array of objects with id, question, and type (boolean/text).` }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['boolean', 'scale', 'text'] }
          },
          required: ["id", "question", "type"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
}

export async function analyzeMedicalCase(
  inputs: MediaInput[],
  symptoms: string,
  answers: Record<string, string>
): Promise<DiagnosticReport> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const contextText = `
    CHIEF COMPLAINT: ${symptoms}
    PATIENT INTERVIEW: ${JSON.stringify(answers)}
    EXAMINATION IMAGERY PROVIDED: ${inputs.length} items.
  `;

  const parts = [
    { text: contextText },
    ...inputs.map(input => ({
      inlineData: {
        data: input.data,
        mimeType: input.mimeType
      }
    }))
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: parts as any }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 8000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          conditionName: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER },
          triageLevel: { type: Type.STRING },
          clinicalReasoning: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          educationalSummary: { type: Type.STRING },
          prescriptionGuidance: { type: Type.STRING },
          disclaimer: { type: Type.STRING }
        },
        required: ["conditionName", "confidenceScore", "triageLevel", "clinicalReasoning", "suggestedActions", "educationalSummary", "disclaimer"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
