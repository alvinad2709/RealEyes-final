import { useState } from 'react';
import axios from 'axios';
import { AlignLeft, Link as LinkIcon, ShieldCheck, AlertTriangle, ShieldAlert, Zap, BookOpen, Hash, BrainCircuit } from 'lucide-react';
import clsx from 'clsx';

export default function FakeNews() {
  const [activeTab, setActiveTab] = useState('text');
  const [inputValue, setInputValue] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const startAnalysis = async () => {
    if (!inputValue.trim()) return;
    
    setAnalyzing(true);
    setResults(null);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/tools/factcheck', {
        query: inputValue
      });

      setResults(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to reach RealEyes Backend");
    } finally {
       setAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Left Column - Input Panel */}
      <div className="space-y-6">
        
        {/* Input Tabs */}
        <div className="flex items-center gap-4 border-b border-deepBorder pb-2">
          <button 
            className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all", activeTab === 'text' ? "bg-deepRed/10 text-deepRed border border-deepRed/30" : "text-textMuted hover:text-white")}
            onClick={() => { setActiveTab('text'); setInputValue(''); setResults(null); setError(null); }}
          >
            <AlignLeft className="w-4 h-4" /> Text Search
          </button>
          <button 
            className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all", activeTab === 'url' ? "bg-deepCard text-white border border-deepBorder" : "text-textMuted hover:text-white")}
            onClick={() => { setActiveTab('url'); setInputValue(''); setResults(null); setError(null); }}
          >
            <LinkIcon className="w-4 h-4" /> URL Scan
          </button>
        </div>

        {/* Input Area */}
        {activeTab === 'text' ? (
          <div className="w-full relative">
             <textarea 
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               placeholder="Paste any article headline, claim, or quote... LLaMA-3 will forensically evaluate the payload."
               className="w-full h-64 bg-deepCard border border-deepBorder rounded-xl p-4 text-sm text-gray-300 resize-none focus:outline-none focus:border-deepRed/50 focus:bg-deepBase transition-all placeholder:text-textMuted/50 font-mono"
             />
          </div>
        ) : (
          <div className="w-full h-64 rounded-xl border border-deepBorder bg-deepCard flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <LinkIcon className="w-8 h-8 text-textMuted mb-4" />
            <p className="text-sm text-gray-300 font-medium tracking-wide mb-4">Paste news article URL for deep remote extraction</p>
            <input 
              type="url" 
              placeholder="https://news-site.com/breaking-story"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full max-w-md bg-deepBase border border-deepBorder rounded-lg px-4 py-3 text-white focus:outline-none focus:border-deepRed/50 placeholder:text-textMuted/50 font-mono text-sm"
            />
          </div>
        )}

        {error && (
           <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-xs font-mono text-white flex items-center justify-center gap-2">
             <AlertTriangle className="w-4 h-4" /> {error}
           </div>
        )}

        <button 
          onClick={startAnalysis}
          disabled={!inputValue.trim() || analyzing}
          className={clsx(
            "w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300",
            analyzing ? "bg-deepBase text-textMuted border border-deepBorder" 
            : "bg-deepRed/10 border border-deepRed text-deepRed hover:bg-deepRed/20 hover:glow-red disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {analyzing ? (
            <><div className="w-5 h-5 border-2 border-textMuted border-t-white rounded-full animate-spin" /> EXECUTING NEURAL INFERENCE...</>
          ) : (
             <><Zap className="w-5 h-5 fill-current animate-pulse" /> INITIALIZE LLM ANALYSIS</>
          )}
        </button>

      </div>

      {/* Right Column - Results Panel */}
      <div className={clsx("glass-panel p-6 border transition-all duration-500", 
        !results ? "border-deepBorder opacity-50" : 
        results.status === 'FAKE' ? "border-deepRed" : 
        results.status === 'SUSPICIOUS' ? "border-yellow-500" : 
        results.status === 'REAL' ? "border-deepGreen" : "border-gray-500"
      )}>
        {!results && !analyzing && (
           <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
             <BrainCircuit className="w-12 h-12 text-deepBorder" />
             <p className="text-textMuted text-sm">Provide news text or a URL and let RealEyes's LLaMA engine dissect it.</p>
           </div>
        )}

        {analyzing && (
           <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-16 h-16 rounded-full border-4 border-deepBorder border-t-deepRed animate-spin" />
             <div className="space-y-2">
                <p className="text-sm font-mono text-white animate-pulse">Groq Inference Engine Processing...</p>
                <p className="text-xs text-textMuted">Running zero-shot classification matrix</p>
             </div>
           </div>
        )}

        {results && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Header Result */}
            <div className="flex items-center justify-between border-b border-deepBorder/50 pb-6">
              <div className="flex items-center gap-3">
                <div className={clsx("p-2 rounded-lg", 
                  results.status === 'FAKE' ? "bg-deepRed/20" : 
                  results.status === 'SUSPICIOUS' ? "bg-yellow-500/20" : "bg-deepGreen/20"
                )}>
                  {results.status === 'FAKE' && <ShieldAlert className="w-6 h-6 text-deepRed" />}
                  {results.status === 'SUSPICIOUS' && <AlertTriangle className="w-6 h-6 text-yellow-500" />}
                  {results.status === 'REAL' && <ShieldCheck className="w-6 h-6 text-deepGreen" />}
                </div>
                <span className={clsx("font-display font-bold text-xl tracking-wider border px-3 py-1 rounded-md", 
                   results.status === 'FAKE' ? "text-deepRed bg-deepRed/10 border-deepRed/30" : 
                   results.status === 'SUSPICIOUS' ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/30" : "text-deepGreen bg-deepGreen/10 border-deepGreen/30"
                )}>
                  {results.status}
                </span>
              </div>
              <span className={clsx("font-mono text-4xl font-bold", 
                  results.status === 'FAKE' ? "text-deepRed glow-text-red" : 
                  results.status === 'SUSPICIOUS' ? "text-yellow-500" : "text-deepGreen glow-text-green"
              )}>
                {results.confidence}% <span className="text-sm text-textMuted tracking-normal">CONFIDENCE</span>
              </span>
            </div>

            {/* AI Explanation block */}
            <div className="space-y-3">
               <div className="text-xs font-mono text-textMuted uppercase tracking-wider flex items-center gap-2">
                 <Zap className="w-3 h-3 text-yellow-500" /> RealEyes LLaMA-3 Diagnostics
               </div>
               <p className="text-sm text-gray-300 leading-relaxed p-5 bg-deepBase rounded-lg border border-deepBorder/50 font-mono shadow-inner">
                 {results.explanation}
               </p>
            </div>

            {/* Verification Context */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-deepCard border border-deepBorder rounded-lg space-y-2">
                <div className="text-[10px] text-textMuted uppercase font-mono tracking-wider">Inference Target Data</div>
                <div className="flex items-center gap-2 text-xs text-textMuted font-mono truncate">
                  "{results.originalQuery}"
                </div>
              </div>
              <div className="p-4 bg-deepCard border border-deepBorder rounded-lg space-y-2">
                <div className="text-[10px] text-textMuted uppercase font-mono tracking-wider">Identified Ontology</div>
                <div className="flex items-center gap-2 text-sm text-white font-medium">
                    <Hash className="w-4 h-4 text-blue-400" /> {results.category}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
