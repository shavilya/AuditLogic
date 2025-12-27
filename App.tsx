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

  // Load history from Dexie DB
  const loadHistory = async () => {
    const savedAudits = await db.getAllAudits();
    setHistory(savedAudits);
  };

  useEffect(() => {
    loadHistory();
  }, []);

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
      setError(err.message || "Audit interrupted by logical error.");
    } finally {
      setLoading(false);
    }
  };

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
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                      {error}
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
                      {loading ? 'Auditing Logic...' : 'Analyze Thesis'}
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