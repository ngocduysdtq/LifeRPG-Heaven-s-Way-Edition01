
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language, PlayerStats } from '../types';
import { SendIcon, BrainIcon, SparklesIcon } from './Icons';
import { chatWithSystem } from '../services/geminiService';
import { translations } from '../utils/translations';

interface Props {
  lang: Language;
  playerStats: PlayerStats;
  onUpgrade: () => void;
}

const SystemChat: React.FC<Props> = ({ lang, playerStats, onUpgrade }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { id: crypto.randomUUID(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const context = `Host: ${playerStats.name}, Level: ${playerStats.level}, Class: ${playerStats.profession}. Premium: ${playerStats.isPremium}`;
    const response = await chatWithSystem(userMsg.text, context, lang);
    
    const systemMsg: ChatMessage = { id: crypto.randomUUID(), sender: 'system', text: response };
    setMessages(prev => [...prev, systemMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-system-panel border border-system-cyan/20 rounded-lg overflow-hidden shadow-lg relative">
        
        {/* Header */}
        <div className="p-3 border-b border-gray-800 bg-black/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <BrainIcon className={`w-5 h-5 ${playerStats.isPremium ? 'text-system-gold' : 'text-system-cyan'} animate-pulse-slow`} />
                <span className={`text-xs font-bold uppercase tracking-widest ${playerStats.isPremium ? 'text-system-gold' : 'text-white'}`}>
                    {playerStats.isPremium ? 'HEAVENLY LINK' : t.chatTitle}
                </span>
            </div>
            {!playerStats.isPremium && (
                <button 
                    onClick={() => setShowPremiumModal(true)}
                    className="text-[10px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-1 rounded font-bold animate-pulse hover:scale-105 transition-transform"
                >
                    UPGRADE SYSTEM
                </button>
            )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
                <div className="text-center text-gray-600 text-xs mt-10 italic">
                    {t.chatPlaceholder}
                </div>
            )}
            {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                        msg.sender === 'user' 
                        ? 'bg-gray-800 text-gray-200 rounded-br-none' 
                        : playerStats.isPremium 
                            ? 'bg-system-gold/10 border border-system-gold/30 text-system-gold rounded-bl-none shadow-[0_0_10px_rgba(251,191,36,0.1)]'
                            : 'bg-system-cyan/10 border border-system-cyan/30 text-system-cyan rounded-bl-none shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex justify-start">
                    <div className={`${playerStats.isPremium ? 'bg-system-gold/10 border-system-gold/30' : 'bg-system-cyan/10 border-system-cyan/30'} border rounded-lg p-3 rounded-bl-none`}>
                        <div className="flex gap-1">
                            <div className={`w-2 h-2 rounded-full animate-bounce ${playerStats.isPremium ? 'bg-system-gold' : 'bg-system-cyan'}`}></div>
                            <div className={`w-2 h-2 rounded-full animate-bounce delay-100 ${playerStats.isPremium ? 'bg-system-gold' : 'bg-system-cyan'}`}></div>
                            <div className={`w-2 h-2 rounded-full animate-bounce delay-200 ${playerStats.isPremium ? 'bg-system-gold' : 'bg-system-cyan'}`}></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-800 bg-black/20 flex gap-2">
            <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={t.chatPlaceholder}
                className="flex-1 bg-gray-900/50 border border-gray-700 text-white text-sm px-3 py-2 rounded focus:outline-none focus:border-system-cyan font-sans"
            />
             <button 
                onClick={handleSend}
                disabled={isLoading}
                className={`text-black p-2 rounded hover:brightness-110 disabled:opacity-50 transition-all ${playerStats.isPremium ? 'bg-system-gold' : 'bg-system-cyan'}`}
            >
                <SendIcon className="w-4 h-4" />
            </button>
        </div>

        {/* Premium Modal */}
        {showPremiumModal && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4">
                <div className="bg-gray-900 border border-system-purple w-full max-w-sm rounded-lg overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                    <div className="h-32 bg-gradient-to-br from-indigo-900 via-purple-900 to-system-dark flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
                        <SparklesIcon className="w-16 h-16 text-system-gold animate-float absolute" />
                        <h2 className="relative z-10 text-2xl font-serif font-bold text-white mt-16 text-center">HEAVENLY DAO<br/><span className="text-sm font-sans tracking-widest text-system-purple">PREMIUM ACCESS</span></h2>
                    </div>
                    <div className="p-6 space-y-4">
                         <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <span className="text-system-green">✓</span> Uncapped AI Mentorship
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <span className="text-system-green">✓</span> Advanced Cultivation Methods
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <span className="text-system-green">✓</span> Exclusive Golden UI Theme
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-3 mt-4">
                            <button onClick={() => { onUpgrade(); setShowPremiumModal(false); }} className="border border-gray-600 hover:border-system-purple rounded p-3 text-center transition-all group hover:bg-white/5">
                                <div className="text-xs text-gray-400">Monthly</div>
                                <div className="text-xl font-bold text-white group-hover:text-system-purple">$4.99</div>
                            </button>
                            <button onClick={() => { onUpgrade(); setShowPremiumModal(false); }} className="border border-system-purple bg-system-purple/10 rounded p-3 text-center transition-all relative overflow-hidden group">
                                <div className="absolute top-0 right-0 bg-system-purple text-[8px] px-1 text-white font-bold">BEST</div>
                                <div className="text-xs text-gray-300">Yearly</div>
                                <div className="text-xl font-bold text-system-gold">$49.99</div>
                            </button>
                         </div>
                    </div>
                    <button onClick={() => setShowPremiumModal(false)} className="w-full py-3 text-gray-500 hover:text-white text-xs uppercase tracking-widest border-t border-gray-800">
                        Stay Mortal (Cancel)
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default SystemChat;