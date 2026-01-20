'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDept, setJobDept] = useState('Computer Science');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = 'https://curly-space-garbanzo-96wq66gxrp39p76-8000.app.github.dev';

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/upload-resume?job_dept=${encodeURIComponent(jobDept)}`,
        formData,
        { timeout: 60000 } // 60s timeout for AI processing
      );
      setResult(res.data);
    } catch (err: any) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 lg:p-16 border border-gray-700">
        <h1 className="text-5xl lg:text-6xl font-bold text-yellow-400 text-center mb-10">
          Upload Resume
        </h1>

        <Link
          href="/"
          className="inline-block mb-10 text-blue-400 hover:text-blue-300 text-lg transition"
        >
          ← Back to Dashboard
        </Link>

        <div className="space-y-10">
          <div>
            <label className="block text-xl font-medium mb-4">Department</label>
            <input
              type="text"
              value={jobDept}
              onChange={(e) => setJobDept(e.target.value)}
              className="w-full px-6 py-5 bg-gray-700 border border-gray-600 rounded-2xl focus:outline-none focus:border-yellow-400 text-lg transition"
              placeholder="e.g., Computer Science"
            />
          </div>

          <div>
            <label className="block text-xl font-medium mb-4">Resume (PDF only)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-6 py-5 bg-gray-700 border border-gray-600 rounded-2xl file:bg-yellow-400 file:text-black file:font-bold file:py-4 file:px-8 file:rounded-full file:border-0 file:cursor-pointer hover:file:bg-yellow-500 transition text-lg"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-6 rounded-full text-2xl shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            {loading ? 'Analyzing with AI...' : 'Analyze Resume'}
          </button>
        </div>

        {error && (
          <p className="mt-10 text-red-400 text-center text-xl font-medium">{error}</p>
        )}

        {result && (
          <div className="mt-12 p-10 bg-gray-700/80 rounded-3xl border border-gray-600">
            <h2 className="text-4xl font-bold text-green-400 text-center mb-8">
              Analysis Complete!
            </h2>
            <div className="space-y-6 text-xl">
              <p className="text-center"><strong>Candidate:</strong> {result.name}</p>
              <p className="text-center">
                <strong>Score:</strong>{' '}
                <span className="text-5xl font-bold text-yellow-400 mx-4">
                  {result.score.toFixed(1)}
                </span>
              </p>
              <p className="text-center">
                <strong>Ranking:</strong>{' '}
                <span
                  className={`inline-block px-8 py-3 rounded-full text-2xl font-bold ${
                    result.ranking === 'High'
                      ? 'bg-green-900/70 text-green-300'
                      : result.ranking === 'Medium'
                      ? 'bg-yellow-900/70 text-yellow-300'
                      : 'bg-red-900/70 text-red-300'
                  }`}
                >
                  {result.ranking}
                </span>
              </p>
            </div>
            <div className="mt-10">
              <h3 className="text-3xl font-bold mb-6 text-center">Suggested Interview Questions</h3>
              <ol className="list-decimal list-inside space-y-4 text-lg lg:text-xl text-gray-200">
                {result.interview_questions.map((q: string, i: number) => (
                  <li key={i} className="pl-2">{q}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}