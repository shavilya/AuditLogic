export interface AuditResult {
  detectedBiases: string[];
  evidence: string;
  reasoningFlaws: string[];
  weakAssumptions: string[];
  counterHypotheses: string[];
  killCriteria: string[];
  riskAssessment: {
    level: 'Low' | 'Moderate' | 'High' | 'Extreme';
    summary: string;
  };
}

export interface AuditSession {
  id: string;
  timestamp: number;
  founderStatement: string;
  result: AuditResult;
}