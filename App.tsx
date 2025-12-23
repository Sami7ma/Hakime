
import React, { useState, useRef } from 'react';
import Header from './components/Header';
import { generateQuestionnaire, analyzeMedicalCase } from './services/geminiService';
import { MediaInput, AnalysisState, DiagnosticStep, TriageLevel } from './types';
import ThinkingStatus from './components/ThinkingStatus';
import DiagnosticReport from './components/DiagnosticReport';

const App: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [inputs, setInputs] = useState<MediaInput[]>([]);
  const [state, setState] = useState<AnalysisState>({
    currentStep: DiagnosticStep.SYMPTOMS,
    questions: [],
    answers: {},
    isAnalyzing: false,
    report: null,
    error: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerEmergency = () => {
    // Immediate bypass to emergency triage
    setState({
        currentStep: DiagnosticStep.REPORT,
        questions: [],
        answers: { "URGENT_BYPASS": "YES" },
        isAnalyzing: false,
        report: {
            conditionName: "IMMEDIATE LIFE THREAT ASSESSMENT",
            confidenceScore: 1.0,
            triageLevel: TriageLevel.EMERGENCY,
            clinicalReasoning: ["Patient triggered red-line emergency protocol.", "High-risk symptoms detected via bypass."],
            suggestedActions: ["Call 112 / 999 immediately.", "Do not wait for further AI analysis.", "Locate nearest trauma center."],
            educationalSummary: "HAKIM emergency protocol activated due to severity.",
            disclaimer: "EMERGENCY: Seek human physician immediately."
        },
        error: null
    });
  };

  const startIntake = async () => {
    if (!symptoms.trim()) return;
    setState(prev => ({ ...prev, isAnalyzing: true }));
    try {
      const questions = await generateQuestionnaire(symptoms);
      setState(prev => ({ 
        ...prev, 
        questions, 
        currentStep: DiagnosticStep.QUESTIONNAIRE, 
        isAnalyzing: false 
      }));
    } catch (err) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: "Clinical gateway error." }));
    }
  };

  const submitAnswers = () => {
    setState(prev => ({ ...prev, currentStep: DiagnosticStep.VISION_SCAN }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, preset?: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      const newInput: MediaInput = {
        type: file.type.startsWith('audio') ? 'audio' : 'image',
        data: base64String,
        mimeType: file.type,
        preset: preset || 'GENERAL'
      };
      setInputs(prev => [...prev, newInput]);
    };
    reader.readAsDataURL(file);
  };

  const runFinalAnalysis = async () => {
    setState(prev => ({ ...prev, currentStep: DiagnosticStep.ANALYZING, isAnalyzing: true }));
    try {
      const report = await analyzeMedicalCase(inputs, symptoms, state.answers);
      setState(prev => ({ ...prev, isAnalyzing: false, report, currentStep: DiagnosticStep.REPORT }));
    } catch (err) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: "MD Analysis failed." }));
    }
  };

  const reset = () => {
    setSymptoms('');
    setInputs([]);
    setState({
      currentStep: DiagnosticStep.SYMPTOMS,
      questions: [],
      answers: {},
      isAnalyzing: false,
      report: null,
      error: null
    });
  };

  return (
    <div className="min-h-screen pb-32 bg-slate-50">
      <Header />

      <main className="max-w-md mx-auto p-4 space-y-6">
        {state.isAnalyzing && state.currentStep === DiagnosticStep.ANALYZING ? (
          <ThinkingStatus step="HAKIM is reasoning through clinical patterns..." />
        ) : state.report ? (
          <DiagnosticReport report={state.report} onReset={reset} />
        ) : state.currentStep === DiagnosticStep.SYMPTOMS ? (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* BIG EMERGENCY BUTTON */}
            <button 
              onClick={triggerEmergency}
              className="emergency-pulse w-full bg-red-600 text-white p-6 rounded-3xl flex items-center justify-between group shadow-xl shadow-red-200"
            >
              <div className="text-left">
                <h3 className="text-xl font-black uppercase tracking-tighter">EMERGENCY?</h3>
                <p className="text-xs font-medium opacity-80 italic">Severe pain, bleeding, or breathing issues</p>
              </div>
              <svg className="w-10 h-10 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </button>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                Begin Consultation
                <span className="text-emerald-500">_</span>
              </h2>
              <p className="text-slate-500 text-sm mt-1 font-medium">Describe symptoms for HAKIM analysis.</p>
              <textarea 
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Ex: I have a severe sore throat with white spots on my tonsils. My temperature is high."
                className="w-full h-48 mt-4 p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white text-lg outline-none transition-all"
              />
              <button 
                onClick={startIntake}
                disabled={!symptoms.trim() || state.isAnalyzing}
                className="w-full mt-6 bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all text-lg tracking-tight uppercase"
              >
                {state.isAnalyzing ? "ACCESSING HAKIM ENGINE..." : "START MD CONSULTATION"}
              </button>
            </div>
          </section>
        ) : state.currentStep === DiagnosticStep.QUESTIONNAIRE ? (
          <section className="space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Clinical Interview</h2>
                <div className="h-1 w-12 bg-emerald-500 mt-2 rounded-full"></div>
              </div>

              {state.questions.map((q) => (
                <div key={q.id} className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 leading-tight block">{q.question}</label>
                  {q.type === 'boolean' ? (
                    <div className="grid grid-cols-2 gap-3">
                      {['Yes', 'No'].map(val => (
                        <button 
                          key={val}
                          onClick={() => setState(prev => ({ ...prev, answers: { ...prev.answers, [q.id]: val } }))}
                          className={`py-4 rounded-2xl border-2 font-black transition-all ${state.answers[q.id] === val ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input 
                      type="text"
                      placeholder="Type details..."
                      className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-emerald-500 transition-all"
                      onChange={(e) => setState(prev => ({ ...prev, answers: { ...prev.answers, [q.id]: e.target.value } }))}
                    />
                  )}
                </div>
              ))}
              <button 
                onClick={submitAnswers}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-2xl uppercase tracking-widest text-sm"
              >
                PROCEED TO PHYSICAL EXAM
              </button>
            </div>
          </section>
        ) : (
          <section className="space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tighter">Diagnostic Imaging</h2>
              
              <div className="grid grid-cols-1 gap-4 mb-8">
                {[
                  { label: 'OPEN MOUTH (TONSILS)', id: 'THROAT', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM9 9h6v2H9V9z', color: 'bg-orange-50 text-orange-600 border-orange-100' },
                  { label: 'CLOSE-UP SKIN LESION', id: 'SKIN', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                  { label: 'WOUND DEPTH / TRAUMA', id: 'WOUND', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'bg-blue-50 text-blue-600 border-blue-100' }
                ].map(p => (
                  <button 
                    key={p.id}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-5 rounded-2xl border flex items-center gap-4 hover:scale-[1.02] transition-all active:scale-95 ${p.color}`}
                  >
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.icon} /></svg>
                    </div>
                    <span className="text-sm font-black uppercase tracking-tight">{p.label}</span>
                  </button>
                ))}
              </div>

              {inputs.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-8">
                  {inputs.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={`data:${img.mimeType};base64,${img.data}`} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/20" />
                      <div className="absolute -top-2 -right-2 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">✓</div>
                    </div>
                  ))}
                </div>
              )}

              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e)} />

              <button 
                onClick={runFinalAnalysis}
                disabled={inputs.length === 0}
                className={`w-full py-5 rounded-2xl font-black transition-all text-lg tracking-widest ${inputs.length > 0 ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-xl' : 'bg-slate-100 text-slate-400'}`}
              >
                EXECUTE DIAGNOSTIC REPORT
              </button>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER STATS */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 md:hidden flex justify-between items-center z-40">
        <div className="flex gap-4">
           <div className="text-center">
              <div className="text-[10px] font-black text-slate-400 uppercase">Context</div>
              <div className="text-xs font-bold text-slate-700">{symptoms ? 'Active' : 'Empty'}</div>
           </div>
           <div className="text-center">
              <div className="text-[10px] font-black text-slate-400 uppercase">Samples</div>
              <div className="text-xs font-bold text-slate-700">{inputs.length}</div>
           </div>
        </div>
        <button onClick={reset} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black tracking-widest uppercase">Reset</button>
      </footer>
    </div>
  );
};

export default App;
