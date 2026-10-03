import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatAPI, documentAPI } from '../services/api';

export default function Chat() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [docName, setDocName] = useState('');
  const messagesEnd = useRef(null);

  useEffect(() => {
    documentAPI.get(documentId).then(res => setDocName(res.data.data.originalFilename));
    chatAPI.history(documentId).then(res => {
      const history = (res.data.data || []).reverse().map(function(m) {
        return { role: 'user', text: m.question };
      }).reduce(function(acc, msg, i, arr) {
        acc.push(msg);
        if (i < arr.length) {
          acc.push({ role: 'ai', text: m.answer || 'No answer', refs: m.referencedClauses });
        }
        return acc;
      }, []);
      setMessages(history);
    });
  }, [documentId]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggested = [
    'What are my biggest risks?',
    'Can I terminate this agreement?',
    'What penalties can I face?',
    'What payments am I responsible for?',
    'Explain the riskiest clause in simple terms',
  ];

  const handleSend = async (question) => {
    if (!question.trim() || loading) return;
    setInput('');
    setMessages(function(prev) { return [...prev, { role: 'user', text: question }]; });
    setLoading(true);

    try {
      const res = await chatAPI.ask(documentId, question);
      const data = res.data.data;
      setMessages(function(prev) {
        return [...prev, { role: 'ai', text: data.answer, refs: data.referencedClauses, disclaimer: data.disclaimer }];
      });
    } catch (err) {
      setMessages(function(prev) {
        return [...prev, { role: 'ai', text: 'Sorry, an error occurred. Please try again.' }];
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/documents/' + documentId)} className="text-slate-400 hover:text-white text-sm">Back</button>
          <div className="text-xl font-bold">Ask <span className="text-blue-400">LexiLens</span></div>
        </div>
        <span className="text-slate-400 text-sm truncate max-w-xs">{docName}</span>
      </nav>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-4xl mx-auto w-full">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-slate-300">This assistant answers questions using your uploaded document.</p>
        </div>

        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-6">Try asking:</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
              {suggested.map(function(q, i) {
                return (
                  <button key={i} onClick={function() { handleSend(q); }}
                    className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-300 hover:border-blue-500 hover:text-white transition">
                    {q}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {messages.map(function(msg, i) {
          return (
            <div key={i} className={'mb-4 flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={'max-w-3xl rounded-xl p-4 ' + (msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-200')}>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                {msg.refs && msg.refs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <p className="text-xs text-slate-400">Referenced clauses: {msg.refs.join(', ')}</p>
                  </div>
                )}
                {msg.disclaimer && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <p className="text-xs text-slate-500">{msg.disclaimer}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEnd} />
      </div>

      <div className="border-t border-slate-700 px-8 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input value={input} onChange={function(e) { setInput(e.target.value); }}
            onKeyDown={function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
            placeholder="Ask a question about this document..."
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
            disabled={loading} />
          <button onClick={function() { handleSend(input); }} disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
