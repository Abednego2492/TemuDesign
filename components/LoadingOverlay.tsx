import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 z-10 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center rounded-xl transition-all">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-t-2 border-b-2 border-lime-400 animate-spin shadow-[0_0_20px_rgba(163,230,53,0.4)]"></div>
        <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-r-2 border-l-2 border-zinc-700 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <div className="mt-6 text-center space-y-2">
        <h3 className="text-xl font-bold text-white tracking-widest uppercase animate-pulse">Processing</h3>
        <p className="text-xs font-mono text-lime-400">Gemini 2.5 Neural Engine Active...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;