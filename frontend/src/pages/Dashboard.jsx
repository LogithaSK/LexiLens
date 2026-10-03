import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, documentAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = { LOW: '#22c55e', MEDIUM: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardAPI.summary().then(res => setSummary(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-700">
        <div className="text-xl font-bold">LexiLens <span className="text-blue-400">AI</span></div>
        <div className="flex items-center gap-6">
          <Link to="/upload" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-sm">Upload New</Link>
          <span className="text-slate-400 text-sm">{user?.name}</span>
          <button onClick={logout} className="text-slate-400 hover:text-white text-sm">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Documents', value: summary?.totalDocuments || 0, color: 'blue' },
            { label: 'Analyzed', value: summary?.analyzedDocuments || 0, color: 'green' },
            { label: 'High Risk Clauses', value: summary?.highRiskClauses || 0, color: 'orange' },
            { label: 'Critical Risks', value: summary?.criticalRisks || 0, color: 'red' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">{s.label}</p>
              <p className={`text-3xl font-bold text-${s.color}-400 mt-1`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Recent Documents</h2>
            <div className="space-y-3">
              {summary?.recentDocuments?.length === 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center text-slate-400">
                  No documents yet. <Link to="/upload" className="text-blue-400 hover:underline">Upload your first document</Link>
                </div>
              )}
              {summary?.recentDocuments?.map((doc) => (
                <div key={doc.id} onClick={() => navigate(`/documents/${doc.id}`)}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-blue-500 transition flex items-center justify-between">
                  <div>
                    <p className="font-medium">{doc.originalFilename}</p>
                    <p className="text-sm text-slate-400">{doc.documentType || 'Unclassified'} · {doc.processingStatus}</p>
                  </div>
                  {doc.overallRiskLevel && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      doc.overallRiskLevel === 'LOW' ? 'bg-green-500/20 text-green-400' :
                      doc.overallRiskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                      doc.overallRiskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{doc.overallRiskLevel} ({doc.overallRiskScore})</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Risk Distribution</h2>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              {summary?.riskDistribution?.some(r => r.value > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={summary.riskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                      {summary.riskDistribution.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 text-center py-10">No risk data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
