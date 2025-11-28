
import { GoogleGenAI, Type } from "@google/genai";
import { Rarity, StatType, Roadmap, Language, Quest } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Define the schema for single quest generation
const questSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Quest title in the requested language" },
    description: { type: Type.STRING, description: "System flavor text in the requested language" },
    difficulty: { type: Type.STRING, enum: ["F", "E", "D", "C", "B", "A", "S"] },
    rarity: { type: Type.STRING, enum: Object.values(Rarity) },
    expReward: { type: Type.INTEGER },
    goldReward: { type: Type.INTEGER },
    statType: { type: Type.STRING, enum: Object.values(StatType) },
    statAmount: { type: Type.INTEGER },
  },
  required: ["title", "description", "difficulty", "rarity", "expReward", "goldReward", "statType", "statAmount"],
};

// Define Schema for Roadmap
const roadmapSchema = {
  type: Type.OBJECT,
  properties: {
    goalName: { type: Type.STRING },
    totalDurationString: { type: Type.STRING },
    phases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phaseName: { type: Type.STRING },
          description: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedDays: { type: Type.INTEGER },
                difficulty: { type: Type.STRING, enum: ["F", "E", "D", "C", "B", "A", "S"] },
                expReward: { type: Type.INTEGER }
              }
            }
          }
        }
      }
    }
  }
};

export const generateQuestFromInput = async (userInput: string, playerLevel: number, lang: Language) => {
  if (!apiKey) return fallbackQuest(userInput);

  const prompt = `
    You are "The System" (Hệ Thống). 
    User Language: ${lang}.
    Task: "${userInput}".
    Convert this real-life task into a Cultivation/RPG Quest.
    Tone: Mystical, Dignified, Gamified.
    Player Level: ${playerLevel}.
    Output in ${lang}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from System.");
    return JSON.parse(text);
  } catch (error) {
    console.error("System Error:", error);
    return fallbackQuest(userInput);
  }
};

export const generateRoadmap = async (profession: string, currentLevel: number, lang: Language): Promise<Roadmap> => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
      You are "The System". The Host has chosen the Path (Profession): "${profession}".
      User Language: ${lang}.
      Create a detailed progression Roadmap.
      Break it down into 3 Phases (e.g., Novice, Adept, Expert).
      For each phase, provide 2-3 specific milestone tasks.
      Tasks should be real-world actionable but described with System flavor.
      Output in ${lang}.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: roadmapSchema,
                temperature: 0.7,
            }
        });
        const text = response.text;
        if (!text) throw new Error("No roadmap generated");
        return JSON.parse(text) as Roadmap;
    } catch (e) {
        console.error(e);
        return {
            goalName: profession,
            totalDurationString: "Unknown",
            phases: []
        };
    }
}

export const chatWithSystem = async (message: string, context: string, lang: Language): Promise<string> => {
    if (!apiKey) return "System Offline. (No API Key)";

    const prompt = `
        You are "The System" (Hệ Thống). You are guiding a Host in their real life gamification.
        Context: ${context}.
        User Language: ${lang}.
        User says: "${message}".
        Respond as a cool, slightly mysterious but helpful System AI. Keep it short (under 50 words).
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text || "...";
    } catch (e) {
        return "Error communicating with System core.";
    }
}

// Generate simple Daily Quests without API to save latency on load, 
// or could be enhanced with API if needed.
export const generateDailyQuests = (profession: string, level: number, lang: Language): Quest[] => {
    const templates = [
        { title: "Morning Meditation", desc: "Clear your mind for 15 minutes", stat: StatType.INT },
        { title: "Physical Conditioning", desc: "Do 30 pushups", stat: StatType.STR },
        { title: "Wealth Accumulation", desc: "Save $5 today", stat: StatType.LUCK },
        { title: "Knowledge Absorption", desc: "Read 10 pages", stat: StatType.INT },
    ];

    // Simple randomization
    const selected = templates.sort(() => 0.5 - Math.random()).slice(0, 3);

    return selected.map(t => ({
        id: crypto.randomUUID(),
        title: t.title, // In a real app, translate these based on 'lang'
        description: t.desc,
        difficulty: "E",
        rarity: Rarity.COMMON,
        expReward: 20 + (level * 2),
        goldReward: 10,
        statRewards: { [t.stat]: 1 },
        isCompleted: false,
        type: 'Daily',
        realLifeTask: t.title
    }));
}

const fallbackQuest = (input: string) => ({
  title: "Manual Override Quest",
  description: `Complete the task: ${input}`,
  difficulty: "F",
  rarity: "Common",
  expReward: 50,
  goldReward: 10,
  statType: "Luck",
  statAmount: 1
});