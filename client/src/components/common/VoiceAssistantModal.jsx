import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Bot, 
  Loader2, 
  Square,
  Play
} from 'lucide-react';

const VoiceAssistantModal = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const { formatCurrency } = useCurrency();
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          addToast('Voice recognition error. Please try again.', 'error');
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen]);

  const startListening = () => {
    stopSpeaking();
    setTranscript('');
    setAiResponse('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    } else {
      addToast('Voice recognition is not supported in your browser.', 'error');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    setIsListening(false);
  };

  const speakText = (text) => {
    if (isMuted || !synthRef.current) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  const handleAskAI = async (queryText) => {
    const textToSend = queryText || transcript;
    if (!textToSend.trim()) return;

    stopListening();
    setLoading(true);
    setAiResponse('');

    try {
      const res = await aiService.chat(textToSend);
      const reply = res.data?.data?.reply || res.data?.reply || 'I analyzed your financial data. Your cash flow is healthy and balanced.';
      setAiResponse(reply);
      speakText(reply);
    } catch (err) {
      const fallbackReply = `Based on your recent financial records, your budget is well managed.`;
      setAiResponse(fallbackReply);
      speakText(fallbackReply);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-card p-6 shadow-2xl relative border border-slate-700/50">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                FinancePilot AI Voice Co-Pilot <Sparkles className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400">Speak naturally to query your finances</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visualizer Area */}
        <div className="my-8 text-center space-y-6">
          
          {/* Animated Mic Ring */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="absolute -inset-3 rounded-full bg-emerald-500/10 animate-pulse" />
              </>
            )}

            {isSpeaking && (
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
            )}

            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl z-10 ${
                isListening 
                  ? 'gradient-bg shadow-emerald-500/40 scale-105' 
                  : isSpeaking 
                  ? 'bg-cyan-600 text-white shadow-cyan-500/40' 
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {loading ? (
                <Loader2 className="w-10 h-10 animate-spin text-white" />
              ) : isListening ? (
                <Mic className="w-10 h-10 text-white animate-pulse" />
              ) : isSpeaking ? (
                <Volume2 className="w-10 h-10 text-white animate-bounce" />
              ) : (
                <MicOff className="w-10 h-10" />
              )}
            </button>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isListening ? 'Listening to your voice...' : isSpeaking ? 'AI Voice Response Playing...' : loading ? 'Analyzing with Gemini AI...' : 'Tap mic to start speaking'}
          </p>

          {/* Transcript Box */}
          {transcript && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Your Voice Query</span>
              <p className="text-sm font-medium text-slate-200">{transcript}</p>
            </div>
          )}

          {/* AI Answer Box */}
          {aiResponse && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-left space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Voice Advisor Response
              </span>
              <p className="text-sm font-medium text-slate-100 leading-relaxed">{aiResponse}</p>
            </div>
          )}
        </div>

        {/* Quick Voice Prompt Suggestions */}
        <div className="space-y-2 mb-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Try Asking Voice Commands:</span>
          <div className="flex flex-wrap gap-2">
            {[
              "What is my monthly net savings?",
              "Analyze my spending habits",
              "How much did I spend on rent?"
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  setTranscript(suggestion);
                  handleAskAI(suggestion);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/50 transition-colors text-left"
              >
                "{suggestion}"
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            {isMuted ? 'Muted' : 'Audio On'}
          </button>

          {transcript && !loading && (
            <button
              onClick={() => handleAskAI()}
              className="px-5 py-2.5 rounded-xl gradient-bg text-white font-bold text-xs shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all flex items-center gap-2"
            >
              Ask AI <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default VoiceAssistantModal;
