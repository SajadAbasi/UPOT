import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  users: UserProfile[];
  onStartNew: (name: string, gender: 'male' | 'female', age: number) => void;
  onSelectUser: (user: UserProfile) => void;
}

export const WelcomeScreen: React.FC<Props> = ({ users, onStartNew, onSelectUser }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleStart = () => {
    if (newName.trim() && gender && newAge) {
      onStartNew(newName, gender, Number(newAge));
      setIsAdding(false);
      setNewName('');
      setNewAge('');
      setGender(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("6037991781588474");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white relative overflow-hidden font-sans">
       {/* Decorative Background (Fixed) */}
       <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
       </div>

       {/* HEADER: Fixed Top */}
       <header className="z-30 w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-800 shadow-md flex-none">
         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-blue-500 font-sans">
                      نقطه پرواز
                  </h1>
                  <div className="text-xs md:text-sm text-gray-400">خودشناسی با هوش مصنوعی</div>
               </div>
            </div>

            <button
                onClick={() => setIsAdding(true)}
                className="bg-accent text-gray-900 px-4 py-2 md:px-6 rounded-xl font-bold hover:bg-blue-400 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 text-sm md:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden md:inline">افزودن کاربر جدید</span>
              <span className="md:hidden">افزودن</span>
            </button>
         </div>
       </header>

       {/* MAIN CONTENT: Scrollable Area */}
       <main className="z-10 flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
         <div className="max-w-7xl mx-auto w-full pb-4">
            {isAdding && (
                <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-gray-800 border border-gray-700 p-8 rounded-3xl shadow-2xl animate-fadeIn">
                        <h2 className="text-2xl font-bold mb-6 text-center text-white">کاربر جدید</h2>
                        
                        <div className="space-y-6">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="نام خود را وارد کنید..."
                                className="w-full px-4 py-4 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-center text-xl"
                            />

                            <input
                                type="number"
                                value={newAge}
                                onChange={(e) => setNewAge(Number(e.target.value))}
                                placeholder="سن..."
                                className="w-full px-4 py-4 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-center text-xl"
                            />

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setGender('male')}
                                    className={`flex-1 py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                        gender === 'male' 
                                        ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'
                                    }`}
                                >
                                    <span className="text-2xl">👦</span>
                                    <span>پسر</span>
                                </button>
                                <button
                                    onClick={() => setGender('female')}
                                    className={`flex-1 py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                        gender === 'female' 
                                        ? 'bg-pink-600/20 border-pink-500 text-pink-400' 
                                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'
                                    }`}
                                >
                                    <span className="text-2xl">👧</span>
                                    <span>دختر</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="flex-1 py-3 bg-gray-700 rounded-xl text-gray-300 font-bold hover:bg-gray-600 transition-all"
                            >
                                انصراف
                            </button>
                            <button
                                onClick={handleStart}
                                disabled={!newName || !gender || !newAge}
                                className="flex-1 py-3 bg-accent rounded-xl text-gray-900 font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                شروع آزمون
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map(user => (
                  <div 
                    key={user.id} 
                    className="relative flex flex-col p-5 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all group min-h-[220px]"
                  >
                    <div className="flex-1">
                       <div className="flex justify-between items-start mb-3">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg ${
                             user.gender === 'male' 
                             ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white' 
                             : 'bg-gradient-to-br from-pink-500 to-pink-700 text-white'
                         }`}>
                            {user.name.charAt(0)}
                         </div>
                         <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-lg border border-gray-700">
                             {user.age ? `${user.age} ساله` : 'نامشخص'}
                         </span>
                       </div>
                       
                       <h3 className="text-xl font-bold text-white mb-2 truncate" title={user.name}>{user.name}</h3>
                       
                       <div className="space-y-2 mb-3">
                           <div className="flex items-center gap-2 text-xs text-gray-300 bg-gray-800/50 p-1.5 rounded-lg">
                               <span className="text-emerald-400">🕌</span>
                               <span className="truncate" title={user.religion}>{user.religion || 'نامشخص'}</span>
                           </div>
                           <div className="flex items-center gap-2 text-xs text-gray-300 bg-gray-800/50 p-1.5 rounded-lg">
                               <span className="text-amber-400">⭐</span>
                               <span className="truncate" title={user.dominantTrait}>{user.dominantTrait || '---'}</span>
                           </div>
                       </div>
                    </div>
                    
                    <button
                        onClick={() => onSelectUser(user)}
                        className="w-full py-2.5 mt-2 bg-gray-700 group-hover:bg-gray-600 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-gray-600 group-hover:border-gray-500"
                    >
                        {user.analysis ? 'مشاهده پرونده' : 'ادامه آزمون'}
                    </button>
                  </div>
                ))}
            </div>
         </div>
       </main>

       {/* FOOTER: Fixed Bottom */}
       <footer className="z-30 w-full bg-gray-900/90 backdrop-blur-md border-t border-gray-800 p-3 md:p-4 flex-none">
          <div className="max-w-2xl mx-auto">
             <div 
                 onClick={handleCopy}
                 className="bg-gray-800/50 border border-gray-700 rounded-2xl p-3 text-center cursor-pointer hover:border-yellow-500/50 transition-all group relative overflow-hidden"
              >
                  <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <p className="text-gray-300 text-xs md:text-sm mb-2 leading-relaxed">
                      در صورت رضایت شما و جهت تشویق سازنده (سجاد عباسی) برای ادامه کار به صورت رایگان، هر چه قدر که تونستید حساب ما رو شارژ کنید. با تشکر
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                      <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-600">
                          <span className="text-yellow-500 font-bold text-base font-mono tracking-wider dir-ltr">6037-9917-8158-8474</span>
                          <span className="text-[10px] text-gray-400 border-r border-gray-600 pr-2 mr-1">بانک ملی</span>
                      </div>
                  </div>
                  
                  <div className={`text-[10px] mt-1 transition-colors ${copied ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
                      {copied ? 'شماره کارت کپی شد! ✅' : 'برای کپی شماره کارت کلیک کنید'}
                  </div>
              </div>
          </div>
       </footer>
    </div>
  );
};