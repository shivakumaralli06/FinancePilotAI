import React, { useState } from 'react';
import VoiceAssistantModal from './VoiceAssistantModal';
import { Mic, Sparkles } from 'lucide-react';

const VoiceAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full gradient-bg text-white shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all duration-300 border border-emerald-400/30"
          title="Open AI Voice Co-Pilot"
        >
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping pointer-events-none" />
          <Mic className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute top-2.5 right-2.5 animate-pulse" />
        </button>
      </div>

      <VoiceAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default VoiceAssistantButton;
