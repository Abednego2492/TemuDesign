
import React, { useState, useRef, useEffect } from 'react';
import Navbar from './components/Navbar';
import ImageUploader from './components/ImageUploader';
import LoadingOverlay from './components/LoadingOverlay';
import TextSuggestionModal from './components/TextSuggestionModal';
import ApiKeyModal from './components/ApiKeyModal';
import { 
    AppMode, AspectRatio, AspectRatios, DensityLevel, DesignContexts, DesignContextType, 
    Language, MagazineAnalysisResult, PosterStyles, PosterStyleType, TextSuggestion,
    AffiliatorScenes, AffiliatorOutfits, AffiliatorPoses 
} from './types';
import { 
  generatePosterTextSuggestions, 
  generateBatchPosters,
  generateBatchReferencePosters,
  generateCreativeBatchPosters,
  analyzeMagazineLayout,
  generateAffiliatorMarketingImage
} from './services/geminiService';

// --- FEATURE CARD COMPONENT FOR LANDING PAGE ---
interface FeatureCardProps {
  index: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
  previewLabel: string;
  colorClass: string;
  glowClass: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ index, title, desc, icon, previewLabel, colorClass, glowClass }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 } // Trigger when 15% visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  const topOffset = 100 + (index * 40); // Stacking effect offset

  return (
    <div 
      ref={cardRef}
      style={{ top: `${topOffset}px` }}
      className={`sticky bg-zinc-950 border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden group min-h-[500px] flex flex-col justify-center transition-all duration-1000 ease-out transform
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-24 scale-95'}
      `}
    >
      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -mr-20 -mt-20 transition-colors duration-500 opacity-20 group-hover:opacity-30 ${glowClass}`}></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white shadow-lg ${colorClass}`}>
            {icon}
          </div>
          <h3 className="text-4xl font-bold brand-font text-white">{title}</h3>
          <p className="text-zinc-400 text-lg leading-relaxed">{desc}</p>
        </div>
        <div className="flex-1 w-full bg-zinc-900/50 rounded-xl border border-zinc-800 h-64 flex items-center justify-center text-zinc-600 font-mono text-xs">
          [ {previewLabel} ]
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);

  const [mode, setMode] = useState<AppMode>(AppMode.AUTO_DESIGN);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  
  const [error, setError] = useState<string | null>(null);

  // Common Form States
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [refImage, setRefImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  
  const [density, setDensity] = useState<DensityLevel>(DensityLevel.BALANCED);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [selectedStyle, setSelectedStyle] = useState<PosterStyleType>(PosterStyles[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [batchSize, setBatchSize] = useState<number>(1); 

  // Creative Manual States
  const [creativeInstruction, setCreativeInstruction] = useState("");
  const [designContext, setDesignContext] = useState<DesignContextType>(DesignContexts[0]);

  // Magazine Analysis States
  const [magazineImage, setMagazineImage] = useState<string | null>(null);
  const [magazineResult, setMagazineResult] = useState<MagazineAnalysisResult | null>(null);

  // Affiliator Mode States
  const [affiliatorPerson, setAffiliatorPerson] = useState<string | null>(null);
  const [affiliatorProduct, setAffiliatorProduct] = useState<string | null>(null);
  const [affiliatorScene, setAffiliatorScene] = useState<string>(AffiliatorScenes[0]);
  const [affiliatorOutfit, setAffiliatorOutfit] = useState<string>(AffiliatorOutfits[0]);
  const [affiliatorPose, setAffiliatorPose] = useState<string>(AffiliatorPoses[0]);
  
  const [manualScene, setManualScene] = useState("");
  const [manualOutfit, setManualOutfit] = useState("");
  const [manualPose, setManualPose] = useState("");

  // Text Analysis States
  const [showTextModal, setShowTextModal] = useState(false);
  const [suggestedText, setSuggestedText] = useState<TextSuggestion>({ headline: '', subheadline: '', body: '', cta: '', tagline: '' });

  // --- MODEL SELECTION / BYOK ---
  const [useProModel, setUseProModel] = useState(false);
  const [customApiKey, setCustomApiKey] = useState<string | undefined>(undefined);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const handleReset = () => {
    setMainImage(null);
    setRefImage(null);
    setLogoImage(null);
    setMagazineImage(null);
    setMagazineResult(null);
    setAffiliatorPerson(null);
    setAffiliatorProduct(null);
    setGeneratedImages([]);
    setSelectedResultIndex(0);
    setError(null);
    setCreativeInstruction("");
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    handleReset();
  };

  const handleProToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = e.target.checked;
      if (isChecked && !customApiKey) {
          // If trying to enable Pro but no key, show modal
          setShowApiKeyModal(true);
      } else {
          setUseProModel(isChecked);
      }
  };

  const handleApiKeySuccess = (key: string) => {
      setCustomApiKey(key);
      setUseProModel(true);
  };

  // --- Handlers ---

  const handleSuggestText = async () => {
    if (!mainImage) {
        setError("Please upload a product image first.");
        return;
    }
    setLoading(true);
    setLoadingMessage("Analyzing image & generating creative text...");
    setError(null);
    try {
        const result = await generatePosterTextSuggestions(mainImage, density, language, selectedStyle, customApiKey);
        if (result) {
            setSuggestedText(result);
            setShowTextModal(true);
        }
    } catch (e) {
        setError("Failed to generate text suggestions.");
    } finally {
        setLoading(false);
    }
  };

  const handleFinalGenerate = async (finalText?: TextSuggestion) => {
    setShowTextModal(false);
    setError(null);
    const modelLabel = useProModel ? "Gemini 3 Pro" : "Gemini 2.5 Flash";
    setLoading(true);
    setLoadingMessage(`Designing ${batchSize} variations with ${modelLabel}...`);
    setGeneratedImages([]);
    setSelectedResultIndex(0);

    try {
      if (!mainImage) throw new Error("Missing image");
      const results = await generateBatchPosters(
          mainImage, 
          selectedStyle, 
          finalText || suggestedText, 
          aspectRatio, 
          batchSize,
          useProModel,
          customApiKey
      );
      if (results.length === 0) throw new Error("Failed to generate any images.");
      setGeneratedImages(results);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleReferenceGenerate = async () => {
    setError(null);
    const modelLabel = useProModel ? "Gemini 3 Pro" : "Gemini 2.5 Flash";
    setLoading(true);
    setLoadingMessage(`Creating ${batchSize} styled variations with ${modelLabel}...`);
    setGeneratedImages([]);
    setSelectedResultIndex(0);

    try {
        if (!mainImage) throw new Error("Product Image is required");
        if (!refImage) throw new Error("Style Reference Image is required");
        
        const results = await generateBatchReferencePosters(
            mainImage, 
            refImage, 
            language, 
            aspectRatio, 
            logoImage, 
            batchSize,
            useProModel,
            customApiKey
        );
         if (results.length === 0) throw new Error("Failed to generate any images.");
        setGeneratedImages(results);
    } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  const handleCreativeGenerate = async () => {
    if (!creativeInstruction.trim()) {
      setError("Please provide an instruction for the design.");
      return;
    }
    setError(null);
    const modelLabel = useProModel ? "Gemini 3 Pro" : "Gemini 2.5 Flash";
    setLoading(true);
    setLoadingMessage(`Crafting ${batchSize} creative designs with ${modelLabel}...`);
    setGeneratedImages([]);
    setSelectedResultIndex(0);

    try {
        const results = await generateCreativeBatchPosters(
            creativeInstruction,
            designContext,
            aspectRatio,
            batchSize,
            useProModel,
            customApiKey
        );
        if (results.length === 0) throw new Error("Failed to generate any images.");
        setGeneratedImages(results);
    } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  const handleMagazineAnalysis = async () => {
      if (!magazineImage) {
          setError("Please upload an image to analyze.");
          return;
      }
      setLoading(true);
      setLoadingMessage("Enhanced Vision: Reading Text & Layout...");
      setError(null);
      setMagazineResult(null);

      try {
          const result = await analyzeMagazineLayout(magazineImage, customApiKey);
          if (result) {
              setMagazineResult(result);
          }
      } catch (e: any) {
          setError("Analysis failed: " + e.message);
      } finally {
          setLoading(false);
      }
  }

  const handleAffiliatorGenerate = async () => {
      if (!affiliatorPerson || !affiliatorProduct) {
          setError("Please upload both your Portrait and the Product photo.");
          return;
      }
      
      const finalScene = manualScene.trim() ? manualScene : affiliatorScene;
      const finalOutfit = manualOutfit.trim() ? manualOutfit : affiliatorOutfit;
      const finalPose = manualPose.trim() ? manualPose : affiliatorPose;

      setError(null);
      const modelLabel = useProModel ? "Gemini 3 Pro" : "Gemini 2.5 Flash";
      setLoading(true);
      setLoadingMessage("Phase 1: Analyzing Portrait & Product details...");
      setGeneratedImages([]);
      setSelectedResultIndex(0);

      try {
          // The analysis happens inside generateAffiliatorMarketingImage now for simplicity in batching, 
          // but logically we described it as a pre-step. 
          // We'll update the loading message momentarily.
          setTimeout(() => setLoadingMessage(`Phase 2: Compositing ${batchSize} Photorealistic Scenes (${modelLabel})...`), 2000);

          const results = await generateAffiliatorMarketingImage(
              affiliatorPerson,
              affiliatorProduct,
              finalScene,
              finalOutfit,
              finalPose,
              aspectRatio,
              batchSize,
              useProModel,
              customApiKey
          );
           if (results.length === 0) throw new Error("Failed to generate any images.");
          setGeneratedImages(results);

      } catch (e: any) {
          setError(e.message || "Affiliator generation failed.");
      } finally {
          setLoading(false);
      }
  }

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  const downloadImage = (url: string) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `TEMUDESIGN_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // --- LANDING PAGE ---
  if (showLanding) {
    const features = [
      {
        title: "Auto Poster Design",
        desc: "Upload a product photo and let our Neural Engine generate perfect marketing copy and poster layouts instantly. Control text density from minimal headers to detailed infographics.",
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
        previewLabel: "SYSTEM INTERFACE PREVIEW",
        colorClass: "bg-lime-400 text-black",
        glowClass: "bg-lime-900/20 group-hover:bg-lime-500/20"
      },
      {
        title: "Reference Style Clone",
        desc: "Have a design you love? Upload it as a reference. Our AI extracts the layout, typography, and vibe, then reapplies it to YOUR product with your brand colors.",
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
        previewLabel: "STYLE TRANSFER PREVIEW",
        colorClass: "bg-indigo-500 text-white",
        glowClass: "bg-indigo-900/20 group-hover:bg-indigo-500/20"
      },
      {
        title: "Affiliator AI Mode",
        desc: "Create raw, authentic, 'User Generated Content' style photos. Perfect for TikTok Shop and Affiliate marketing. Select scenes, outfits, and poses to showcase products naturally.",
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        previewLabel: "UGC GENERATOR PREVIEW",
        colorClass: "bg-rose-500 text-white",
        glowClass: "bg-rose-900/20 group-hover:bg-rose-500/20"
      },
      {
        title: "Magazine Vision Analysis",
        desc: "Upload any magazine cover or poster. Our Enhanced Vision AI performs OCR, extracts text, analyzes the layout hierarchy, and generates a recreation prompt for you.",
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        previewLabel: "VISION ANALYSIS PREVIEW",
        colorClass: "bg-cyan-500 text-black",
        glowClass: "bg-cyan-900/20 group-hover:bg-cyan-500/20"
      }
    ];

    return (
      <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
        
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-32">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto space-y-8">
                <span className="text-lime-400 font-bold uppercase tracking-[0.3em] text-xs md:text-sm animate-pulse">
                    Temuide Gen AI Presents
                </span>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-tight brand-font tracking-tight">
                    TEMU<span className="text-lime-400">DESIGN</span>
                </h1>
                <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-2xl font-light leading-relaxed">
                    The Ultimate Free Neural Designer for 2025. <br/>
                    <strong className="text-white">Professional Posters. Affiliator Content. Vision Analysis.</strong>
                </p>
                <div className="pt-8">
                    <button 
                        onClick={() => setShowLanding(false)}
                        className="px-10 py-5 text-xl font-bold text-black bg-lime-400 rounded-sm hover:bg-lime-300 transition-all shadow-[0_0_30px_rgba(163,230,53,0.3)] hover:shadow-[0_0_50px_rgba(163,230,53,0.5)] transform hover:-translate-y-1"
                    >
                        LAUNCH GENERATOR
                    </button>
                </div>
            </div>
        </section>

        {/* PLAYGROUND PROMO */}
        <section className="relative z-10 bg-zinc-900 border-y border-zinc-800 py-24">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 brand-font">Your New AI Playground</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto mb-10 text-lg">
                    Experience the cutting edge of Generative AI. Create videos, images, and marketing assets in one unified ecosystem.
                </p>
                <a 
                    href="https://app.temuidegenai.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 border border-zinc-600 rounded-full hover:border-lime-400 hover:text-lime-400 transition-all group"
                >
                    <span className="font-bold tracking-widest uppercase">Visit Temuide Gen AI</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                </a>
            </div>
        </section>

        {/* STACKING CARDS FEATURES WITH LAZY REVEAL */}
        <div className="relative w-full max-w-6xl mx-auto px-4 py-24 space-y-24 min-h-[200vh]">
            <div className="text-center mb-16">
                <p className="text-lime-400 text-xs font-bold uppercase tracking-widest mb-4">Explore Features</p>
                <h2 className="text-4xl md:text-5xl font-bold brand-font text-white">Power Tools for Creators</h2>
                <p className="text-zinc-500 mt-4">Scroll to discover what TemuDesign can do for you.</p>
            </div>

            {features.map((feature, idx) => (
              <FeatureCard key={idx} index={idx} {...feature} />
            ))}
        </div>

        <footer className="relative z-10 py-12 text-center border-t border-zinc-900 bg-black mt-24">
          <p className="text-zinc-500 text-sm font-medium">
            Created by <span className="text-white font-bold">Abednego</span> as Founder of <span className="text-lime-400">Temuide</span>
          </p>
        </footer>
      </div>
    );
  }

  // --- MAIN APP ---
  return (
    <div className="min-h-screen bg-black flex flex-col font-sans text-zinc-300 relative">
      
      {loading && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center h-screen w-screen">
            <LoadingOverlay />
            <p className="mt-6 text-lime-400 font-mono text-lg font-bold animate-pulse uppercase tracking-widest">{loadingMessage}</p>
        </div>
      )}

      <Navbar currentMode={mode} onModeChange={handleModeChange} />
      
      <TextSuggestionModal 
        isOpen={showTextModal}
        onClose={() => setShowTextModal(false)}
        onConfirm={handleFinalGenerate}
        initialData={suggestedText}
      />

      <ApiKeyModal 
        isOpen={showApiKeyModal}
        onClose={() => { setShowApiKeyModal(false); setUseProModel(false); }}
        onSuccess={handleApiKeySuccess}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* LEFT PANEL: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900 rounded-sm border border-zinc-800 p-6 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-2xl font-bold text-white uppercase brand-font tracking-wide">
                  {mode === AppMode.AUTO_DESIGN && "Auto Design"}
                  {mode === AppMode.REFERENCE && "Ref. Style Clone"}
                  {mode === AppMode.CREATIVE_MANUAL && "Creative Design"}
                  {mode === AppMode.MAGAZINE_ANALYSIS && "Magazine Vision"}
                  {mode === AppMode.AFFILIATOR && "Affiliator AI"}
                </h2>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-lime-400/80 font-mono uppercase">
                    {mode === AppMode.AUTO_DESIGN && "System: Neural Poster Generation"}
                    {mode === AppMode.REFERENCE && "System: Multi-Shot Style Transfer"}
                    {mode === AppMode.CREATIVE_MANUAL && "System: Robust Text-Layering Logic"}
                    {mode === AppMode.MAGAZINE_ANALYSIS && "System: Enhanced Vision OCR & Layout"}
                    {mode === AppMode.AFFILIATOR && "System: Multi-Modal Composite Engine"}
                    </p>
                </div>
              </div>
              
              {/* --- MODEL SELECTION TOGGLE (BYOK) --- */}
              <div className="bg-black/50 p-3 rounded-sm border border-zinc-800 flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
                        {useProModel ? (
                            <>
                                <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse"></span>
                                Gemini 3 Pro (Nano Banana)
                            </>
                        ) : "Gemini 2.5 Flash (Standard)"}
                    </h3>
                    <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                        {useProModel ? "Using Custom API Key (Pro)" : "Using Default Free Tier"}
                    </p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                        type="checkbox" 
                        name="toggle" 
                        id="toggle" 
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300"
                        style={{ right: useProModel ? '0' : 'unset', left: useProModel ? 'unset' : '0', borderColor: useProModel ? '#a3e635' : '#3f3f46' }}
                        checked={useProModel}
                        onChange={handleProToggle}
                    />
                    <label 
                        htmlFor="toggle" 
                        className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors ${useProModel ? 'bg-lime-900' : 'bg-zinc-800'}`}
                    ></label>
                </div>
              </div>

              {/* --- IMAGE UPLOADERS BY MODE --- */}
              <div className="space-y-4">
                {(mode === AppMode.AUTO_DESIGN || mode === AppMode.REFERENCE) && (
                  <ImageUploader 
                    label={mode === AppMode.REFERENCE ? "1. Hero Product (Base Image)" : "Product / Source Image"}
                    selectedImage={mainImage}
                    onImageSelected={(b64) => setMainImage(b64)}
                    heightClass="h-52"
                  />
                )}
                 
                 {mode === AppMode.MAGAZINE_ANALYSIS && (
                     <ImageUploader 
                     label="Upload Magazine or Poster for Analysis"
                     selectedImage={magazineImage}
                     onImageSelected={(b64) => setMagazineImage(b64)}
                     heightClass="h-64"
                   />
                 )}

                {mode === AppMode.REFERENCE && (
                  <>
                  <ImageUploader 
                    label="2. Design Style Reference (Layout/Vibe)"
                    selectedImage={refImage}
                    onImageSelected={(b64) => setRefImage(b64)}
                    heightClass="h-40"
                  />
                  
                  <div className="relative">
                      <div className="absolute -top-6 right-0 text-[10px] text-lime-400 font-bold uppercase">Optional</div>
                      <ImageUploader 
                        label="3. Logo Reference (Brand Identity)"
                        selectedImage={logoImage}
                        onImageSelected={(b64) => setLogoImage(b64)}
                        heightClass="h-32"
                      />
                  </div>
                  </>
                )}

                {mode === AppMode.AFFILIATOR && (
                    <>
                    <ImageUploader 
                        label="1. Your Portrait (Personal Brand)"
                        selectedImage={affiliatorPerson}
                        onImageSelected={(b64) => setAffiliatorPerson(b64)}
                        heightClass="h-48"
                    />
                     <ImageUploader 
                        label="2. Product Photo (To Be Promoted)"
                        selectedImage={affiliatorProduct}
                        onImageSelected={(b64) => setAffiliatorProduct(b64)}
                        heightClass="h-48"
                    />
                    </>
                )}
              </div>

              {/* --- AFFILIATOR CONTROLS --- */}
              {mode === AppMode.AFFILIATOR && (
                  <>
                    {/* SCENE */}
                    <div>
                        <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Scene / Background</label>
                        <select
                            value={affiliatorScene}
                            onChange={(e) => { setAffiliatorScene(e.target.value); setManualScene(""); }}
                            className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:ring-lime-400 focus:border-lime-400 py-3 px-3 appearance-none mb-2"
                        >
                            {AffiliatorScenes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input 
                            type="text" 
                            placeholder="Or type custom scene..."
                            value={manualScene}
                            onChange={(e) => setManualScene(e.target.value)}
                            className="w-full bg-zinc-950 text-white text-xs border border-zinc-800 rounded-sm p-2 focus:border-lime-400 focus:outline-none"
                        />
                    </div>

                    {/* OUTFIT */}
                    <div>
                        <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Outfit / Style</label>
                        <select
                            value={affiliatorOutfit}
                            onChange={(e) => { setAffiliatorOutfit(e.target.value); setManualOutfit(""); }}
                            className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:ring-lime-400 focus:border-lime-400 py-3 px-3 appearance-none mb-2"
                        >
                            {AffiliatorOutfits.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input 
                            type="text" 
                            placeholder="Or type custom outfit..."
                            value={manualOutfit}
                            onChange={(e) => setManualOutfit(e.target.value)}
                            className="w-full bg-zinc-950 text-white text-xs border border-zinc-800 rounded-sm p-2 focus:border-lime-400 focus:outline-none"
                        />
                    </div>

                    {/* POSE */}
                     <div>
                        <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Pose with Product</label>
                        <select
                            value={affiliatorPose}
                            onChange={(e) => { setAffiliatorPose(e.target.value); setManualPose(""); }}
                            className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:ring-lime-400 focus:border-lime-400 py-3 px-3 appearance-none mb-2"
                        >
                            {AffiliatorPoses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input 
                            type="text" 
                            placeholder="Or type custom pose..."
                            value={manualPose}
                            onChange={(e) => setManualPose(e.target.value)}
                            className="w-full bg-zinc-950 text-white text-xs border border-zinc-800 rounded-sm p-2 focus:border-lime-400 focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Variations</label>
                        <select
                            value={batchSize}
                            onChange={(e) => setBatchSize(Number(e.target.value))}
                            className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:ring-lime-400 focus:border-lime-400 py-3 px-3 appearance-none"
                        >
                            <option value={1}>1 Image</option>
                            <option value={2}>2 Images</option>
                            <option value={3}>3 Images</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Aspect Ratio</label>
                         <select 
                          value={aspectRatio}
                          onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                          className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:ring-lime-400 focus:border-lime-400 py-3 px-3 appearance-none"
                        >
                          {AspectRatios.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                   </div>

                    <button
                    onClick={handleAffiliatorGenerate}
                    disabled={loading || !affiliatorPerson || !affiliatorProduct}
                    className={`w-full py-3 px-4 rounded-sm font-bold uppercase tracking-widest transition-all 
                      ${loading || !affiliatorPerson || !affiliatorProduct
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' 
                        : 'bg-lime-400 text-black hover:bg-lime-300 hover:shadow-[0_0_15px_rgba(163,230,53,0.4)] border border-lime-400'}
                    `}
                  >
                    Generate Affiliator Content
                  </button>
                  </>
              )}

              {/* --- AUTO DESIGN CONTROLS --- */}
              {mode === AppMode.AUTO_DESIGN && (
                <>
                  <div>
                    <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Design Style</label>
                    <select
                        value={selectedStyle}
                        onChange={(e) => setSelectedStyle(e.target.value as PosterStyleType)}
                        className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:ring-lime-400 focus:border-lime-400 py-3 px-3 appearance-none"
                    >
                        {PosterStyles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                   <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Variations</label>
                        <select
                            value={batchSize}
                            onChange={(e) => setBatchSize(Number(e.target.value))}
                            className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:ring-lime-400 focus:border-lime-400 py-3 px-3 appearance-none"
                        >
                            <option value={1}>1 Image</option>
                            <option value={2}>2 Images</option>
                            <option value={3}>3 Images</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Language</label>
                         <select 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as Language)}
                          className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:ring-lime-400 focus:border-lime-400 py-3 px-3 appearance-none"
                        >
                          {Object.values(Language).map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>
                   </div>

                  <div>
                     <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Aspect Ratio</label>
                     <div className="grid grid-cols-5 gap-2">
                         {AspectRatios.map(ratio => (
                             <button
                                 key={ratio}
                                 onClick={() => setAspectRatio(ratio)}
                                 className={`py-2 text-[10px] font-bold rounded-sm border transition-all
                                     ${aspectRatio === ratio
                                         ? 'bg-lime-400 text-black border-lime-400'
                                         : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-white'}
                                 `}
                             >
                                 {ratio}
                             </button>
                         ))}
                     </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">
                        Text Composition (Level {density})
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={density} 
                      onChange={(e) => setDensity(Number(e.target.value) as DensityLevel)}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-lime-400"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-2 font-mono border border-zinc-800 p-2 rounded bg-black">
                        {density <= 2 && <span>Level 1-2: Minimal Headline + CTA</span>}
                        {density === 3 && <span>Level 3: + Subtext, Body, Highlights</span>}
                        {density === 4 && <span>Level 4: + Secondary Subtext</span>}
                        {density === 5 && <span>Level 5: + Secondary Body (Max Info)</span>}
                    </div>
                  </div>

                  <button
                    onClick={handleSuggestText}
                    disabled={loading || !mainImage}
                    className={`w-full py-3 px-4 rounded-sm font-bold uppercase tracking-widest transition-all 
                      ${loading || !mainImage 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' 
                        : 'bg-lime-400 text-black hover:bg-lime-300 hover:shadow-[0_0_15px_rgba(163,230,53,0.4)] border border-lime-400'}
                    `}
                  >
                    Next: AI Suggest Text
                  </button>
                </>
              )}

              {/* --- REFERENCE CONTROLS --- */}
              {mode === AppMode.REFERENCE && (
                <>
                <div className="flex gap-4">
                  <div className="flex-1">
                      <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Variations</label>
                      <select
                          value={batchSize}
                          onChange={(e) => setBatchSize(Number(e.target.value))}
                          className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:ring-lime-400 focus:border-lime-400 py-3 px-3 appearance-none"
                      >
                          <option value={1}>1 Image</option>
                          <option value={2}>2 Images</option>
                          <option value={3}>3 Images</option>
                      </select>
                  </div>
                   <div className="flex-1">
                      <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Target Language</label>
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:ring-lime-400 focus:border-lime-400 py-3 px-3 appearance-none"
                      >
                        {Object.values(Language).map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                </div>

                <div>
                     <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Aspect Ratio</label>
                     <div className="grid grid-cols-5 gap-2">
                         {AspectRatios.map(ratio => (
                             <button
                                 key={ratio}
                                 onClick={() => setAspectRatio(ratio)}
                                 className={`py-2 text-[10px] font-bold rounded-sm border transition-all
                                     ${aspectRatio === ratio
                                         ? 'bg-lime-400 text-black border-lime-400'
                                         : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-white'}
                                 `}
                             >
                                 {ratio}
                             </button>
                         ))}
                     </div>
                  </div>

                 <button
                    onClick={handleReferenceGenerate}
                    disabled={loading || !mainImage || !refImage}
                    className={`w-full py-3 px-4 rounded-sm font-bold uppercase tracking-widest transition-all 
                      ${loading || !mainImage || !refImage
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' 
                        : 'bg-lime-400 text-black hover:bg-lime-300 hover:shadow-[0_0_15px_rgba(163,230,53,0.4)] border border-lime-400'}
                    `}
                  >
                    Generate Styled Poster
                  </button>
                </>
              )}

              {/* --- CREATIVE MANUAL CONTROLS --- */}
              {mode === AppMode.CREATIVE_MANUAL && (
                <>
                  <div>
                    <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Design Context</label>
                    <select
                        value={designContext}
                        onChange={(e) => setDesignContext(e.target.value as DesignContextType)}
                        className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:ring-lime-400 focus:border-lime-400 py-3 px-3 appearance-none"
                    >
                        {DesignContexts.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Your Simple Instruction</label>
                    <textarea 
                      value={creativeInstruction}
                      onChange={(e) => setCreativeInstruction(e.target.value)}
                      placeholder="e.g., Butterfly metamorphosis cycle..."
                      rows={3}
                      className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 p-3 text-sm placeholder-zinc-600 transition-colors resize-none"
                    />
                     <p className="text-[10px] text-zinc-500 mt-1">AI will automatically layer text and visuals based on context.</p>
                  </div>

                   <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Variations</label>
                        <select
                            value={batchSize}
                            onChange={(e) => setBatchSize(Number(e.target.value))}
                            className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:ring-lime-400 focus:border-lime-400 py-3 px-3 appearance-none"
                        >
                            <option value={1}>1 Image</option>
                            <option value={2}>2 Images</option>
                            <option value={3}>3 Images</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs uppercase font-bold text-lime-400 mb-2 tracking-wider">Aspect Ratio</label>
                         <select 
                          value={aspectRatio}
                          onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                          className="w-full bg-black text-white font-bold rounded-sm border border-zinc-700 focus:ring-lime-400 focus:border-lime-400 py-3 px-3 appearance-none"
                        >
                          {AspectRatios.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                   </div>

                  <button
                    onClick={handleCreativeGenerate}
                    disabled={loading || !creativeInstruction.trim()}
                    className={`w-full py-3 px-4 rounded-sm font-bold uppercase tracking-widest transition-all 
                      ${loading || !creativeInstruction.trim()
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' 
                        : 'bg-lime-400 text-black hover:bg-lime-300 hover:shadow-[0_0_15px_rgba(163,230,53,0.4)] border border-lime-400'}
                    `}
                  >
                    Execute Creative Design
                  </button>
                </>
              )}
              
               {/* --- MAGAZINE ANALYSIS CONTROLS --- */}
               {mode === AppMode.MAGAZINE_ANALYSIS && (
                   <button
                   onClick={handleMagazineAnalysis}
                   disabled={loading || !magazineImage}
                   className={`w-full py-3 px-4 rounded-sm font-bold uppercase tracking-widest transition-all 
                     ${loading || !magazineImage
                       ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' 
                       : 'bg-lime-400 text-black hover:bg-lime-300 hover:shadow-[0_0_15px_rgba(163,230,53,0.4)] border border-lime-400'}
                   `}
                 >
                   Analyze Layout & Text
                 </button>
               )}


              {error && (
                <div className="p-3 bg-red-900/20 text-red-400 text-xs rounded-sm border border-red-900/50 font-bold uppercase flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mt-0.5 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT PANEL: Preview */}
          <div className="lg:col-span-8">
            <div className={`bg-zinc-900 rounded-sm border border-zinc-800 p-4 min-h-[600px] h-full flex flex-col items-center justify-center relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${generatedImages.length === 0 && !magazineResult ? 'bg-zinc-900' : ''}`}>
               
               {/* MODE: MAGAZINE RESULTS */}
               {mode === AppMode.MAGAZINE_ANALYSIS && magazineResult && (
                   <div className="w-full h-full p-4 overflow-y-auto space-y-4 animate-fadeIn">
                       <h3 className="text-xl font-bold text-white uppercase brand-font mb-4 border-b border-zinc-700 pb-2">Vision Analysis Result</h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {/* Headline */}
                           <div className="bg-black p-4 rounded-sm border border-zinc-800 relative group">
                               <div className="flex justify-between items-center mb-2">
                                   <span className="text-lime-400 text-xs font-bold uppercase tracking-wider">Headline</span>
                                   <button onClick={() => copyToClipboard(magazineResult.headline)} className="text-zinc-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg></button>
                               </div>
                               <p className="text-white font-bold">{magazineResult.headline || <span className="text-zinc-600 italic">No headline detected</span>}</p>
                           </div>

                           {/* Subtext 1 */}
                            <div className="bg-black p-4 rounded-sm border border-zinc-800 relative group">
                               <div className="flex justify-between items-center mb-2">
                                   <span className="text-lime-400 text-xs font-bold uppercase tracking-wider">Subtext 1</span>
                                   <button onClick={() => copyToClipboard(magazineResult.subtext_1)} className="text-zinc-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg></button>
                               </div>
                               <p className="text-zinc-300 text-sm">{magazineResult.subtext_1 || <span className="text-zinc-600 italic">N/A</span>}</p>
                           </div>

                           {/* Subtext 2 */}
                           <div className="bg-black p-4 rounded-sm border border-zinc-800 relative group">
                               <div className="flex justify-between items-center mb-2">
                                   <span className="text-lime-400 text-xs font-bold uppercase tracking-wider">Subtext 2</span>
                                   <button onClick={() => copyToClipboard(magazineResult.subtext_2)} className="text-zinc-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg></button>
                               </div>
                               <p className="text-zinc-300 text-sm">{magazineResult.subtext_2 || <span className="text-zinc-600 italic">N/A</span>}</p>
                           </div>

                           {/* Body */}
                           <div className="bg-black p-4 rounded-sm border border-zinc-800 relative group col-span-1 md:col-span-2">
                               <div className="flex justify-between items-center mb-2">
                                   <span className="text-lime-400 text-xs font-bold uppercase tracking-wider">Body Copy</span>
                                   <button onClick={() => copyToClipboard(magazineResult.body)} className="text-zinc-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg></button>
                               </div>
                               <p className="text-zinc-400 text-sm font-mono whitespace-pre-wrap">{magazineResult.body || <span className="text-zinc-600 italic">No body text</span>}</p>
                           </div>
                           
                           {/* CTA */}
                            <div className="bg-black p-4 rounded-sm border border-zinc-800 relative group col-span-1 md:col-span-2">
                               <div className="flex justify-between items-center mb-2">
                                   <span className="text-lime-400 text-xs font-bold uppercase tracking-wider">Call to Action</span>
                                   <button onClick={() => copyToClipboard(magazineResult.cta)} className="text-zinc-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg></button>
                               </div>
                               <p className="text-lime-400 font-bold">{magazineResult.cta || <span className="text-zinc-600 italic">N/A</span>}</p>
                           </div>
                           
                           {/* Auto Prompt */}
                           <div className="bg-zinc-950 p-4 rounded-sm border border-lime-400/20 col-span-1 md:col-span-2">
                               <div className="flex justify-between items-center mb-2">
                                   <span className="text-white text-xs font-bold uppercase tracking-wider">Auto-Generated Recreation Prompt</span>
                                   <button onClick={() => copyToClipboard(magazineResult.recreation_prompt)} className="text-zinc-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg></button>
                               </div>
                               <div className="text-zinc-500 text-[10px] font-mono whitespace-pre-wrap border border-zinc-800 p-2 rounded bg-black">
                                   {magazineResult.recreation_prompt}
                               </div>
                           </div>

                       </div>
                   </div>
               )}


               {/* MODE: IMAGE RESULTS (GRID) */}
               {(generatedImages.length > 0) && (
                 <div className="w-full h-full flex flex-col animate-fadeIn">
                   
                   {/* Main Selected Image */}
                   <div className="relative flex-grow flex items-center justify-center bg-zinc-950 rounded-sm overflow-hidden mb-4 border border-zinc-800 p-2 min-h-[400px]">
                      <img 
                        src={generatedImages[selectedResultIndex]} 
                        alt="Generated Poster" 
                        className="max-w-full max-h-[600px] w-auto h-auto object-contain shadow-lg"
                      />
                   </div>

                   {/* Thumbnails (for batch > 1) */}
                   {generatedImages.length > 1 && (
                       <div className="flex gap-2 justify-center mb-4 overflow-x-auto p-2">
                           {generatedImages.map((img, idx) => (
                               <button 
                                key={idx}
                                onClick={() => setSelectedResultIndex(idx)}
                                className={`h-20 w-20 rounded-sm border-2 overflow-hidden transition-all ${selectedResultIndex === idx ? 'border-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)]' : 'border-zinc-700 opacity-60 hover:opacity-100'}`}
                               >
                                   <img src={img} className="w-full h-full object-cover" alt={`Variant ${idx+1}`}/>
                               </button>
                           ))}
                       </div>
                   )}

                   <div className="flex gap-4 w-full justify-center">
                     <button 
                       onClick={() => downloadImage(generatedImages[selectedResultIndex])}
                       className="px-8 py-3 bg-lime-400 text-black rounded-sm font-bold uppercase tracking-widest hover:bg-lime-300 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(163,230,53,0.3)]"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                       </svg>
                       Download
                     </button>
                     
                     <a
                       href="https://app.temuidegenai.com"
                       target="_blank"
                       rel="noopener noreferrer"
                       className="px-8 py-3 bg-zinc-950 text-white border border-zinc-700 rounded-sm font-bold uppercase tracking-widest hover:border-lime-400 hover:text-lime-400 transition-colors flex items-center gap-2 group"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:animate-pulse">
                         <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                       </svg>
                       Generate Video
                     </a>
                   </div>
                 </div>
               )}

               {/* EMPTY STATE */}
               {generatedImages.length === 0 && !magazineResult && (
                 <div className="text-center text-zinc-600">
                   <div className="mx-auto w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 border border-zinc-700">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-zinc-500">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                     </svg>
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-2 brand-font uppercase tracking-wide">TEMU<span className="text-lime-400">DESIGN</span> Studio</h3>
                   <div className="max-w-md mx-auto space-y-2">
                       <p className="text-zinc-500 text-sm font-mono">SYSTEM READY // WAITING FOR INPUT</p>
                   </div>
                 </div>
               )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
