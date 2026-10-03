import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { documentAPI } from '../services/api';

const RISK_COLORS = {
  LOW: 'bg-green-500/20 text-green-400 border-green-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function DocumentAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClause, setSelectedClause] = useState(null);
  const [selectedLang, setSelectedLang] = useState('en');

  useEffect(() => {
    documentAPI.get(id).then(res => {
      setDoc(res.data.data);
      if (res.data.data.clauses?.length > 0) {
        setSelectedClause(res.data.data.clauses[0]);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  if (!doc) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Document not found</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-700">
        <div className="text-xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>LexiLens <span className="text-blue-400">AI</span></div>
        <div className="flex items-center gap-4">
          <Link to={'/chat/' + id} className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-sm">Ask AI</Link>
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white text-sm">Dashboard</button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Left: Clauses */}
        <div className="w-80 border-r border-slate-700 overflow-y-auto bg-slate-800/50">
          <div className="p-4 border-b border-slate-700">
            <h2 className="font-semibold text-sm">Clauses ({doc.clauses?.length || 0})</h2>
          </div>
          <div className="p-2 space-y-1">
            {doc.clauses?.map((clause) => (
              <div key={clause.id}
                onClick={() => setSelectedClause(clause)}
                className={`p-3 rounded-lg cursor-pointer text-sm transition ${
                  selectedClause?.id === clause.id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-slate-700/50'
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">#{clause.clauseNumber} {clause.title}</span>
                  {clause.riskLevel && (
                    <span className={'px-2 py-0.5 rounded text-xs font-semibold border ' + (RISK_COLORS[clause.riskLevel] || 'bg-slate-600 text-slate-300')}>
                      {clause.riskLevel}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-xs truncate">{clause.category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Analysis */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl">
            <h1 className="text-2xl font-bold mb-1">{doc.originalFilename}</h1>
            <p className="text-slate-400 text-sm mb-6">{doc.documentType || 'Unclassified'} · {doc.processingStatus}</p>

            {/* Overall Risk */}
            {doc.overallRiskLevel && (
              <div className={'inline-flex items-center gap-3 px-5 py-3 rounded-xl border mb-6 ' + (RISK_COLORS[doc.overallRiskLevel] || '')}>
                <div>
                  <p className="text-sm opacity-70">Overall Risk</p>
                  <p className="text-2xl font-bold">{doc.overallRiskScore}/100</p>
                </div>
                <span className="text-lg font-semibold">{doc.overallRiskLevel}</span>
              </div>
            )}

            {/* Summary */}
            {doc.summary && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                <h2 className="font-semibold mb-3">Document Summary</h2>
                <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{doc.summary}</div>
              </div>
            )}

            {/* Key Findings */}
            {doc.keyFindings && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                <h2 className="font-semibold mb-3">Key Findings</h2>
                <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{doc.keyFindings}</div>
              </div>
            )}

            {/* Selected Clause Detail */}
            {selectedClause && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Clause #{selectedClause.clauseNumber}: {selectedClause.title}</h2>
                  <span className={'px-3 py-1 rounded-full text-xs font-semibold border ' + (RISK_COLORS[selectedClause.riskLevel] || 'bg-slate-600 text-slate-300')}>
                    Risk: {selectedClause.riskLevel || 'N/A'} ({selectedClause.riskScore || 0}/100)
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Original Clause</h3>
                    <p className="text-sm text-slate-300 bg-slate-900/50 p-4 rounded-lg border border-slate-600 leading-relaxed">{selectedClause.originalText}</p>
                  </div>

                  {selectedClause.simplifiedText && (
                    <div>
                      <h3 className="text-sm font-medium text-blue-400 mb-2">Plain English Explanation</h3>
                      <p className="text-sm text-slate-200 bg-blue-500/5 p-4 rounded-lg border border-blue-500/20 leading-relaxed">{selectedClause.simplifiedText}</p>
                    </div>
                  )}

                  {selectedClause.risks?.map((risk, i) => (
                    <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-slate-600">
                      <h3 className="text-sm font-medium text-orange-400 mb-2">Risk Analysis: {risk.riskType}</h3>
                      <p className="text-sm text-slate-300 mb-2">{risk.reason}</p>
                      {risk.financialImpact && (
                        <p className="text-sm text-yellow-400 mb-2">Financial Impact: {risk.financialImpact}</p>
                      )}
                      {risk.recommendation && (
                        <p className="text-sm text-green-400">Recommendation: {risk.recommendation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center py-4 text-slate-500 text-xs">
              LexiLens AI provides informational assistance. It does not provide legal advice.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
