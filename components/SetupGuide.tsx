
import React from 'react';
import { AlertTriangle, Clipboard } from 'lucide-react';

const codeSnippet = `
// services/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

// 1. Paste your Supabase Project URL here
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';

// 2. Paste your Supabase anon key here
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

// ... rest of the file
`.trim();

const SetupGuide: React.FC = () => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSnippet);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-roboto">
      <div className="w-full max-w-3xl bg-black/50 backdrop-blur-sm rounded-lg border border-yellow-500/30 shadow-lg shadow-yellow-500/10 p-8">
        <div className="flex items-center gap-4 mb-6">
          <AlertTriangle className="w-10 h-10 text-yellow-400" />
          <h1 className="text-3xl font-orbitron font-bold text-yellow-300">Project Setup Required</h1>
        </div>
        <p className="text-gray-300 mb-4">
          Welcome to Radium Label! To get started, you need to connect the application to your Supabase backend.
        </p>
        <p className="text-gray-300 mb-6">
          Please follow these two simple steps:
        </p>
        <div className="space-y-6">
          <div className="p-4 rounded-md bg-gray-900/50 border border-gray-700">
            <h2 className="font-bold text-lg text-brand-blue-light mb-2">Step 1: Find your Supabase Credentials</h2>
            <ol className="list-decimal list-inside text-gray-400 space-y-1">
              <li>Go to your Supabase Project Dashboard.</li>
              <li>Navigate to <span className="font-mono text-cyan-400 bg-gray-800 px-1 rounded">Settings &gt; API</span>.</li>
              <li>You will find your <span className="font-semibold text-white">Project URL</span> and your <span className="font-semibold text-white">Project API Key (anon public)</span> there.</li>
            </ol>
          </div>
          <div className="p-4 rounded-md bg-gray-900/50 border border-gray-700">
            <h2 className="font-bold text-lg text-brand-blue-light mb-2">Step 2: Update the Configuration File</h2>
            <p className="text-gray-400 mb-4">
              Open the file <code className="font-mono text-cyan-400 bg-gray-800 px-1 rounded">services/supabaseClient.ts</code> in your editor and replace the placeholder values with the credentials you found in Step 1.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 relative">
              <button onClick={copyToClipboard} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-md transition-colors">
                <Clipboard size={16} />
              </button>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code className="language-typescript">{codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
        <p className="text-center text-gray-500 mt-8">
          Once you have saved the changes, please refresh this page.
        </p>
      </div>
    </div>
  );
};

export default SetupGuide;
