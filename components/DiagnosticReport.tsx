
import React from 'react';
import { DiagnosticReport as ReportType, TriageLevel } from '../types';

interface Props {
  report: ReportType;
  onReset: () => void;
}

const DiagnosticReport: React.FC<Props> = ({ report, onReset }) => {
  const getTriageTheme = (level: string) => {
    if (level.includes('EMERGENCY')) return { bg: 'bg-red-500', text: 'text-red-900', light: 'bg-red-50', border: 'border-red-200' };
    if (level.includes('URGENT')) return { bg: 'bg-orange-500', text: 'text-orange-900', light: 'bg-orange-50', border: 'border-orange-200' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-900', light: 'bg-emerald-50', border: 'border-emerald-200' };
  };

  const theme = getTriageTheme(report.triageLevel);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className={`rounded-3xl shadow-xl overflow-hidden bg-white border ${theme.border}`}>
        <div className={`${theme.bg} p-6 text-white`}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Official Clinical Report</span>
              <h2 className="text-3xl font-black mt-1 leading-tight">{report.conditionName}</h2>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold opacity-80 uppercase">AI Confidence</div>
              <div className="text-3xl font-black">{Math.round(report.confidenceScore * 100)}%</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
             <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
             <span className="text-xs font-bold uppercase tracking-wider">{report.triageLevel} TRIAGE STATUS</span>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Doctor's Clinical Notes</h3>
            <ul className="space-y-4">
              {report.clinicalReasoning.map((reason, idx) => (
                <li key={idx} className="flex gap-4 group">
                  <div className={`w-6 h-6 rounded-full ${theme.bg} text-white flex items-center justify-center shrink-0 text-[10px] font-bold`}>{idx + 1}</div>
                  <p className="text-slate-700 text-sm font-medium leading-relaxed">{reason}</p>
                </li>
              ))}
            </ul>
          </section>

          {report.prescriptionGuidance && (
            <section className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Treatment Path
              </h3>
              <p className="text-sm text-blue-800 font-medium italic">"{report.prescriptionGuidance}"</p>
            </section>
          )}

          <section>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Immediate Actions</h3>
            <div className="grid gap-2">
              {report.suggestedActions.map((action, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-sm font-bold text-slate-800">{action}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="pt-6 border-t border-slate-100">
             <div className="flex gap-4">
                <button onClick={() => window.print()} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl text-sm active:scale-95 transition-all">SAVE PDF</button>
                <button onClick={onReset} className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-2xl text-sm active:scale-95 transition-all">NEW CONSULTATION</button>
             </div>
          </div>

          <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3">
             <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             <p className="text-[10px] text-red-800 leading-tight">
                <span className="font-black uppercase tracking-tighter">Legal Notice:</span> {report.disclaimer} This is an AI-assisted triage report and does not substitute a licensed human physical examination.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticReport;
