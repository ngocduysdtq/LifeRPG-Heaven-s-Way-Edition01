
import React, { useState, useCallback, useEffect } from 'react';
import StatusBoard from './components/StatusBoard';
import QuestLog from './components/QuestLog';
import SystemFeed from './components/SystemFeed';
import CharacterCreation from './components/CharacterCreation';
import SystemChat from './components/SystemChat';
import { PlayerStats, Quest, StatType, SystemLogEntry, Roadmap, Rarity, Language } from './types';
import { SparklesIcon, SwordIcon, BrainIcon } from './components/Icons';
import { translations } from './utils/translations';
import { generateDailyQuests } from './services/geminiService';

// Initial State Template
const DEFAULT_STATS: PlayerStats = {
  name: "Unknown",
  age: 0,
  gender: "Unknown",
  profession: "None",
  level: 1,
  currentExp: 0,
  maxExp: 100,
  gold: 0,
  title: "Awakened Soul",
  isPremium: false,
  attributes: {
    [StatType.STR]: 5,
    [StatType.INT]: 5,
    [StatType.VIT]: 5,
    [StatType.AGI]: 5,
    [StatType.CHA]: 5,
    [StatType.LUCK]: 5,
  }
};

const App = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [lang, setLang] = useState<Language>(Language.VI);
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [activeTab, setActiveTab] = useState<'mission' | 'cultivate' | 'status'>('mission');

  const t = translations[lang];

  // Font class mapping based on language
  const fontClass = 
    lang === Language.JP ? 'font-jp' : 
    lang === Language.CN ? 'font-cn' : 
    'font-sans'; // Default for EN/VI

  // Helper to add log
  const addLog = useCallback((message: string, type: SystemLogEntry['type'] = 'info') => {
    const newLog: SystemLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50
  }, []);

  // DAILY RESET LOGIC
  useEffect(() => {
    if (!isRegistered) return;

    const checkDailyReset = () => {
        const today = new Date().toLocaleDateString();
        const lastLogin = localStorage.getItem('lastLoginDate');

        if (lastLogin !== today) {
            console.log("TRIGGERING DAILY RESET");
            // 1. Reset Daily Quests (Remove old Dailies)
            setQuests(prev => prev.filter(q => q.type === 'Main' || q.type === 'Side'));
            
            // 2. Generate New Dailies
            const dailies = generateDailyQuests(stats.profession, stats.level, lang);
            setQuests(prev => [...prev, ...dailies]);
            
            // 3. Log
            addLog(`${t.active}: ${dailies.length} Daily Quests`, 'narrative');
            localStorage.setItem('lastLoginDate', today);
        }
    };

    // Check immediately on load/register
    checkDailyReset();

    // Check every minute if the day changed while app is open
    const interval = setInterval(checkDailyReset, 60000);
    return () => clearInterval(interval);

  }, [isRegistered, stats.profession, stats.level, lang, t.active, addLog]);


  const handleRegistration = (name: string, age: number, gender: string, profession: string, generatedRoadmap: Roadmap, selectedLang: Language) => {
    setLang(selectedLang);
    setStats(prev => ({
        ...prev,
        name,
        age,
        gender,
        profession
    }));
    setRoadmap(generatedRoadmap);
    setIsRegistered(true);

    // Convert Roadmap first phase tasks into Quests
    if (generatedRoadmap && generatedRoadmap.phases.length > 0) {
        const firstPhase = generatedRoadmap.phases[0];
        const initialQuests: Quest[] = firstPhase.tasks.map(task => ({
            id: crypto.randomUUID(),
            title: task.title,
            description: `${firstPhase.phaseName}: ${task.description}`,
            difficulty: task.difficulty,
            rarity: Rarity.RARE, // Roadmap quests are always at least Rare
            expReward: task.expReward || 100,
            goldReward: 50,
            statRewards: { [StatType.INT]: 2 }, // Simplified stat reward logic for roadmap
            isCompleted: false,
            type: 'Main',
            realLifeTask: task.title
        }));
        setQuests(initialQuests);
    }
    
    // Slight delay for effect
    setTimeout(() => {
        addLog(`${translations[selectedLang].booting}`, 'narrative');
        if (generatedRoadmap.phases.length > 0) {
            addLog(`${translations[selectedLang].roadmapActive}: ${generatedRoadmap.goalName}`, 'info');
        }
    }, 500);
  };

  const handleAddQuest = (quest: Quest) => {
    setQuests(prev => [...prev, quest]);
    addLog(`${t.active}: [${quest.title}]`, 'info');
  };

  const handleDeleteQuest = (id: string) => {
      setQuests(prev => prev.filter(q => q.id !== id));
      addLog(t.abandon, 'alert');
  };

  const handleCompleteQuest = (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest) return;

    // Remove quest
    setQuests(prev => prev.filter(q => q.id !== id));

    // Update Logs
    addLog(`${t.complete}: [${quest.title}]`, 'gain');
    addLog(`${t.exp} +${quest.expReward}, ${t.credits} +${quest.goldReward}`, 'gain');

    // Update Stats
    setStats(prev => {
        let newExp = prev.currentExp + quest.expReward;
        let newGold = prev.gold + quest.goldReward;
        let newLevel = prev.level;
        let newMaxExp = prev.maxExp;
        let newAttributes = { ...prev.attributes };

        // Stat gains
        Object.entries(quest.statRewards).forEach(([key, val]) => {
            if (val) {
                newAttributes[key as StatType] += val;
                addLog(`[${key}] +${val}`, 'gain');
            }
        });

        // Level Up Logic
        if (newExp >= newMaxExp) {
            newLevel++;
            newExp = newExp - newMaxExp;
            newMaxExp = Math.floor(newMaxExp * 1.5); // Exponential curve
            setShowLevelUp(true);
            addLog(`${t.lvlUp}`, 'narrative');
            setTimeout(() => setShowLevelUp(false), 4000);
        }

        return {
            ...prev,
            level: newLevel,
            currentExp: newExp,
            maxExp: newMaxExp,
            gold: newGold,
            attributes: newAttributes
        };
    });
  };

  const handleUpgradePremium = () => {
    setStats(prev => ({ ...prev, isPremium: true, gold: prev.gold - 0 })); // Mock purchase
    addLog("SYSTEM UPGRADED: HEAVENLY DAO LINK ESTABLISHED", 'narrative');
  };

  if (!isRegistered) {
    return <CharacterCreation onComplete={handleRegistration} />;
  }

  return (
    <div className={`min-h-screen bg-system-dark text-gray-200 selection:bg-system-cyan selection:text-black overflow-hidden relative ${fontClass}`}>
      
      {/* Level Up Overlay */}
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="text-center animate-bounce">
                <h1 className="text-6xl md:text-7xl font-serif font-bold text-system-cyan neon-text drop-shadow-[0_0_50px_rgba(6,182,212,0.8)]">{t.lvlUp}</h1>
                <p className="text-xl md:text-2xl text-white mt-4 tracking-[0.5em] border-t border-system-cyan pt-4">{t.limitsBroken}</p>
            </div>
        </div>
      )}

      {/* Background Grid Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-7xl mx-auto h-screen flex flex-col p-2 md:p-4 gap-4 relative z-10">
        
        {/* Top Bar (Mobile/Desktop) - Basic Info Summary */}
        <div className="flex justify-between items-center bg-system-panel/80 p-3 rounded-lg border border-gray-800 backdrop-blur">
            <h1 className="font-serif font-bold text-system-cyan tracking-widest text-lg">{t.systemName}</h1>
            <div className="text-xs font-mono text-gray-400">HOST: {stats.name} | LVL {stats.level}</div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
            
            {/* LEFT COLUMN: Navigation & Roadmap (Desktop) */}
            <div className="hidden md:flex flex-col w-1/4 gap-4">
                <StatusBoard stats={stats} lang={lang} />
                <div className="flex-1 min-h-0">
                     <SystemChat lang={lang} playerStats={stats} onUpgrade={handleUpgradePremium} />
                </div>
            </div>

            {/* MIDDLE/RIGHT COLUMN: Tabs Content */}
            <div className="flex-1 flex flex-col bg-system-panel/50 rounded-lg border border-gray-800 overflow-hidden relative">
                
                {/* Tab Headers */}
                <div className="flex border-b border-gray-800 bg-black/40">
                    <button 
                        onClick={() => setActiveTab('mission')}
                        className={`flex-1 py-4 text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'mission' ? 'text-system-cyan border-b-2 border-system-cyan bg-system-cyan/5' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <SwordIcon className="w-4 h-4" /> {t.tabMissions}
                    </button>
                    <button 
                        onClick={() => setActiveTab('cultivate')}
                        className={`flex-1 py-4 text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'cultivate' ? 'text-system-cyan border-b-2 border-system-cyan bg-system-cyan/5' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <SparklesIcon className="w-4 h-4" /> {t.tabCultivate}
                    </button>
                    <button 
                        onClick={() => setActiveTab('status')}
                        className={`flex-1 md:hidden py-4 text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'status' ? 'text-system-cyan border-b-2 border-system-cyan bg-system-cyan/5' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <BrainIcon className="w-4 h-4" /> {t.tabStatus}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden p-4 relative">
                    {activeTab === 'mission' && (
                        <div className="h-full flex flex-col gap-4">
                            {/* Main Quests Section */}
                            <div className="flex-1 overflow-hidden flex flex-col">
                                <h3 className="text-system-gold text-xs font-bold uppercase mb-2 tracking-widest border-b border-gray-800 pb-1">{t.mainQuest}</h3>
                                <div className="flex-1 overflow-y-auto">
                                    <QuestLog 
                                        quests={quests} 
                                        playerLevel={stats.level} 
                                        lang={lang}
                                        onAddQuest={handleAddQuest}
                                        onCompleteQuest={handleCompleteQuest}
                                        onDeleteQuest={handleDeleteQuest}
                                        onlyType='Main'
                                    />
                                </div>
                            </div>
                            {/* Side Quests / Daily Section */}
                            <div className="flex-1 overflow-hidden flex flex-col">
                                <h3 className="text-gray-400 text-xs font-bold uppercase mb-2 tracking-widest border-b border-gray-800 pb-1">{t.sideQuest}</h3>
                                <div className="flex-1 overflow-y-auto">
                                    <QuestLog 
                                        quests={quests} 
                                        playerLevel={stats.level} 
                                        lang={lang}
                                        onAddQuest={handleAddQuest}
                                        onCompleteQuest={handleCompleteQuest}
                                        onDeleteQuest={handleDeleteQuest}
                                        onlyType='Side'
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cultivate' && (
                        <div className="h-full flex flex-col gap-6">
                             <div className="bg-gray-900/50 p-4 rounded border border-gray-700">
                                <h3 className="text-white mb-2 font-bold">{t.addQuick}</h3>
                                <QuestLog 
                                    quests={[]} // Pass empty, we just want the input part
                                    playerLevel={stats.level} 
                                    lang={lang}
                                    onAddQuest={handleAddQuest}
                                    onCompleteQuest={() => {}}
                                    onDeleteQuest={() => {}}
                                    onlyType='Side' // Shows the input
                                />
                             </div>
                             
                             <div className="flex-1 bg-black/20 rounded p-4 border border-gray-800 overflow-y-auto">
                                <h3 className="text-system-cyan mb-4 font-bold tracking-widest uppercase text-xs">{t.roadmapActive}</h3>
                                <div className="space-y-4">
                                    {roadmap?.phases.map((phase, idx) => (
                                        <div key={idx} className={`p-4 rounded border relative ${idx === 0 ? 'bg-system-cyan/10 border-system-cyan' : 'bg-gray-900 border-gray-800 opacity-50'}`}>
                                            <div className="absolute top-2 right-2 text-[10px] uppercase font-bold text-gray-500">{t.phase} {idx + 1}</div>
                                            <h4 className="font-serif text-lg text-white">{phase.phaseName}</h4>
                                            <p className="text-sm text-gray-400 mt-1">{phase.description}</p>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'status' && (
                         <div className="h-full overflow-y-auto space-y-4">
                             <StatusBoard stats={stats} lang={lang} />
                             <div className="h-64">
                                <SystemChat lang={lang} playerStats={stats} onUpgrade={handleUpgradePremium} />
                             </div>
                         </div>
                    )}
                </div>
            </div>
        </div>
        
        {/* Bottom Log (Always visible) */}
        <SystemFeed logs={logs} />
      </div>
    </div>
  );
};

export default App;