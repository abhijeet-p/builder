import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Wand2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <header className="py-6 flex justify-end">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6 text-white" />}
          </button>
        </header>
        
        <main className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Website Builder AI
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Describe your dream website and let AI bring it to life
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-2xl">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your website (e.g., Create a modern portfolio website with a dark theme...)"
                className="w-full h-32 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 
                          focus:border-blue-500 dark:focus:border-blue-400 outline-none resize-none
                          bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                className="absolute right-4 bottom-4 bg-blue-600 text-white px-4 py-2 rounded-lg
                         flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Wand2 className="w-5 h-5" />
                Generate
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}