import React, { useState, useEffect } from 'react';
import { GeminiService } from './services/geminiService';
import { db } from './services/dbService';
import { AuditResult, AuditSession } from './types';
import AuditView from './components/AuditView';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudit, setCurrentAudit] = useState<AuditResult | null>(null);
  const [history, setHistory] = useState<AuditSession[]>([]);
  const [view, setView] = useState<'audit' | 'history'>('audit');
  const [hasKey, setHasKey] = useState<boolean>(true);

  // Check if API key is selected or present on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        // Also check if it's already in process.env (e.g. from environment variable)
        const inEnv = !!process.env.API_KEY;
        setHasKey(selected || inEnv);
      } else {
        setHasKey(!!process.env.API_KEY);
      }
    };
    checkKey();
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const savedAudits = await db.getAllAudits();
      setHistory(savedAudits);
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const handleOpenKeyDialog = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success as per guidelines to avoid race condition
      setHasKey(true);
      setError(null);
    }
  };

  const handleAudit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const auditor = new GeminiService();
      const result = await auditor.auditStatement(input);
      
      const session: AuditSession = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        founderStatement: input,
        result: result
      };
      
      await db.saveAudit(session);
      setCurrentAudit(result);
      setHistory(prev => [session, ...prev]);
    } catch (err: any) {
      const errMsg = err.message || "Audit interrupted by logical error.";
      setError(errMsg);
      
      // If the error explicitly mentions keys or missing entity, force the key selection flow
      if (errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("re-select") || errMsg.toLowerCase().includes("not found")) {
        setHasKey(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] p-6">
        <div className="apple-card p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">API Key Required</h2>
          <p className="text-[#86868B] mb-8">
            AuditLogic requires a Gemini API key to perform logical analysis. Please select a key or configure your environment.
          </p>
          <button onClick={handleOpenKeyDialog} className="apple-button w-full py-3 mb-4">
            Select API Key
          </button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-[#0071E3] hover:underline"
          >
            Learn more about Gemini API billing
          </a>
          {process.env.NODE_ENV === 'production' && (
            <p className="mt-4 text-[10px] text-gray-400">
              Note: Map 'GEMINI_API_KEY' secret to 'API_KEY' in Cloud Run settings.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <nav className="glass-header apple-blur px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('audit'); setCurrentAudit(null); }}>
            <div className="w-8 h-8 bg-[#1D1D1F] rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">A</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#1D1D1F]">AuditLogic</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex gap-6 text-sm font-medium">
              <button 
                onClick={() => setView('audit')}
                className={`${view === 'audit' ? 'text-[#0071E3]' : 'text-[#86868B]'} hover:text-[#0071E3] transition-colors`}
              >
                Auditor
              </button>
              <button 
                onClick={() => setView('history')}
                className={`${view === 'history' ? 'text-[#0071E3]' : 'text-[#86868B]'} hover:text-[#0071E3] transition-colors`}
              >
                History ({history.length})
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-12">
        {view === 'audit' ? (
          <>
            {!currentAudit ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="mb-12 text-center">
                  <h2 className="text-5xl font-extrabold tracking-tight mb-4 text-[#1D1D1F]">
                    Audit your logic.
                  </h2>
                  <p className="text-xl text-[#86868B] max-w-2xl mx-auto leading-relaxed">
                    Submit your strategy. We expose the blind spots.
                  </p>
                </header>

                <div className="apple-card p-8 border border-gray-100 relative overflow-hidden">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter your market thesis or strategy here..."
                    className="w-full h-48 apple-input p-5 text-lg leading-relaxed mb-6 resize-none"
                    disabled={loading}
                  />

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                      <span>{error}</span>
                      <button onClick={handleOpenKeyDialog} className="text-[#0071E3] font-bold hover:underline ml-4 whitespace-nowrap">
                        Fix Key
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#86868B] uppercase tracking-widest font-semibold">
                      Precision Logic Engine v1.0
                    </p>
                    <button
                      onClick={handleAudit}
                      disabled={loading || !input.trim()}
                      className={`apple-button px-10 py-3 flex items-center gap-2 ${loading || !input.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : 'Analyze Thesis'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="apple-card p-10 border border-gray-100">
                <div className="mb-6">
                  <button onClick={() => { setCurrentAudit(null); setInput(''); }} className="text-sm font-medium text-[#0071E3] hover:underline">
                    ← New Audit
                  </button>
                </div>
                <AuditView result={currentAudit} />
              </div>
            )}
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold mb-8">Audit Records</h2>
            {history.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-[#86868B]">No saved audits found on this device.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {history.map((session) => (
                  <div 
                    key={session.id} 
                    className="apple-card p-6 border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => {
                      setCurrentAudit(session.result);
                      setView('audit');
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-[#86868B]">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                        {session.result.riskAssessment.level} Risk
                      </span>
                    </div>
                    <p className="text-[#1D1D1F] font-medium line-clamp-1">{session.founderStatement}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;