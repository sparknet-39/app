import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Generator } from './pages/Generator';
import { authService } from './services/mockBackend';
import { User, DocumentFile, GeneratedContent } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedFile, setSelectedFile] = useState<DocumentFile | null>(null);
  const [selectedGen, setSelectedGen] = useState<GeneratedContent | null>(null);

  // Initialize auth state
  useEffect(() => {
    const u = authService.getCurrentUser();
    if (u) {
      setUser(u);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = async (email: string) => {
    const u = await authService.login(email);
    setUser(u);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentPage('landing');
  };

  // Simple Page Routing Logic
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
      case 'login':
      case 'signup':
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
             <div className="mb-8">
               <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase">AI-Powered Learning</span>
             </div>
             <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
               Turn Documents into <br/>
               <span className="text-indigo-600">Smart Quizzes</span> instantly.
             </h1>
             <p className="max-w-2xl text-xl text-gray-500 mb-10">
               Upload your notes, textbooks, or PDFs. SmartPrep extracts the key concepts and generates MCQs, flashcards, and practice questions to help you ace your exams.
             </p>
             
             {currentPage === 'landing' && (
               <div className="space-x-4">
                 <button 
                   onClick={() => setCurrentPage('signup')}
                   className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                 >
                   Get Started for Free
                 </button>
                 <button 
                   onClick={() => setCurrentPage('login')}
                   className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-50 transition"
                 >
                   Sign In
                 </button>
               </div>
             )}

             {(currentPage === 'login' || currentPage === 'signup') && (
               <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">{currentPage === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                  <form onSubmit={(e) => { e.preventDefault(); handleLogin(currentPage === 'login' ? 'student@example.com' : 'newuser@example.com'); }}>
                    <div className="mb-4 text-left">
                      <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                      <input className="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500" type="email" placeholder="student@example.com" defaultValue="student@example.com" />
                    </div>
                    <div className="mb-6 text-left">
                      <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                      <input className="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500" type="password" placeholder="********" />
                    </div>
                    <button className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-indigo-700" type="submit">
                      {currentPage === 'login' ? 'Sign In' : 'Sign Up'}
                    </button>
                    <p className="mt-4 text-sm text-gray-500 cursor-pointer hover:underline" onClick={() => setCurrentPage(currentPage === 'login' ? 'signup' : 'login')}>
                      {currentPage === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                    </p>
                  </form>
               </div>
             )}
          </div>
        );

      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={setCurrentPage} 
            onSelectFile={(f) => { setSelectedFile(f); setCurrentPage('generate'); }}
            onSelectGeneration={(g) => { 
                // In a real app, this would route to a details page. 
                // For now, we simulate "viewing" by loading the generator with result
                alert(`Viewing generation from ${new Date(g.createdAt).toLocaleDateString()}`);
            }}
          />
        );

      case 'generate':
        return (
          <Generator 
            preSelectedFile={selectedFile}
            onGenerationSaved={() => { setSelectedFile(null); }} // Reset selection after save
          />
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      currentPage={currentPage}
      onNavigate={(p) => { 
        if(p === 'generate') setSelectedFile(null); 
        setCurrentPage(p); 
      }}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
