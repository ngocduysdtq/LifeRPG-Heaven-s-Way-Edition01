
import React from 'react';
import { PlayerStats, StatType, Language } from '../types';
import { BrainIcon } from './Icons';
import { translations } from '../utils/translations';

interface Props {
  stats: PlayerStats;
  lang: Language;
}

const StatRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-gray-800 last:border-0 group hover:bg-white/5 px-2 rounded transition-colors">
    <span className="text-gray-400 font-sans tracking-widest uppercase text-xs group-hover:text-white transition-colors">{label}</span>
    <span className="text-system-cyan font-serif font-bold text-lg">{value}</span>
  </div>
);

const StatusBoard: React.FC<Props> = ({ stats, lang }) => {
  const t = translations[lang];
  const expPercentage = Math.min((stats.currentExp / stats.maxExp) * 100, 100);

  return (
    <div className="bg-system-panel border border-system-cyan/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] p-6 rounded-lg relative overflow-hidden h-full">
      {/* Decorative Corner Lines */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-system-cyan rounded-tl-lg"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-system-cyan rounded-br-lg"></div>

      {/* Header Profile */}
      <div className="flex items-center gap-5 mb-8">
        <div className="relative group cursor-pointer">
            {/* Colorful Avatar Gradient */}
            <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-system-cyan via-purple-500 to-system-gold animate-spin-slow">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-black opacity-80"></div>
                     <BrainIcon className="text-white w-10 h-10 relative z-10 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                </div>
            </div>
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black text-system-gold text-[10px] px-3 py-1 border border-system-gold rounded-full font-bold shadow-[0_0_10px_#fbbf24] whitespace-nowrap z-20">
             {t.level} {stats.level}
           </div>
        </div>

        <div className="overflow-hidden flex-1">
            <h2 className="font-serif text-2xl text-white tracking-wider truncate uppercase neon-text" title={stats.name}>
                {stats.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-system-cyan/20 text-system-neon border border-system-cyan/50 text-[10px] font-bold uppercase rounded tracking-widest">
                    {stats.profession}
                </span>
                <span className="text-gray-500 text-[10px] uppercase tracking-wider font-mono">
                   {stats.title}
                </span>
            </div>
            <p className="text-gray-400 text-xs mt-1 font-mono">
                {stats.gender === 'Male' ? t.male : stats.gender === 'Female' ? t.female : t.other} • {stats.age} YRS
            </p>
        </div>
      </div>

      {/* EXP Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-system-cyan mb-2 font-bold font-sans tracking-widest">
            <span>{t.exp}</span>
            <span>{stats.currentExp} / {stats.maxExp}</span>
        </div>
        <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-700 relative">
             <div className="absolute inset-0 bg-gray-800/50" style={{backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,.1) 25%,transparent 25%,transparent 50%,rgba(0,0,0,.1) 50%,rgba(0,0,0,.1) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem'}}></div>
            <div 
                className="h-full bg-gradient-to-r from-blue-600 via-system-cyan to-white shadow-[0_0_15px_#06b6d4] relative z-10"
                style={{ width: `${expPercentage}%`, transition: 'width 0.5s ease-out' }}
            ></div>
        </div>
      </div>

      {/* Attributes */}
      <div className="space-y-3">
        <h3 className="text-white font-serif text-sm border-b border-gray-700 pb-2 mb-2 flex justify-between items-center">
            <span>{t.attributes}</span>
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <StatRow label="Strength" value={stats.attributes[StatType.STR]} />
            <StatRow label="Intelligence" value={stats.attributes[StatType.INT]} />
            <StatRow label="Vitality" value={stats.attributes[StatType.VIT]} />
            <StatRow label="Agility" value={stats.attributes[StatType.AGI]} />
            <StatRow label="Charisma" value={stats.attributes[StatType.CHA]} />
            <StatRow label="Luck" value={stats.attributes[StatType.LUCK]} />
        </div>
      </div>
      
      {/* Currency */}
      <div className="absolute bottom-6 left-6 right-6 pt-4 border-t border-gray-800 flex justify-between items-center bg-system-panel/50 backdrop-blur-sm">
          <span className="text-gray-400 text-xs uppercase font-sans tracking-widest">{t.credits}</span>
          <span className="text-system-gold font-serif font-bold text-xl drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">{stats.gold.toLocaleString()} $</span>
      </div>
    </div>
  );
};

export default StatusBoard;
