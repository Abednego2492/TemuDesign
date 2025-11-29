
import React, { useState, useEffect } from 'react';
import { TextSuggestion } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (textData: TextSuggestion) => void;
  initialData: TextSuggestion;
}

const TextSuggestionModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, initialData }) => {
  const [formData, setFormData] = useState<TextSuggestion>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-black/90 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative inline-block align-bottom bg-zinc-900 border border-zinc-700 rounded-sm text-left overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] transform transition-all sm:my-8 sm:align-middle sm:max-w-xl w-full">
          <div className="bg-zinc-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-lime-400/10 sm:mx-0 sm:h-10 sm:w-10 border border-lime-400/20">
                <svg className="h-5 w-5 text-lime-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-xl leading-6 font-bold text-white uppercase tracking-wide brand-font" id="modal-title">
                  AI Text Suggestions
                </h3>
                <div className="mt-2 text-sm text-zinc-400">
                  <p>Review and edit the neural generated content below.</p>
                </div>

                <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div>
                    <label className="block text-xs font-bold text-lime-400 uppercase tracking-wider mb-1">Headline</label>
                    <input 
                      type="text" 
                      className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 p-3 sm:text-sm placeholder-zinc-600 transition-colors"
                      value={formData.headline}
                      onChange={e => setFormData({...formData, headline: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-lime-400 uppercase tracking-wider mb-1">Subtext 1</label>
                        <input 
                          type="text" 
                          className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 p-3 sm:text-sm placeholder-zinc-600 transition-colors"
                          value={formData.subheadline}
                          onChange={e => setFormData({...formData, subheadline: e.target.value})}
                        />
                      </div>
                       {formData.subheadline_2 !== undefined && (
                          <div>
                            <label className="block text-xs font-bold text-lime-400 uppercase tracking-wider mb-1">Subtext 2 (Sec. Info)</label>
                            <input 
                              type="text" 
                              className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 p-3 sm:text-sm placeholder-zinc-600 transition-colors"
                              value={formData.subheadline_2 || ""}
                              onChange={e => setFormData({...formData, subheadline_2: e.target.value})}
                            />
                          </div>
                       )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-lime-400 uppercase tracking-wider mb-1">Body 1</label>
                    <textarea 
                      rows={2}
                      className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 p-3 sm:text-sm placeholder-zinc-600 transition-colors"
                      value={formData.body}
                      onChange={e => setFormData({...formData, body: e.target.value})}
                    />
                  </div>
                  
                  {formData.body_2 !== undefined && (
                      <div>
                        <label className="block text-xs font-bold text-lime-400 uppercase tracking-wider mb-1">Body 2 (Details)</label>
                        <textarea 
                          rows={2}
                          className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 p-3 sm:text-sm placeholder-zinc-600 transition-colors"
                          value={formData.body_2 || ""}
                          onChange={e => setFormData({...formData, body_2: e.target.value})}
                        />
                      </div>
                  )}

                  {formData.highlights !== undefined && (
                      <div>
                        <label className="block text-xs font-bold text-lime-400 uppercase tracking-wider mb-1">Highlights (Bullets)</label>
                        <input 
                          type="text" 
                          className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 p-3 sm:text-sm placeholder-zinc-600 transition-colors"
                          value={formData.highlights || ""}
                          onChange={e => setFormData({...formData, highlights: e.target.value})}
                        />
                      </div>
                  )}

                   <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-lime-400 uppercase tracking-wider mb-1">Call to Action</label>
                        <input 
                        type="text" 
                        className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 p-3 sm:text-sm placeholder-zinc-600 transition-colors"
                        value={formData.cta}
                        onChange={e => setFormData({...formData, cta: e.target.value})}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-lime-400 uppercase tracking-wider mb-1">Tagline</label>
                        <input 
                        type="text" 
                        className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 p-3 sm:text-sm placeholder-zinc-600 transition-colors"
                        value={formData.tagline}
                        onChange={e => setFormData({...formData, tagline: e.target.value})}
                        />
                    </div>
                   </div>
                </div>

              </div>
            </div>
          </div>
          <div className="bg-zinc-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-zinc-700">
            <button 
              type="button" 
              className="w-full inline-flex justify-center rounded-sm border border-transparent shadow-sm px-6 py-2 bg-lime-400 text-base font-bold text-black uppercase tracking-wider hover:bg-lime-300 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              onClick={() => onConfirm(formData)}
            >
              Generate Poster
            </button>
            <button 
              type="button" 
              className="mt-3 w-full inline-flex justify-center rounded-sm border border-zinc-600 shadow-sm px-6 py-2 bg-transparent text-base font-medium text-zinc-300 uppercase tracking-wider hover:bg-zinc-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextSuggestionModal;
