import React, { useState, useEffect } from 'react';
import { AnalysisReport, UserProfile, DimensionDetail } from '../types';
import { generateVisualSelf } from '../services/geminiService';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { QUESTIONS } from '../constants';

interface Props {
  data: AnalysisReport;
  user: UserProfile;
  onRestart: () => void;
  onOpenChat: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

// Full Detail View Component
const DetailView: React.FC<{ detail: DimensionDetail, onBack: () => void }> = ({ detail, onBack }) => {
    return (
        <div className="animate-slideInRight">
            <button 
                onClick={onBack}
                className="mb-4 text-accent flex items-center gap-2 hover:underline"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                بازگشت به لیست
            </button>
            
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{detail.title}</h2>
                    <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-xl border border-gray-600">
                        <span className="text-gray-400">نمره:</span>
                        <span className={`text-2xl font-bold ${
                            detail.score > 70 ? 'text-emerald-400' : 
                            detail.score > 40 ? 'text-yellow-400' : 'text-red-400'
                        }`}>{detail.score}</span>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Analysis List */}
                    <div>
                        <h4 className="text-lg font-bold text-accent mb-4 flex items-center gap-2">
                             🔍 تحلیل و کالبدشکافی
                        </h4>
                        <ul className="space-y-3">
                            {detail.analysis.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                                    <span className="text-accent mt-1 text-lg">•</span>
                                    <p className="text-gray-300 leading-relaxed text-justify">{item}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Root Cause */}
                    <div className="bg-gradient-to-r from-purple-900/30 to-gray-900 p-6 rounded-2xl border border-purple-500/30">
                        <h4 className="text-lg font-bold text-purple-400 mb-2 flex items-center gap-2">
                             🌱 ریشه‌شناسی عمیق (Root Cause)
                        </h4>
                        <p className="text-gray-200 leading-loose text-justify font-medium">{detail.rootCause}</p>
                    </div>

                    {/* SWOT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-900/10 border border-emerald-500/20 p-5 rounded-2xl">
                            <h4 className="text-emerald-400 font-bold mb-3 uppercase tracking-wider">نقاط قوت</h4>
                            <ul className="space-y-2">
                                {detail.strengths?.map((s, i) => (
                                    <li key={i} className="flex items-center gap-2 text-gray-300">
                                        <span className="text-emerald-500">+</span> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-red-900/10 border border-red-500/20 p-5 rounded-2xl">
                            <h4 className="text-red-400 font-bold mb-3 uppercase tracking-wider">نقاط ضعف</h4>
                            <ul className="space-y-2">
                                {detail.weaknesses?.map((w, i) => (
                                    <li key={i} className="flex items-center gap-2 text-gray-300">
                                        <span className="text-red-500">-</span> {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Card for Grid View
const DimensionGridCard: React.FC<{ title: string, score: number, onClick: () => void }> = ({ title, score, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 shadow-lg group"
    >
        <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center group-hover:bg-accent group-hover:text-gray-900 transition-colors text-2xl text-gray-500">
                 📊
             </div>
             <span className={`text-xl font-bold ${score > 70 ? 'text-emerald-400' : score > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                 {score}
             </span>
        </div>
        <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{title}</h3>
        <p className="text-xs text-gray-500 mt-2">برای مشاهده تحلیل دقیق کلیک کنید</p>
    </div>
);

type TabType = 'overview' | 'individual' | 'social' | 'material' | 'spiritual' | 'scenarios' | 'growth' | 'profile' | 'intervention';

export const ReportView: React.FC<Props> = ({ data, user, onRestart, onOpenChat, onUpdateUser }) => {
  const [visualSelfUrl, setVisualSelfUrl] = useState<string | null>(user.profileImage || null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedDetail, setSelectedDetail] = useState<DimensionDetail | null>(null);
  const [showAnswersModal, setShowAnswersModal] = useState(false);

  // Reset detail view when changing tabs
  useEffect(() => {
      setSelectedDetail(null);
  }, [activeTab]);

  const chartData = [
    { name: 'فردگرایی', value: data.scores.individualism },
    { name: 'اجتماعی', value: data.scores.social },
    { name: 'مذهبی', value: data.scores.religious },
    { name: 'مادی‌گرایی', value: data.scores.materialism },
    { name: 'صداقت', value: data.scores.honesty },
    { name: 'عفت', value: data.scores.sexualHealth },
    { name: 'صبوری', value: data.scores.patience },
  ];

  useEffect(() => {
    let active = true;
    const generateAuto = async () => {
        if (!visualSelfUrl) {
            const url = await generateVisualSelf(data.visualSelfPrompt);
            if (active && url) {
                setVisualSelfUrl(url);
                onUpdateUser({ ...user, profileImage: url });
            }
        }
    }
    generateAuto();
    return () => { active = false; };
  }, [data.visualSelfPrompt, visualSelfUrl]);

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-4 flex flex-wrap justify-between items-center gap-4">
        <div>
           <h1 className="text-xl font-bold text-accent">گزارش جامع: {user.name}</h1>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setShowAnswersModal(true)} className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm">پاسخ‌نامه</button>
            <button onClick={onOpenChat} className="px-4 py-2 bg-accent text-gray-900 font-bold rounded-lg text-sm">گفتگو با خود</button>
            <button onClick={onRestart} className="px-4 py-2 bg-red-900/30 text-red-300 border border-red-900/50 rounded-lg text-sm">خروج</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        
        {/* SIDEBAR: Profile & Chart (Left - 3 Cols) */}
        <div className="lg:col-span-3 space-y-6">
            <div className="bg-gray-800 rounded-3xl p-6 border border-gray-700 shadow-xl text-center">
                <div className="w-40 h-40 mx-auto rounded-full bg-gray-900 overflow-hidden mb-4 border-4 border-accent shadow-lg">
                    {visualSelfUrl ? <img src={visualSelfUrl} className="w-full h-full object-cover" /> : <span className="text-4xl leading-[160px]">👤</span>}
                </div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{user.religion} | {user.dominantTrait}</p>
                
                 <div className="h-64 w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                        <PolarGrid stroke="#4b5563" />
                        <PolarAngleAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#e5e7eb', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="User" dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* MAIN CONTENT: Tabs & Detail (Right - 9 Cols) */}
        <div className="lg:col-span-9 flex flex-col min-h-[600px]">
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide border-b border-gray-800">
                {[
                    {id: 'overview', label: '📊 نمای کلی'},
                    {id: 'individual', label: '👤 فردی'},
                    {id: 'social', label: '👥 اجتماعی'},
                    {id: 'material', label: '💼 مادی'},
                    {id: 'spiritual', label: '🕌 معنوی'},
                    {id: 'scenarios', label: '🎭 سناریوها'},
                    // Green Strategic Tabs
                    {id: 'growth', label: '🌱 نقشه رشد', green: true},
                    {id: 'profile', label: '🆔 پروفایل خروجی', green: true},
                    {id: 'intervention', label: '🚑 مداخله فوری', green: true},
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`px-4 py-3 rounded-t-xl whitespace-nowrap font-bold transition-all ${
                            activeTab === tab.id 
                            ? (tab.green ? 'bg-emerald-600 text-white' : 'bg-accent text-gray-900') 
                            : (tab.green ? 'bg-emerald-900/30 text-emerald-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700')
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-gray-900/50 rounded-3xl p-1 flex-1 relative">
                
                {/* 1. OVERVIEW (Super Detailed) */}
                {activeTab === 'overview' && (
                    <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 animate-fadeIn">
                        <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">تحلیل جامع و ریشه‌ای شخصیت</h2>
                        <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-loose text-justify whitespace-pre-line">
                             {data.summary}
                        </div>
                    </div>
                )}

                {/* 2. MAIN DIMENSIONS (Grid -> Detail) */}
                {['individual', 'social', 'material', 'spiritual'].includes(activeTab) && (
                    <div className="animate-fadeIn">
                        {/* If detail selected, show detail */}
                        {selectedDetail ? (
                            <DetailView detail={selectedDetail} onBack={() => setSelectedDetail(null)} />
                        ) : (
                            /* Else show grid of cards */
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {Object.entries(data[activeTab as keyof AnalysisReport] || {}).map(([key, val]) => (
                                    <DimensionGridCard 
                                        key={key} 
                                        title={(val as DimensionDetail).title} 
                                        score={(val as DimensionDetail).score} 
                                        onClick={() => setSelectedDetail(val as DimensionDetail)} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. SCENARIOS */}
                {activeTab === 'scenarios' && (
                     <div className="grid grid-cols-1 gap-6 animate-fadeIn">
                        {data.scenarios.map((sc, idx) => (
                            <div key={idx} className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                                <h3 className="text-lg font-bold text-red-400 mb-3">🚨 {sc.scenario}</h3>
                                <div className="mb-3 bg-gray-900 p-4 rounded-xl border-r-4 border-yellow-500">
                                    <span className="text-gray-500 text-xs block mb-1">پیش‌بینی رفتار:</span>
                                    <span className="text-white font-medium">{sc.prediction}</span>
                                </div>
                                <div className="bg-gray-900/50 p-4 rounded-xl border-r-4 border-blue-500">
                                     <span className="text-gray-500 text-xs block mb-1">تحلیل روانشناختی:</span>
                                    <p className="text-gray-300 text-sm leading-relaxed">{sc.analysis}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 4. GREEN TABS */}
                {activeTab === 'growth' && (
                    <div className="bg-emerald-900/20 border border-emerald-500/30 p-8 rounded-3xl animate-fadeIn">
                        <h2 className="text-3xl font-bold text-emerald-400 mb-6">🌱 طراحی نقشه رشد الهی نوجوان</h2>
                        <ul className="space-y-4">
                            {data.divineGrowthMap?.map((step, i) => (
                                <li key={i} className="flex gap-4 items-start bg-gray-900 p-4 rounded-xl border border-emerald-500/20">
                                    <div className="bg-emerald-500 text-gray-900 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                        {i+1}
                                    </div>
                                    <p className="text-gray-200 text-lg leading-relaxed">{step}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="bg-emerald-900/20 border border-emerald-500/30 p-8 rounded-3xl animate-fadeIn">
                        <h2 className="text-3xl font-bold text-emerald-400 mb-6">🆔 پروفایل شخصیتی خروجی</h2>
                        <div className="bg-gray-900 p-6 rounded-2xl border border-emerald-500/20 text-gray-200 text-lg leading-loose text-justify whitespace-pre-line shadow-inner">
                            {data.personalityProfile}
                        </div>
                    </div>
                )}

                {activeTab === 'intervention' && (
                    <div className="bg-red-900/20 border border-red-500/30 p-8 rounded-3xl animate-fadeIn">
                        <h2 className="text-3xl font-bold text-red-400 mb-6">🚑 اولویت‌بندی ابعاد «قابل مداخله فوری»</h2>
                        <div className="grid gap-4">
                             {data.interventionPriorities?.map((item, i) => (
                                 <div key={i} className="bg-gray-900 border-r-4 border-red-500 p-5 rounded-xl flex items-center gap-4">
                                     <span className="text-red-500 text-2xl">⚠️</span>
                                     <span className="text-gray-200 text-lg font-bold">{item}</span>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>

      {/* Answer Modal (Simplified) */}
      {showAnswersModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setShowAnswersModal(false)}>
              <div className="bg-gray-800 p-8 rounded-2xl max-w-2xl w-full h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <h2 className="text-2xl font-bold mb-4 text-white border-b border-gray-700 pb-2">پاسخ‌نامه</h2>
                  {user.answers.map((ans, i) => {
                      const question = QUESTIONS.find(q => q.id === ans.questionId);
                      return (
                      <div key={i} className="mb-4 border-b border-gray-700 pb-4">
                          <p className="text-accent text-sm mb-2 font-bold leading-relaxed">
                              {i+1}. {question?.text || "سوال یافت نشد"}
                          </p>
                          <p className="text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                              {ans.answer}
                          </p>
                      </div>
                  )})}
              </div>
          </div>
      )}
    </div>
  );
};