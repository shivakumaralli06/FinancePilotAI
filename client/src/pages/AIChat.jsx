import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Loader2, 
  MessageSquare,
  Mic
} from 'lucide-react';

const SUGGESTIONS = [
  'How can I optimize my net savings this month?',
  'What is my highest spending expense category?',
  'Am I staying within my target monthly budget?',
  'Give me 3 practical financial habits to build.'
];

const AIChat = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.name || 'there'}! I am FinancePilot AI, your personal financial co-pilot. I have full real-time access to your income streams, expense categories, and monthly budget. How can I assist your financial growth today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setInputText(text);
      };
      recognition.start();
      addToast('Listening for voice input...', 'info');
    } else {
      addToast('Speech recognition not supported in browser', 'error');
    }
  };

  const handleSend = async (messageText) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim() || sending) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!messageText) setInputText('');
    setSending(true);

    try {
      const res = await aiService.chat(textToSend);
      if (res.data.success) {
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      addToast('Failed to connect to AI Co-Pilot backend.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col glass-card overflow-hidden">
      
      {/* Chat Header */}
      <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              FinancePilot AI Financial Advisor
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </h2>
            <p className="text-[11px] text-slate-500">Live Contextual AI • Google Gemini SDK</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
              msg.sender === 'user'
                ? 'bg-slate-800 text-white'
                : 'gradient-bg text-white'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-emerald-600 text-white rounded-tr-none shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className={`text-[10px] mt-2 font-medium ${msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'}`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span>Analyzing user telemetry and formulating advice...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Prompt Suggestion Chips */}
      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto flex gap-2">
        {SUGGESTIONS.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sug)}
            disabled={sending}
            className="px-3 py-1.5 rounded-full bg-slate-200/60 dark:bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-500 text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap transition-colors"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleMicClick}
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 text-slate-500 dark:text-slate-400 hover:text-emerald-500 border border-slate-200 dark:border-slate-700 transition-all"
            title="Voice input dictation"
          >
            <Mic className="w-4 h-4 text-emerald-500" />
          </button>

          <input
            type="text"
            placeholder="Ask FinancePilot AI anything about your money..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="p-3 rounded-xl gradient-bg text-white shadow-md hover:scale-105 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};

export default AIChat;
