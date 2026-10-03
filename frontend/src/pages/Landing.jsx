import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav className="flex items-center justify-between px-8 py-4">
        <div className="text-2xl font-bold text-white">LexiLens <span className="text-blue-400">AI</span></div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 text-white hover:text-blue-300 transition">Login</Link>
          <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Get Started</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">
          Understand Your Legal Documents.<br />
          <span className="text-blue-400">Before You Sign.</span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto">
          LexiLens AI simplifies complex legal language, detects risky clauses, explains financial obligations, 
          and lets you ask questions about your documents — all powered by AI.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/upload" className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
            Upload Document
          </Link>
          <Link to="/register" className="px-8 py-3 border border-white text-white rounded-lg text-lg font-semibold hover:bg-white/10 transition">
            Get Started Free
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: '📋', title: 'Simplify Legal Language', desc: 'Convert complex clauses into plain English explanations anyone can understand.' },
          { icon: '⚠️', title: 'Detect Risky Clauses', desc: 'Identify potentially dangerous clauses with risk scores and severity levels.' },
          { icon: '💬', title: 'Ask AI Questions', desc: 'Chat with an AI that answers based on your specific document content.' },
          { icon: '🌍', title: 'Multilingual Support', desc: 'Get explanations translated into Tamil, Hindi, Malayalam, Telugu, and Kannada.' },
          { icon: '💰', title: 'Financial Impact', desc: 'Understand monetary obligations, penalties, and hidden fees before signing.' },
          { icon: '📊', title: 'Risk Dashboard', desc: 'Visual overview of all your documents with risk distribution charts.' },
        ].map((f, i) => (
          <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center py-8 text-slate-500 text-sm">
        <p>LexiLens AI provides informational assistance for understanding legal documents.</p>
        <p>It does not provide legal advice and does not replace consultation with a qualified legal professional.</p>
      </div>
    </div>
  );
}
