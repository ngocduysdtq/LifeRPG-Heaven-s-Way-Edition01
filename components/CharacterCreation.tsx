
import React, { useState } from 'react';
import { BrainIcon, SparklesIcon } from './Icons';
import { generateRoadmap } from '../services/geminiService';
import { Roadmap, Language } from '../types';
import { translations } from '../utils/translations';

interface Props {
  onComplete: (name: string, age: number, gender: string, profession: string, roadmap: Roadmap, lang: Language) => void;
}

const PROFESSIONS = [
  { id: 'dev', label: 'Software Engineer', icon: '💻' },
  { id: 'english', label: 'English Mastery', icon: '🗣️' },
  { id: 'fitness', label: 'Body Building', icon: '💪' },
  { id: 'finance', label: 'Entrepreneur / Investor', icon: '💰' },
  { id: 'creator', label: 'Content Creator', icon: '🎥' },
  { id: 'research', label: 'Researcher / Scientist', icon: '🔬' },
];

const CharacterCreation: React.FC<Props> = ({ onComplete }) => {
  const [lang, setLang] = useState<Language>(Language.VI);
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState('Male');
  const [profession, setProfession] = useState('');
  const [customProfession, setCustomProfession] = useState('');
  const [step, setStep] = useState(0); // 0: Boot, 1: Lang, 2: Class, 3: Identity, 4: Generating
  const [isOther, setIsOther] = useState(false);

  const t = translations[lang];

  // Simulate System Boot
  React.useEffect(() => {
    const timer = setTimeout(() => setStep(1), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLangSelect = (l: Language) => {
    setLang(l);
    setStep(2);
  };

  const handleClassSelect = (p: string) => {
    setProfession(p);
    setIsOther(false);
  };

  const handleClassSubmit = () => {
    const finalProfession = isOther ? customProfession : profession;
    if (finalProfession) setStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age) return;

    const finalProfession = isOther ? customProfession : profession;
    
    setStep(4); // Loading
    try {
        const roadmap = await generateRoadmap(finalProfession, 1, lang);
        onComplete(name, parseInt(age), gender, finalProfession, roadmap, lang);
    } catch (e) {
        console.error(e);
        onComplete(name, parseInt(age), gender, finalProfession, { goalName: finalProfession, totalDurationString: 'TBD', phases: [] }, lang);
    }
  };

  if (step === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-system-dark text-system-neon font-mono relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>
        <div className="text-center space-y-4 animate-pulse">
            <BrainIcon className="w-16 h-16 mx-auto animate-spin-slow text-system-cyan" />
            <h1 className="text-3xl tracking-[0.5em] font-bold text-white neon-text">SYSTEM ONLINE</h1>
            <p className="text-xs text-system-cyan">Calibrating Reality Interface...</p>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-system-dark text-white relative">
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-system-neon animate-pulse w-full origin-left animate-[grow_2s_ease-in-out_infinite]"></div>
            </div>
            <h2 className="text-xl font-serif text-system-neon animate-pulse">{t.generating}</h2>
        </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-system-dark p-4 relative">
       {/* Background */}
       <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-2xl w-full bg-system-panel/90 border border-system-cyan/50 shadow-[0_0_30px_rgba(6,182,212,0.2)] p-8 relative z-10 backdrop-blur-sm rounded-lg">
        
        {/* Header Progress */}
        <div className="text-center mb-8 border-b border-gray-800 pb-4">
            <h2 className="text-3xl font-serif text-white mb-2 flex items-center justify-center gap-2 neon-text">
                {step === 1 ? "LANGUAGE" : step === 2 ? t.selectClass : t.identity}
            </h2>
            <div className="flex justify-center gap-2 mt-4">
                <div className={`h-1 w-12 rounded ${step >= 1 ? 'bg-system-cyan shadow-[0_0_5px_#06b6d4]' : 'bg-gray-700'}`}></div>
                <div className={`h-1 w-12 rounded ${step >= 2 ? 'bg-system-cyan shadow-[0_0_5px_#06b6d4]' : 'bg-gray-700'}`}></div>
                <div className={`h-1 w-12 rounded ${step >= 3 ? 'bg-system-cyan shadow-[0_0_5px_#06b6d4]' : 'bg-gray-700'}`}></div>
            </div>
        </div>

        {/* STEP 1: LANGUAGE */}
        {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleLangSelect(Language.VI)} className="p-6 bg-gray-900 border border-gray-700 hover:border-system-cyan hover:bg-system-cyan/10 rounded-lg text-white font-bold text-xl transition-all">TIẾNG VIỆT</button>
                <button onClick={() => handleLangSelect(Language.EN)} className="p-6 bg-gray-900 border border-gray-700 hover:border-system-cyan hover:bg-system-cyan/10 rounded-lg text-white font-bold text-xl transition-all">ENGLISH</button>
                <button onClick={() => handleLangSelect(Language.CN)} className="p-6 bg-gray-900 border border-gray-700 hover:border-system-cyan hover:bg-system-cyan/10 rounded-lg text-white font-bold text-xl transition-all">中文</button>
                <button onClick={() => handleLangSelect(Language.JP)} className="p-6 bg-gray-900 border border-gray-700 hover:border-system-cyan hover:bg-system-cyan/10 rounded-lg text-white font-bold text-xl transition-all">日本語</button>
            </div>
        )}

        {/* STEP 2: PROFESSION */}
        {step === 2 && (
             <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {PROFESSIONS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => handleClassSelect(p.label)}
                            className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                                profession === p.label && !isOther
                                    ? 'bg-system-cyan/20 border-system-cyan shadow-[0_0_10px_rgba(6,182,212,0.3)] text-white' 
                                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                            }`}
                        >
                            <span className="text-2xl">{p.icon}</span>
                            <span className="text-xs font-bold uppercase text-center">{p.label}</span>
                        </button>
                    ))}
                    <button
                        onClick={() => setIsOther(true)}
                        className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                            isOther
                                ? 'bg-system-cyan/20 border-system-cyan shadow-[0_0_10px_rgba(6,182,212,0.3)] text-white' 
                                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                        }`}
                    >
                        <span className="text-2xl">✨</span>
                        <span className="text-xs font-bold uppercase text-center">{t.customPath}</span>
                    </button>
                </div>

                {isOther && (
                    <div className="animate-in slide-in-from-top duration-300">
                        <input 
                            type="text" 
                            value={customProfession}
                            onChange={(e) => setCustomProfession(e.target.value)}
                            placeholder={t.customProfessionPlaceholder}
                            className="w-full bg-gray-950 border border-system-cyan text-white p-3 focus:outline-none rounded font-sans"
                        />
                    </div>
                )}

                <button 
                    onClick={handleClassSubmit}
                    disabled={!profession && !customProfession}
                    className="w-full mt-6 bg-system-cyan disabled:opacity-50 disabled:cursor-not-allowed hover:bg-system-neon text-black font-bold py-4 px-4 rounded transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] uppercase tracking-widest"
                >
                    {t.confirm}
                </button>
            </div>
        )}

        {/* STEP 3: IDENTITY */}
        {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-system-cyan font-bold">{t.enterName}</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-gray-950 border border-gray-700 text-white p-4 focus:border-system-cyan focus:outline-none focus:ring-1 focus:ring-system-cyan font-serif text-xl tracking-wide placeholder-gray-800 rounded"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-system-cyan font-bold">{t.enterAge}</label>
                        <input 
                            type="number" 
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                            min="1" max="120"
                            className="w-full bg-gray-950 border border-gray-700 text-white p-4 focus:border-system-cyan focus:outline-none font-mono text-xl rounded"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-system-cyan font-bold">{t.enterGender}</label>
                        <select 
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-700 text-white p-4 focus:border-system-cyan focus:outline-none font-sans text-xl appearance-none rounded"
                        >
                            <option value="Male">{t.male}</option>
                            <option value="Female">{t.female}</option>
                            <option value="Other">{t.other}</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="w-full mt-6 bg-system-cyan hover:bg-system-neon text-black font-bold py-4 px-4 rounded transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] uppercase tracking-widest">
                    {t.confirm}
                </button>
                <button type="button" onClick={() => setStep(2)} className="w-full text-gray-500 text-xs mt-2 hover:text-white">&larr; Back</button>
            </form>
        )}
      </div>
    </div>
  );
};

export default CharacterCreation;
