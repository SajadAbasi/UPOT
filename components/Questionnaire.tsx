import React, { useState, useEffect, useRef } from 'react';
import { Question, QuestionType, UserAnswer } from '../types';
import { QUESTIONS, LIKERT_OPTIONS } from '../constants';
import { generateSpeech, playPcmAudio } from '../services/geminiService';

interface Props {
  onComplete: (answers: UserAnswer[]) => void;
  userName: string;
}

export const Questionnaire: React.FC<Props> = ({ onComplete, userName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | number>('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Audio Context Ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const currentQuestion = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  // Initialize Audio Context
  useEffect(() => {
      if (!audioContextRef.current) {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
      }
      return () => {
          audioContextRef.current?.close();
      };
  }, []);

  // Effect: Fetch Audio Only
  useEffect(() => {
    let active = true;
    
    const playQuestionAudio = async () => {
      // Stop previous
      if (currentSourceRef.current) {
          try { currentSourceRef.current.stop(); } catch(e){}
      }
      setIsPlaying(true);

      const textToRead = currentQuestion.description 
        ? `${currentQuestion.text}. ${currentQuestion.description}` 
        : currentQuestion.text;
      
      const base64PCM = await generateSpeech(textToRead);
      
      if (active && base64PCM && audioContextRef.current) {
          if(audioContextRef.current.state === 'suspended') {
              await audioContextRef.current.resume();
          }
          const source = await playPcmAudio(base64PCM, audioContextRef.current);
          if (source) {
              currentSourceRef.current = source;
              source.onended = () => setIsPlaying(false);
          } else {
              setIsPlaying(false);
          }
      } else {
          if(active) setIsPlaying(false);
      }
    };

    const timer = setTimeout(playQuestionAudio, 500);

    return () => {
        active = false;
        clearTimeout(timer);
        if (currentSourceRef.current) {
             try { currentSourceRef.current.stop(); } catch(e){}
        }
    };
  }, [currentIndex]); 


  const handleNext = () => {
    const newAnswers = [...answers, { questionId: currentQuestion.id, answer: currentAnswer }];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 md:p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div className="z-10 w-full max-w-3xl mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-400">سوال {currentIndex + 1} از {QUESTIONS.length}</span>
          <div className="flex items-center gap-3">
              {isPlaying && <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
              </span>}
              <span className="text-accent font-bold">{userName}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 h-3 rounded-full mb-8 overflow-hidden">
          <div 
            className="bg-gradient-to-l from-accent to-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="flex-1 flex flex-col justify-center">
            <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-3xl p-6 md:p-10 shadow-xl transition-all duration-300">
                
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold leading-relaxed mb-4 text-white">
                        {currentQuestion.text}
                    </h2>
                    {currentQuestion.description && (
                        <p className="text-gray-400 text-lg leading-relaxed bg-gray-900/50 p-4 rounded-xl border-r-4 border-accent">
                            {currentQuestion.description}
                        </p>
                    )}
                </div>

                {/* Input Area */}
                <div className="space-y-4">
                    {currentQuestion.type === QuestionType.Text && (
                        <textarea
                            className="w-full p-4 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-accent focus:ring-1 focus:ring-accent transition-all min-h-[150px]"
                            placeholder="پاسخ خود را اینجا بنویسید..."
                            value={currentAnswer as string}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                        />
                    )}

                    {currentQuestion.type === QuestionType.Likert && (
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                            {LIKERT_OPTIONS.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentAnswer(option)}
                                    className={`p-4 rounded-xl border transition-all ${
                                        currentAnswer === option 
                                        ? 'bg-accent text-gray-900 border-accent font-bold transform scale-105' 
                                        : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === QuestionType.MultipleChoice && currentQuestion.options && (
                        <div className="grid grid-cols-1 gap-3">
                             {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentAnswer(option)}
                                    className={`p-4 rounded-xl border text-right transition-all ${
                                        currentAnswer === option 
                                        ? 'bg-accent text-gray-900 border-accent font-bold' 
                                        : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Sticky Action Button */}
        <div className="sticky bottom-6 mt-8 z-20">
            <button
                onClick={handleNext}
                disabled={!currentAnswer}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl text-white font-bold text-xl shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {currentIndex === QUESTIONS.length - 1 ? 'پایان و دریافت گزارش' : 'سوال بعدی'}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 rotate-180">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </button>
        </div>
      </div>
    </div>
  );
};