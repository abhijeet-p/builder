import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, FolderOpen, Code2, Eye } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Editor from "@monaco-editor/react";
import axios from 'axios';
import { BACKEND_URL } from '../config';

interface FileType {
  name: string;
  content: string;
  language: string;
}

export default function BuilderPage() {
  const location = useLocation();
  const { prompt } = location.state as {prompt: string};
  const { theme, toggleTheme } = useTheme();
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  // Mock files for demonstration
  const files: FileType[] = [
    {
      name: 'index.html',
      content: '<!DOCTYPE html><html><body><h1>Hello World</h1></body></html>',
      language: 'html'
    },
    {
      name: 'styles.css',
      content: 'body { margin: 0; padding: 20px; }',
      language: 'css'
    }
  ];

  // const steps = [
  //   "Analyzing prompt...",
  //   "Generating file structure...",
  //   "Creating HTML template...",
  //   "Adding styles...",
  //   "Implementing functionality..."
  // ];
  const steps = [
  ];
  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      message: prompt.trim()
    });
    const {prompts, uiPrompts} = response.data;

  }
  useEffect(()=>{
    init();
  },[])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      <div className="flex h-screen">
        {/* Steps Section - 25% */}
        <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Build Steps</h2>
          <ul className="space-y-2">
            {steps.map((step, index) => (
              <li
                key={index}
                className="flex items-center space-x-2 p-2 rounded bg-gray-100 dark:bg-gray-800"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {index + 1}
                </div>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* File Explorer - 25% (collapsible) */}
        <div className={`${isExplorerOpen ? 'w-1/4' : 'w-12'} border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}>
          <div className="p-4">
            <button
              onClick={() => setIsExplorerOpen(!isExplorerOpen)}
              className="mb-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <FolderOpen className="w-6 h-6" />
            </button>
            
            {isExplorerOpen && (
              <div className="space-y-2">
                {files.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file)}
                    className="w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    {file.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Code/Preview Section - 50% */}
        <div className="flex-1">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center space-x-2 p-2 rounded ${
                    activeTab === 'code' ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`}
                >
                  <Code2 className="w-5 h-5" />
                  <span>Code</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center space-x-2 p-2 rounded ${
                    activeTab === 'preview' ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`}
                >
                  <Eye className="w-5 h-5" />
                  <span>Preview</span>
                </button>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {activeTab === 'code' && selectedFile ? (
                <Editor
                  height="100%"
                  defaultLanguage={selectedFile.language}
                  defaultValue={selectedFile.content}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on'
                  }}
                />
              ) : activeTab === 'preview' ? (
                <iframe
                  className="w-full h-full bg-white"
                  srcDoc={files.find(f => f.name === 'index.html')?.content}
                  title="Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a file to view its contents
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}