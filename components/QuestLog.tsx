
import React, { useState } from 'react';
import { Quest, Rarity, Language } from '../types';
import { CheckIcon, SendIcon, ScrollIcon, TrashIcon } from './Icons';
import { generateQuestFromInput } from '../services/geminiService';
import { translations } from '../utils/translations';

interface Props {
  quests: Quest[];
  playerLevel: number;
  lang: Language;
  onAddQuest: (quest: Quest) => void;
  onCompleteQuest: (questId: string) => void;
  onDeleteQuest: (questId: string) => void;
  onlyType?: 'Main' | 'Side'; // Optional filter to show only specific types
}

const RarityColors: Record<Rarity, string> = {
  [Rarity.COMMON]: 'border-gray-500 text-gray-300',
  [Rarity.UNCOMMON]: 'border-green-500 text-green-400 shadow-[0_0_5px_rgba(74,222,128,0.2)]',
  [Rarity.RARE]: 'border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]',
  [Rarity.EPIC]: 'border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.4)]',
  [Rarity.LEGENDARY]: 'border-system-gold text-system-gold shadow-[0_0_20px_rgba(255,215,0,0.5)]',
  [Rarity.MYTHICAL]: 'border-red-600 text-red-500 shadow-[0_0_25px_rgba(220,38,38,0.6)]',
};

const QuestLog: React.FC<Props> = ({ quests, playerLevel, lang, onAddQuest, onCompleteQuest, onDeleteQuest, onlyType }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = translations[lang];

  const handleCreateQuest = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
        const generated = await generateQuestFromInput(input, playerLevel, lang);
        const newQuest: Quest = {
            id: crypto.randomUUID(),
            title: generated.title,
            description: generated.description,
            difficulty: generated.difficulty,
            rarity: generated.rarity as Rarity,
            expReward: generated.expReward,
            goldReward: generated.goldReward,
            statRewards: { [generated.statType]: generated.statAmount },
            isCompleted: false,
            type: 'Side', // User added quests are side quests
            realLifeTask: input
        };
        onAddQuest(newQuest);
        setInput('');
    } catch (e) {
        console.error("Failed to generate quest", e);
    } finally {
        setIsLoading(false);
    }
  };

  const filteredQuests = quests.filter(q => !q.isCompleted && (!onlyType || (onlyType === 'Main' ? q.type === 'Main' : q.type !== 'Main')));

  return (
    <div className="flex flex-col h-full bg-system-panel border border-system-cyan/20 shadow-lg rounded-lg overflow-hidden">
      
      {/* Show input only if we are in Side Quests mode or no filter */}
      {(!onlyType || onlyType === 'Side') && (
        <div className="p-4 border-b border-gray-800 bg-black/10">
            <h4 className="text-xs font-bold text-system-cyan uppercase mb-2">{t.addQuick}</h4>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.addPlaceholder}
                    className="flex-1 bg-gray-900 border border-gray-700 text-white px-4 py-3 text-sm focus:border-system-cyan focus:outline-none focus:ring-1 focus:ring-system-cyan font-sans rounded shadow-inner"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateQuest()}
                />
                <button 
                    onClick={handleCreateQuest}
                    disabled={isLoading}
                    className="bg-system-cyan text-black font-bold px-6 py-2 rounded hover:bg-system-neon transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                >
                    {isLoading ? <span className="animate-pulse">...</span> : <SendIcon />}
                </button>
            </div>
        </div>
      )}

      {/* Quest List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredQuests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 font-sans opacity-50">
                <p className="text-xl tracking-widest uppercase mb-2">{t.noActive}</p>
            </div>
        ) : (
            filteredQuests.map((quest) => (
                <div key={quest.id} className={`bg-gray-900/80 border-l-4 p-5 relative group transition-all hover:bg-gray-800 hover:translate-x-1 rounded-r-lg shadow-md ${RarityColors[quest.rarity]} ${quest.type === 'Main' ? 'bg-blue-950/30' : ''}`}>
                    
                    {quest.type === 'Main' && (
                         <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-bl uppercase font-bold tracking-widest">
                            STORY
                         </div>
                    )}

                    <div className="flex justify-between items-start mb-2 pr-10">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold uppercase border px-1.5 py-0.5 rounded ${RarityColors[quest.rarity]} border-opacity-50`}>
                                    RANK {quest.difficulty}
                                </span>
                                <h4 className="font-serif font-bold text-white text-lg tracking-wide">{quest.title}</h4>
                            </div>
                            <p className="text-gray-400 text-sm font-sans mt-2 italic pl-2 border-l-2 border-gray-700">
                                {quest.description}
                            </p>
                        </div>
                    </div>
                    
                    {/* Rewards */}
                    <div className="flex flex-wrap gap-3 mt-4 text-xs font-mono pt-3 border-t border-white/5">
                        <span className="text-system-cyan font-bold bg-system-cyan/10 px-2 py-1 rounded">EXP +{quest.expReward}</span>
                        <span className="text-system-gold font-bold bg-system-gold/10 px-2 py-1 rounded">CREDIT +{quest.goldReward}</span>
                        {Object.entries(quest.statRewards).map(([stat, val]) => (
                            <span key={stat} className="text-purple-400 uppercase bg-purple-500/10 px-2 py-1 rounded">{stat} +{val}</span>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-8 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => onCompleteQuest(quest.id)}
                            className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all"
                            title={t.complete}
                        >
                            <CheckIcon />
                        </button>
                        <button 
                            onClick={() => onDeleteQuest(quest.id)}
                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded border border-red-500/30 transition-all"
                            title={t.abandon}
                        >
                            <TrashIcon />
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default QuestLog;
