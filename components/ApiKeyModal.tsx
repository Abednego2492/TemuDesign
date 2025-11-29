
import React, { useState } from 'react';
import { validateCustomApiKey } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [inputKey, setInputKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!inputKey.trim()) {
      setError("API Key cannot be empty");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Logic changed: This will now THROW if invalid, so we catch the real error.
      await validateCustomApiKey(inputKey);
      onSuccess(inputKey);
      onClose();
    } catch (err: any) {
      // Display the specific error message (e.g., "Permission denied", "Quota exceeded")
      // This is crucial for users bringing their own keys from different projects.
      setError(err.message || "Validation failed. Check your key.");
    } finally {
      setIsValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-black/95 transition-opacity backdrop-blur-md" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative inline-block align-bottom bg-zinc-900 border border-lime-400/30 rounded-sm text-left overflow-hidden shadow-[0_0_50px_rgba(163,230,53,0.15)] transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-lime-400/10 sm:mx-0 sm:h-10 sm:w-10 border border-lime-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-lime-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-xl leading-6 font-bold text-white uppercase tracking-wide brand-font flex items-center gap-2">
                  Bring Your Own Key <span className="text-[10px] bg-lime-400 text-black px-1 rounded-sm">PRO</span>
                </h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-zinc-400">
                    To use the <strong>Gemini 3 Pro (Nano Banana)</strong> model, you must provide your own API key from a paid Google Cloud project.
                  </p>
                  <p className="text-xs text-zinc-500 font-mono border-l-2 border-lime-400 pl-2">
                    Tip: Ensure "Generative Language API" is enabled in your Google Cloud Console for this key.
                  </p>
                </div>

                <div className="mt-6">
                  <label className="block text-xs font-bold text-lime-400 uppercase tracking-wider mb-1">Enter Google GenAI API Key</label>
                  <input 
                    type="password" 
                    placeholder="AIzaSy..."
                    className="w-full bg-black text-white font-mono text-sm rounded-sm border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 p-3 transition-colors"
                    value={inputKey}
                    onChange={e => setInputKey(e.target.value)}
                  />
                  {error && (
                    <div className="mt-2 p-2 bg-red-900/20 border border-red-500/50 rounded-sm">
                        <p className="text-xs text-red-400 font-bold uppercase flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                        </svg>
                        Validation Error:
                        </p>
                        <p className="text-[10px] text-red-300 font-mono mt-1 break-all">
                            {error}
                        </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-zinc-700">
            <button 
              type="button" 
              className={`w-full inline-flex justify-center items-center gap-2 rounded-sm border border-transparent shadow-sm px-6 py-2 bg-lime-400 text-base font-bold text-black uppercase tracking-wider hover:bg-lime-300 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors ${isValidating ? 'opacity-70 cursor-wait' : ''}`}
              onClick={handleValidate}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Validating...
                </>
              ) : "Validate & Save"}
            </button>
            <button 
              type="button" 
              className="mt-3 w-full inline-flex justify-center rounded-sm border border-zinc-600 shadow-sm px-6 py-2 bg-transparent text-base font-medium text-zinc-300 uppercase tracking-wider hover:bg-zinc-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              onClick={onClose}
              disabled={isValidating}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
