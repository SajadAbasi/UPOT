import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { UserAnswer, Question, AnalysisReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAnalysisReport = async (
  answers: UserAnswer[], 
  questions: Question[],
  userName: string,
  gender: 'male' | 'female'
): Promise<AnalysisReport> => {

  const qaPairs = answers.map(a => {
    const q = questions.find(qu => qu.id === a.questionId);
    return `Q: ${q?.text} \nA: ${a.answer}`;
  }).join('\n');

  const prompt = `
    Role: Grand Ayatollah, Expert Clinical Psychologist, and Profiler.
    Subject: Teenager (${gender}), Name: ${userName}.
    Task: Create a "Powerful", "Deep", and "Professional" 4-Dimensional Profile based on answers.
    
    INSTRUCTIONS:
    1. **Detailed Summary**: The 'summary' must be very long (min 10 paragraphs), explaining the root causes of their behavior.
    2. **24 Dimensions**: You must analyze ALL 24 specific sub-dimensions listed below.
    3. **Green Sections**: Provide actionable strategic advice in the final 3 sections.
    4. **Scenarios**: Analyze the critical scenarios deeply.

    OUTPUT STRUCTURE (JSON):
    - summary: string (LONG TEXT)
    - individual: { identity, emotionalRegulation, impulseControl, willpower, rationality, mentalHealth, physicalHealth }
    - social: { communication, family, friendship, socialEthics, lawAbidance, socialRole }
    - material: { financial, education, careerFuture, lifestyle, appearance }
    - spiritual: { beliefs, connectionWithGod, innerEthics, sufferingMeaning, divineResponsibility, ultimateGoal }
    - divineGrowthMap: string[] (Strategic steps for growth)
    - personalityProfile: string (Final profile summary)
    - interventionPriorities: string[] (Immediate actions needed)
    - scenarios: [...]
    - scores: {...}
    
    Data:
    ${qaPairs.substring(0, 30000)}
  `;

  const dimensionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        score: { type: Type.INTEGER },
        analysis: { type: Type.ARRAY, items: { type: Type.STRING } },
        rootCause: { type: Type.STRING },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    }
  };

  const reportSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      
      individual: {
          type: Type.OBJECT,
          properties: {
              identity: dimensionSchema,
              emotionalRegulation: dimensionSchema,
              impulseControl: dimensionSchema,
              willpower: dimensionSchema,
              rationality: dimensionSchema,
              mentalHealth: dimensionSchema,
              physicalHealth: dimensionSchema,
          }
      },
      social: {
          type: Type.OBJECT,
          properties: {
              communication: dimensionSchema,
              family: dimensionSchema,
              friendship: dimensionSchema,
              socialEthics: dimensionSchema,
              lawAbidance: dimensionSchema,
              socialRole: dimensionSchema,
          }
      },
      material: {
          type: Type.OBJECT,
          properties: {
              financial: dimensionSchema,
              education: dimensionSchema,
              careerFuture: dimensionSchema,
              lifestyle: dimensionSchema,
              appearance: dimensionSchema,
          }
      },
      spiritual: {
          type: Type.OBJECT,
          properties: {
              beliefs: dimensionSchema,
              connectionWithGod: dimensionSchema,
              innerEthics: dimensionSchema,
              sufferingMeaning: dimensionSchema,
              divineResponsibility: dimensionSchema,
              ultimateGoal: dimensionSchema,
          }
      },

      // New Green Sections
      divineGrowthMap: { type: Type.ARRAY, items: { type: Type.STRING } },
      personalityProfile: { type: Type.STRING },
      interventionPriorities: { type: Type.ARRAY, items: { type: Type.STRING } },

      scores: {
        type: Type.OBJECT,
        properties: {
          individualism: { type: Type.INTEGER },
          social: { type: Type.INTEGER },
          religious: { type: Type.INTEGER },
          materialism: { type: Type.INTEGER },
          honesty: { type: Type.INTEGER },
          sexualHealth: { type: Type.INTEGER },
          patience: { type: Type.INTEGER },
          thinking: { type: Type.INTEGER },
          conceptDistinction: { type: Type.INTEGER },
          lieProbability: { type: Type.INTEGER },
        }
      },

      scenarios: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            scenario: { type: Type.STRING },
            prediction: { type: Type.STRING },
            analysis: { type: Type.STRING },
          }
        }
      },

      detectedLies: { type: Type.ARRAY, items: { type: Type.STRING } },
      visualSelfPrompt: { type: Type.STRING },
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reportSchema,
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as AnalysisReport;
  } catch (error) {
    console.error("API Error (Report)", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    // Truncate text to avoid hitting quota limits or high latency for long texts
    const safeText = text.substring(0, 400); 
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: safeText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData?.data) {
        return part.inlineData.data;
    }
    return null;
  } catch (e) {
    console.error("TTS Error", e);
    return null;
  }
};

// PCM Decoding Helpers
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  // Ensure data length is even for Int16Array
  if (data.byteLength % 2 !== 0) {
      data = data.slice(0, data.byteLength - 1);
  }
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const playPcmAudio = async (base64Audio: string, audioContext: AudioContext): Promise<AudioBufferSourceNode | null> => {
    try {
        const bytes = decodeBase64(base64Audio);
        const audioBuffer = await decodeAudioData(bytes, audioContext);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        return source;
    } catch (e) {
        console.error("Error playing audio:", e);
        return null;
    }
};

export const createPersonaChat = (analysis: AnalysisReport, userName: string) => {
    const systemInstruction = `You are the "Virtual Self" (Persona) of a teenager named ${userName}. 
    Base your personality, tone, and hidden thoughts on this psychological profile:
    ${JSON.stringify(analysis.personalityProfile)}
    
    Also consider these detected traits:
    - Dominant Trait: ${analysis.personalityProfile}
    - Detected Lies: ${analysis.detectedLies.join(', ')}
    
    Talk in the first person ("I"). Be deep, slightly mysterious, but helpful. 
    Help ${userName} understand themselves better.
    Language: Persian (Farsi).`;
    
    return ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction },
    });
};

export const generateVisualSelf = async (prompt: string): Promise<string | null> => {
  try {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: {
            parts: [{ text: prompt }]
        },
        config: {
            imageConfig: { aspectRatio: "1:1" }
        }
     });

     for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
     }
     return null;
  } catch (e) {
      console.error("Image Gen Error", e);
      return null;
  }
};