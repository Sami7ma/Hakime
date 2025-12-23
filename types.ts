
export enum TriageLevel {
  EMERGENCY = 'EMERGENCY',
  URGENT = 'URGENT',
  NON_URGENT = 'NON_URGENT',
  ROUTINE = 'ROUTINE'
}

export enum DiagnosticStep {
  SYMPTOMS = 'SYMPTOMS',
  QUESTIONNAIRE = 'QUESTIONNAIRE',
  VISION_SCAN = 'VISION_SCAN',
  ANALYZING = 'ANALYZING',
  REPORT = 'REPORT'
}

export interface MedicalQuestion {
  id: string;
  question: string;
  type: 'boolean' | 'scale' | 'text';
}

export interface DiagnosticReport {
  conditionName: string;
  confidenceScore: number;
  triageLevel: TriageLevel;
  clinicalReasoning: string[];
  suggestedActions: string[];
  educationalSummary: string;
  prescriptionGuidance?: string; // Guidance on what doctors might prescribe
  disclaimer: string;
}

export interface MediaInput {
  type: 'image' | 'audio';
  data: string; // Base64
  mimeType: string;
  preset?: 'THROAT' | 'SKIN' | 'WOUND' | 'GENERAL';
}

export interface AnalysisState {
  currentStep: DiagnosticStep;
  questions: MedicalQuestion[];
  answers: Record<string, string>;
  isAnalyzing: boolean;
  report: DiagnosticReport | null;
  error: string | null;
}
