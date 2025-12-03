import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentPage, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div 
                className="flex-shrink-0 flex items-center cursor-pointer"
                onClick={() => onNavigate('landing')}
              >
                <i className="fa-solid fa-graduation-cap text-indigo-600 text-2xl mr-2"></i>
                <span className="font-bold text-xl text-gray-900 tracking-tight">SmartPrep</span>
              </div>
              {user && (
                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`${
                      currentPage === 'dashboard'
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => onNavigate('generate')}
                    className={`${
                      currentPage === 'generate'
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Generate
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center ml-4 space-x-4">
                  <div className="flex items-center">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.avatar}
                      alt={user.name}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                      {user.name}
                    </span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                    title="Logout"
                  >
                    <i className="fa-solid fa-sign-out-alt"></i>
                  </button>
                </div>
              ) : (
                <div className="space-x-4">
                  <button
                    onClick={() => onNavigate('login')}
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => onNavigate('signup')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            &copy; 2025 SmartPrep AI. Powered by Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
};
