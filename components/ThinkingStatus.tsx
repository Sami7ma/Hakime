
import React, { useState, useEffect } from 'react';

interface Props {
  step: string;
}

const ThinkingStatus: React.FC<Props> = ({ step }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + Math.random() * 5 : prev));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center space-y-6">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
          <circle className="text-emerald-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
          <circle 
            className="text-emerald-600" 
            strokeWidth="10" 
            strokeDasharray={2 * Math.PI * 40}
            strokeDashoffset={2 * Math.PI * 40 * (1 - progress / 100)}
            strokeLinecap="round" 
            stroke="currentColor" 
            fill="transparent" 
            r="40" cx="50" cy="50" 
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-slate-800">{step}</h3>
        <p className="text-sm text-slate-500 mt-2">MedScan Agent is reasoning through medical protocols...</p>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-emerald-600 h-full transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 w-full">
        <div className="text-[10px] bg-slate-50 p-2 rounded border border-slate-200 text-slate-400">
          Thinking Budget: 4k tokens
        </div>
        <div className="text-[10px] bg-slate-50 p-2 rounded border border-slate-200 text-slate-400">
          Model: Gemini 3 Flash
        </div>
      </div>
    </div>
  );
};

export default ThinkingStatus;
