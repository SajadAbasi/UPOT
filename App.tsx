import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Questionnaire } from './components/Questionnaire';
import { ReportView } from './components/ReportView';
import { ChatInterface } from './components/ChatInterface';
import { AppState, UserProfile, UserAnswer } from './types';
import { QUESTIONS } from './constants';
import { generateAnalysisReport } from './services/geminiService';
import { MOCK_USERS } from './mockData';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.Dashboard);
  // Initialize with MOCK_USERS
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const handleStartNew = (name: string, gender: 'male' | 'female', age: number) => {
    const newUser: UserProfile = {
      id: Date.now().toString(),
      name,
      gender,
      age,
      religion: 'نامشخص',
      dominantTrait: 'در حال بررسی',
      dateCreated: new Date().toLocaleDateString('fa-IR'),
      answers: []
    };
    setUsers([newUser, ...users]); // Add new user to top of list
    setCurrentUser(newUser);
    setState(AppState.Questionnaire);
  };

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.analysis) {
      setState(AppState.Report);
    } else {
      // Resume or start questionnaire
      setState(AppState.Questionnaire);
    }
  };

  const handleQuestionnaireComplete = async (answers: UserAnswer[]) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, answers };
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    
    setState(AppState.Analyzing);

    try {
      const report = await generateAnalysisReport(answers, QUESTIONS, updatedUser.name, updatedUser.gender);
      // Determine dominant trait and religion loosely from analysis for the dashboard card
      // In a real app, the API would return these specifically. Here we infer or leave as is.
      const analyzedUser = { ...updatedUser, analysis: report };
      
      setUsers(prev => prev.map(u => u.id === analyzedUser.id ? analyzedUser : u));
      setCurrentUser(analyzedUser);
      setState(AppState.Report);
    } catch (error) {
      console.error("Report generation failed", error);
      setState(AppState.Dashboard);
    }
  };

  // New function to save profile image
  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  return (
    <div className="font-sans antialiased">
      {state === AppState.Dashboard && (
        <WelcomeScreen 
          users={users} 
          onStartNew={handleStartNew}
          onSelectUser={handleSelectUser}
        />
      )}

      {state === AppState.Questionnaire && currentUser && (
        <Questionnaire 
          onComplete={handleQuestionnaireComplete} 
          userName={currentUser.name}
        />
      )}

      {state === AppState.Analyzing && (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">در حال تحلیل شخصیت...</h2>
          <p className="text-gray-400">لطفا صبور باشید، تحلیل 500 پاسخ دقیق ممکن است کمی زمان ببرد.</p>
        </div>
      )}

      {(state === AppState.Report || state === AppState.Chat) && currentUser && currentUser.analysis && (
        <>
            <ReportView 
                data={currentUser.analysis} 
                user={currentUser}
                onRestart={() => setState(AppState.Dashboard)}
                onOpenChat={() => setState(AppState.Chat)}
                onUpdateUser={handleUpdateUser}
            />
            {state === AppState.Chat && (
                <ChatInterface 
                    analysis={currentUser.analysis}
                    user={currentUser}
                    onClose={() => setState(AppState.Report)}
                />
            )}
        </>
      )}
    </div>
  );
};

export default App;