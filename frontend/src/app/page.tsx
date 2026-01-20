'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Candidate {
  id?: string;
  name: string;
  score: number;
  ranking: string;
  interview_questions: string[];
}

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = 'https://curly-space-garbanzo-96wq66gxrp39p76-8000.app.github.dev';

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/candidates`);
      setCandidates(res.data);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    // Optional: Auto-refresh every 10 seconds
    const interval = setInterval(fetchCandidates, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* Title & Description */}
        <header className="text-center mb-12 lg:mb-20">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-yellow-400 mb-6 tracking-tight">
            Smart Faculty Recruitment
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            AI-powered faculty hiring made simple, unbiased, and efficient
          </p>
          <p className="text-base sm:text-lg text-gray-500 mt-8">
            Team ParaakramAI • MHACK_040F • MCKVIE Hackathon 2025
          </p>
        </header>

        {/* Get Started Button */}
        <div className="flex justify-center mb-16 lg:mb-20">
          <Link
            href="/upload"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-5 px-12 rounded-full text-xl lg:text-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-yellow-400/50"
          >
            Get Started →
          </Link>
        </div>

        {/* Ranked Shortlist Card */}
        <section className="bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-700">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-10 text-yellow-300">
            Ranked Shortlist
          </h2>

          {loading ? (
            <p className="text-center text-gray-400 text-xl">Loading candidates...</p>
          ) : candidates.length === 0 ? (
            <p className="text-center text-gray-400 text-xl">
              No candidates analyzed yet. Upload a resume to get started!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-gray-600">
                    <th className="text-left py-6 px-6 text-yellow-400 text-lg lg:text-xl uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="text-left py-6 px-6 text-yellow-400 text-lg lg:text-xl uppercase tracking-wider">
                      Score
                    </th>
                    <th className="text-left py-6 px-6 text-yellow-400 text-lg lg:text-xl uppercase tracking-wider">
                      Ranking
                    </th>
                    <th className="text-left py-6 px-6 text-yellow-400 text-lg lg:text-xl uppercase tracking-wider">
                      Interview Questions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, i) => (
                    <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                      <td className="py-8 px-6 text-lg lg:text-xl font-semibold">
                        {c.name}
                      </td>
                      <td className="py-8 px-6">
                        <span
                          className={`text-3xl lg:text-4xl font-bold ${
                            c.score > 80
                              ? 'text-green-400'
                              : c.score > 50
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}
                        >
                          {c.score.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-8 px-6">
                        <span
                          className={`px-6 py-3 rounded-full text-base lg:text-lg font-bold ${
                            c.ranking === 'High'
                              ? 'bg-green-900/70 text-green-300'
                              : c.ranking === 'Medium'
                              ? 'bg-yellow-900/70 text-yellow-300'
                              : 'bg-red-900/70 text-red-300'
                          }`}
                        >
                          {c.ranking}
                        </span>
                      </td>
                      <td className="py-8 px-6 text-base lg:text-lg">
                        <ol className="list-decimal list-inside space-y-3 text-gray-200">
                          {c.interview_questions.map((q, idx) => (
                            <li key={idx}>{q}</li>
                          ))}
                        </ol>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}