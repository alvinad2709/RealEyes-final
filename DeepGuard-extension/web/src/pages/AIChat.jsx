import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageSquare, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello. I am the RealEyes AI Explainability Assistant. I'm connected directly to our inference pipeline. How can I help you understand our detection algorithms, interpret a result, or learn about synthetic media today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input.trim() };
    const newContext = [...messages, userMsg];
    
    setMessages(newContext);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/tools/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           // Only send recent context to save tokens, avoiding the initial prompt
           messages: newContext.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Inference engine offline");
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, data]);
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        isError: true,
        content: error.message.includes("Failed to fetch") 
          ? "Network Error: deeply verify your backend server is running on port 5000."
          : `System Error: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 pt-12 pb-6 min-h-[85vh] flex flex-col items-center animate-fade-in relative">
      
      {/* Dynamic Backgrounds */}
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-deepRed/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8 relative z-10 w-full">
         <div className="w-16 h-16 rounded-2xl bg-deepCard border border-deepBorder shadow-[0_0_20px_rgba(150,0,255,0.15)] flex items-center justify-center mb-6">
            <MessageSquare className="w-8 h-8 text-purple-400" />
         </div>
         <h1 className="text-4xl font-display font-bold uppercase tracking-tight mb-2">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Explainability Chat</span>
         </h1>
         <p className="text-textMuted text-sm font-mono tracking-wider">INF_ENGINE: LLaMA-3.3-70B • STATUS: ONLINE</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 w-full glass-panel flex flex-col rounded-2xl border border-deepBorder/50 bg-deepBase/60 backdrop-blur-xl overflow-hidden relative z-10 shadow-2xl">
         
         {/* Messages Area */}
         <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-deepBorder scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {msg.role === 'user' ? (
                        <div className="w-10 h-10 rounded-xl bg-deepCard border border-deepBorder flex items-center justify-center">
                           <User className="w-5 h-5 text-gray-400" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${msg.isError ? 'bg-deepRed/20 border-deepRed text-deepRed' : 'bg-purple-900/20 border-purple-500/30 text-purple-400'}`}>
                           {msg.isError ? <ShieldAlert className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-deepCard border border-deepBorder text-white rounded-tr-sm' 
                        : msg.isError 
                           ? 'bg-deepRed/10 border border-deepRed/30 text-red-200 rounded-tl-sm'
                           : 'bg-purple-900/10 border border-purple-500/20 text-gray-200 rounded-tl-sm'
                    }`}>
                      {msg.role === 'assistant' && !msg.isError ? (
                         <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-deepBase prose-pre:border prose-pre:border-deepBorder max-w-none text-sm">
                           <ReactMarkdown>{msg.content}</ReactMarkdown>
                         </div>
                      ) : (
                         <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                 </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex w-full justify-start">
                 <div className="flex gap-4 max-w-[80%] flex-row">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-900/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                       <Bot className="w-5 h-5" />
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-900/10 border border-purple-500/20 rounded-tl-sm flex items-center gap-3 text-purple-400/80 text-sm font-mono">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      COMPUTING RESPONSE TENSORS...
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* Input Area */}
         <div className="p-4 bg-deepCard/50 border-t border-deepBorder backdrop-blur-md">
           <form onSubmit={handleSubmit} className="flex gap-3">
             <input
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Ask about deepfake forensics, KYC anomalies, models..."
               className="flex-1 bg-deepBase border border-deepBorder rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-white placeholder-gray-500"
               disabled={isLoading}
             />
             <button
               type="submit"
               disabled={isLoading || !input.trim()}
               className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-purple-900/20"
             >
               <Send className="w-4 h-4" />
             </button>
           </form>
         </div>

      </div>
    </div>
  );
}
