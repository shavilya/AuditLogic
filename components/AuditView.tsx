
import React from 'react';
import { AuditResult } from '../types';

interface AuditViewProps {
  result: AuditResult;
}

const Section: React.FC<{ title: string; children: React.ReactNode; color?: string }> = ({ title, children, color = "text-[#1D1D1F]" }) => (
  <div className="mb-8 border-b border-gray-100 pb-8 last:border-0">
    <h3 className={`text-xs font-semibold uppercase tracking-widest ${color} mb-4 opacity-60`}>
      {title}
    </h3>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

const AuditView: React.FC<AuditViewProps> = ({ result }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Extreme': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Moderate': return 'bg-yellow-400 text-black';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Logic Audit Report</h2>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getRiskColor(result.riskAssessment.level)}`}>
          {result.riskAssessment.level} Risk
        </div>
      </div>

      <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-600 leading-relaxed">
        <span className="font-bold text-gray-900 not-italic mr-2">Audit Verdict:</span>
        "{result.riskAssessment.summary}"
      </div>

      <Section title="1. Detected Cognitive Biases" color="text-[#0071E3]">
        <div className="flex flex-wrap gap-2">
          {result.detectedBiases.map((bias, i) => (
            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
              {bias}
            </span>
          ))}
        </div>
      </Section>

      <Section title="2. Evidence From Statement">
        <p className="text-[#1D1D1F] leading-relaxed">
          {result.evidence}
        </p>
      </Section>

      <Section title="3. Reasoning Flaws" color="text-red-600">
        <ul className="list-disc pl-5 space-y-2">
          {result.reasoningFlaws.map((flaw, i) => (
            <li key={i} className="text-[#1D1D1F]">{flaw}</li>
          ))}
        </ul>
      </Section>

      <Section title="4. Missing or Weak Assumptions">
        <ul className="space-y-3">
          {result.weakAssumptions.map((assumption, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-gray-400 font-mono text-xs mt-1">[{i+1}]</span>
              <span className="text-[#424245]">{assumption}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="5. Counter-Hypotheses" color="text-indigo-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.counterHypotheses.map((hypo, i) => (
            <div key={i} className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100 text-indigo-900 text-sm italic">
              "{hypo}"
            </div>
          ))}
        </div>
      </Section>

      <Section title="6. Kill Criteria" color="text-red-700">
        <div className="space-y-2">
          {result.killCriteria.map((criterion, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-red-50/50 rounded-lg border border-red-100">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-red-900 font-medium text-sm">{criterion}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default AuditView;
