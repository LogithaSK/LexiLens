import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentAPI } from '../services/api';

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setProgress(10);
    setStatus('Uploading document...');

    try {
      setProgress(30);
      const uploadRes = await documentAPI.upload(file);
      const docId = uploadRes.data.data.id;
      setProgress(60);
      setStatus('Starting AI analysis...');

      await documentAPI.analyze(docId);
      setProgress(80);
      setStatus('Analyzing document (this may take a minute)...');

      let attempts = 0;
      while (attempts < 60) {
        await new Promise(function(r) { setTimeout(r, 3000); });
        const detail = await documentAPI.get(docId);
        const procStatus = detail.data.data.processingStatus;
        if (procStatus === 'COMPLETED') {
          setProgress(100);
          setStatus('Analysis complete!');
          navigate('/documents/' + docId);
          return;
        }
        if (procStatus === 'FAILED') {
          setError('Analysis failed. Please try again.');
          setUploading(false);
          return;
        }
        attempts++;
        setProgress(Math.min(95, 60 + attempts));
      }
      setError('Analysis is taking longer than expected. Check your dashboard.');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-700">
        <div className="text-xl font-bold">LexiLens <span className="text-blue-400">AI</span></div>
        <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white text-sm">Back to Dashboard</button>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-16">
        <h1 className="text-2xl font-bold mb-2">Upload Document</h1>
        <p className="text-slate-400 mb-8">Supported formats: PDF, DOCX, PNG, JPG (max 20MB)</p>

        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition cursor-pointer ${
            dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input id="file-input" type="file" className="hidden" accept=".pdf,.docx,.png,.jpg,.jpeg"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
          <div className="text-4xl mb-4">📄</div>
          {file ? (
            <div>
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-slate-400 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <p className="text-slate-300">Drag & drop your file here or click to browse</p>
              <p className="text-slate-500 text-sm mt-2">PDF, DOCX, PNG, JPG up to 20MB</p>
            </div>
          )}
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mt-4 text-sm">{error}</div>}

        {uploading && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">{status}</span>
              <span className="text-blue-400">{progress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{width: progress + '%'}}></div>
            </div>
          </div>
        )}

        <button onClick={handleUpload} disabled={!file || uploading}
          className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {uploading ? 'Processing...' : 'Upload & Analyze'}
        </button>
      </div>
    </div>
  );
}
