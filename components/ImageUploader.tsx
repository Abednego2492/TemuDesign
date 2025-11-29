import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  label: string;
  onImageSelected: (base64: string, file: File) => void;
  selectedImage: string | null;
  heightClass?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  onImageSelected, 
  selectedImage,
  heightClass = "h-64"
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelected(reader.result as string, file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="w-full">
      <label className="block text-xs uppercase tracking-widest font-bold text-zinc-400 mb-2">{label}</label>
      <div
        className={`relative w-full ${heightClass} rounded-sm border-2 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center overflow-hidden cursor-pointer group
          ${isDragging 
            ? 'border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.2)]' 
            : 'border-zinc-700 bg-zinc-900/50 hover:border-lime-400/50 hover:bg-zinc-900'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        {selectedImage ? (
          <div className="relative w-full h-full">
            <img 
              src={selectedImage} 
              alt="Uploaded preview" 
              className="w-full h-full object-contain p-2"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-lime-400 font-bold uppercase tracking-widest text-sm">Change Image</span>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <div className={`mx-auto h-12 w-12 transition-colors duration-300 ${isDragging ? 'text-lime-400' : 'text-zinc-600 group-hover:text-lime-400'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-bold text-zinc-300 uppercase tracking-wide">Upload Image</p>
            <p className="mt-1 text-xs text-zinc-500 font-mono">DRAG DROP OR CLICK</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;