
import React, { useState, useRef, useEffect } from 'react';
import { AppMode } from '../types';

interface NavbarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentMode, onModeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (mode: AppMode) => {
    onModeChange(mode);
    setIsOpen(false);
  };

  const getModeLabel = (mode: AppMode) => {
    switch (mode) {
      case AppMode.AUTO_DESIGN: return "Auto Poster Design";
      case AppMode.REFERENCE: return "Reference Style Clone";
      case AppMode.CREATIVE_MANUAL: return "Creative Manual";
      case AppMode.MAGAZINE_ANALYSIS: return "Magazine Vision Analysis";
      case AppMode.AFFILIATOR: return "Affiliator AI Mode";
      default: return "Select Mode";
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="bg-lime-400 p-1.5 rounded-sm shadow-[0_0_10px_rgba(163,230,53,0.5)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-black">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.077-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
              </svg>
            </div>
            <span className="brand-font font-bold text-xl tracking-wider text-white">TEMU<span className="text-lime-400">DESIGN</span></span>
          </div>

          {/* Hamburger / Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={toggleMenu}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-sm text-white hover:border-lime-400 transition-colors focus:outline-none"
            >
              <span className="text-sm font-bold uppercase tracking-wide hidden sm:block">
                {getModeLabel(currentMode)}
              </span>
              <span className="text-sm font-bold uppercase tracking-wide sm:hidden">
                Menu
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-zinc-950 border border-zinc-700 rounded-sm shadow-2xl z-50 overflow-hidden ring-1 ring-lime-400/20">
                <div className="p-2 space-y-1">
                  
                  <MenuOption 
                    active={currentMode === AppMode.AUTO_DESIGN} 
                    onClick={() => handleSelect(AppMode.AUTO_DESIGN)}
                    title="Auto Poster Design"
                    desc="Input Image + AI Text Generation"
                    icon="auto"
                  />
                   <MenuOption 
                    active={currentMode === AppMode.REFERENCE} 
                    onClick={() => handleSelect(AppMode.REFERENCE)}
                    title="Reference Style Clone"
                    desc="Copy Layout from Reference Image"
                    icon="ref"
                  />
                   <MenuOption 
                    active={currentMode === AppMode.CREATIVE_MANUAL} 
                    onClick={() => handleSelect(AppMode.CREATIVE_MANUAL)}
                    title="Creative Manual"
                    desc="Context-Aware Logic Prompts"
                    icon="create"
                  />
                  <MenuOption 
                    active={currentMode === AppMode.MAGAZINE_ANALYSIS} 
                    onClick={() => handleSelect(AppMode.MAGAZINE_ANALYSIS)}
                    title="Magazine Vision"
                    desc="OCR Analysis & Reconstruction"
                    icon="mag"
                  />
                  
                  <div className="h-px bg-zinc-800 my-2"></div>
                  
                  <MenuOption 
                    active={currentMode === AppMode.AFFILIATOR} 
                    onClick={() => handleSelect(AppMode.AFFILIATOR)}
                    title="Affiliator Mode"
                    desc="Professional Product Showcase"
                    icon="affiliate"
                    isNew={true}
                  />

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

interface MenuOptionProps {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  icon: string;
  isNew?: boolean;
}

const MenuOption: React.FC<MenuOptionProps> = ({ active, onClick, title, desc, icon, isNew }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-3 rounded-sm flex items-start gap-3 transition-all
      ${active 
        ? 'bg-lime-400/10 border border-lime-400/30' 
        : 'hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
      }
    `}
  >
    <div className={`mt-1 p-1.5 rounded-sm ${active ? 'bg-lime-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
       {/* Simple Icons based on type */}
       {icon === 'auto' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
       {icon === 'ref' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
       {icon === 'create' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
       {icon === 'mag' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
       {icon === 'affiliate' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h3 className={`text-sm font-bold uppercase tracking-wide ${active ? 'text-lime-400' : 'text-zinc-200'}`}>
          {title}
        </h3>
        {isNew && <span className="bg-lime-400 text-black text-[9px] font-bold px-1 rounded-sm">NEW</span>}
      </div>
      <p className="text-[10px] text-zinc-500 font-medium">{desc}</p>
    </div>
  </button>
);

export default Navbar;
