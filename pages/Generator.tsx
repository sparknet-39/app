import React, { useState, useRef } from 'react';
import { DocumentFile, ContentType, Difficulty, GenerationConfig, GeneratedContent, GeneratedItem, MCQItem, QAItem, FlashcardItem } from '../types';
import { fileService, generationService } from '../services/mockBackend';
import { generateStudyMaterial } from '../services/geminiService';

interface GeneratorProps {
  preSelectedFile?: DocumentFile | null;
  onGenerationSaved: () => void;
}

export const Generator: React.FC<GeneratorProps> = ({ preSelectedFile, onGenerationSaved }) => {
  const [step, setStep] = useState<1 | 2 | 3>(preSelectedFile ? 2 : 1);
  const [file, setFile] = useState<DocumentFile | null>(preSelectedFile || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedContent | null>(null);

  // Configuration State
  const [config, setConfig] = useState<GenerationConfig>({
    contentType: ContentType.MCQ,
    count: 5,
    difficulty: Difficulty.MEDIUM,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const uploaded = await fileService.upload(e.target.files[0]);
        setFile(uploaded);
        setStep(2);
      } catch (err) {
        setError("Failed to upload file.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!file || !file.content) {
      setError("No content available to generate from.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const items = await generateStudyMaterial(
        file.content,
        config.contentType,
        config.count,
        config.difficulty
      );
      
      const newGen: GeneratedContent = {
        id: `gen_${Date.now()}`,
        fileId: file.id,
        type: config.contentType,
        difficulty: config.difficulty,
        createdAt: new Date().toISOString(),
        items: items
      };
      
      generationService.save(newGen);
      setGeneratedResult(newGen);
      setStep(3);
      onGenerationSaved();
    } catch (err: any) {
      setError(err.message || "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderConfigStep = () => (
    <div className="bg-white shadow rounded-lg p-8 max-w-2xl mx-auto">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Configure Generation</h2>
        <p className="text-sm text-gray-500">Source: {file?.name}</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.values(ContentType).map(type => (
              <div 
                key={type}
                onClick={() => setConfig({...config, contentType: type})}
                className={`cursor-pointer rounded-lg border p-3 text-center text-sm font-medium transition-all ${
                  config.contentType === type 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' 
                    : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}
              >
                {type.replace('_', ' ')}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <div className="flex space-x-4">
             {Object.values(Difficulty).map(diff => (
               <label key={diff} className="flex items-center">
                 <input 
                   type="radio" 
                   checked={config.difficulty === diff} 
                   onChange={() => setConfig({...config, difficulty: diff})}
                   className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                 />
                 <span className="ml-2 text-sm text-gray-700 capitalize">{diff.toLowerCase()}</span>
               </label>
             ))}
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Number of Questions: {config.count}
           </label>
           <input 
             type="range" 
             min="1" 
             max="20" 
             value={config.count} 
             onChange={(e) => setConfig({...config, count: parseInt(e.target.value)})}
             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
           />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isGenerating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {isGenerating ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Generating with AI...
            </>
          ) : 'Generate Content'}
        </button>
      </div>
    </div>
  );

  const renderUploadStep = () => (
    <div className="max-w-xl mx-auto">
      <div 
        className="mt-8 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors cursor-pointer bg-white"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-1 text-center">
          {isUploading ? (
            <div className="py-12">
               <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-600 mb-4"></i>
               <p className="text-gray-600">Extracting text...</p>
            </div>
          ) : (
            <>
              <i className="fa-solid fa-cloud-arrow-up text-4xl text-gray-400 mb-3"></i>
              <div className="flex text-sm text-gray-600 justify-center">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input ref={fileInputRef} type="file" className="sr-only" onChange={handleFileUpload} accept=".txt,.pdf,.docx" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">TXT, PDF, DOCX up to 10MB</p>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          <i className="fa-solid fa-info-circle mr-1"></i>
          For best results with this demo, upload a .txt file. PDF/DOCX extraction is simulated.
        </p>
      </div>
    </div>
  );

  const renderResultsStep = () => {
    if (!generatedResult) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Generated Results</h2>
          <div className="space-x-2">
             <button onClick={() => setStep(2)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
               Generate More
             </button>
             <button onClick={() => window.print()} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
               <i className="fa-solid fa-print mr-2"></i> Print / Save PDF
             </button>
          </div>
        </div>

        <div className="grid gap-6">
          {generatedResult.items.map((item, idx) => (
            <div key={idx} className="bg-white shadow rounded-lg p-6 border-l-4 border-indigo-500">
               <div className="flex justify-between items-start mb-4">
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                   Q{idx + 1}
                 </span>
                 <span className="text-xs text-gray-400 uppercase tracking-wide">{item.type}</span>
               </div>

               {/* Render Content Based on Type */}
               {item.type === 'MCQ' && (
                 <div>
                   <p className="text-lg font-medium text-gray-900 mb-4">{(item as MCQItem).question}</p>
                   <div className="space-y-2">
                     {(item as MCQItem).options.map((opt, optIdx) => (
                       <div key={optIdx} className={`p-3 rounded-md border ${
                         opt === (item as MCQItem).correctAnswer 
                           ? 'bg-green-50 border-green-200 text-green-800' // Always show correct answer for review
                           : 'bg-gray-50 border-gray-200'
                       }`}>
                         <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                         {opt === (item as MCQItem).correctAnswer && <i className="fa-solid fa-check ml-2 text-green-600"></i>}
                       </div>
                     ))}
                   </div>
                   <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded text-sm">
                     <strong>Explanation:</strong> {(item as MCQItem).explanation}
                   </div>
                 </div>
               )}

               {(item.type === 'QA') && (
                 <div>
                   <p className="text-lg font-medium text-gray-900 mb-3">{(item as QAItem).question}</p>
                   <div className="prose prose-sm text-gray-600 bg-gray-50 p-4 rounded-md">
                     <strong className="block text-gray-900 mb-1">Model Answer:</strong>
                     {(item as QAItem).answer}
                   </div>
                 </div>
               )}

               {item.type === 'FLASHCARD' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-gray-100 p-6 rounded-lg text-center flex items-center justify-center min-h-[150px]">
                     <div>
                       <div className="text-xs text-gray-500 uppercase mb-2">Front</div>
                       <p className="font-bold text-lg">{(item as FlashcardItem).front}</p>
                     </div>
                   </div>
                   <div className="bg-indigo-50 p-6 rounded-lg text-center flex items-center justify-center min-h-[150px]">
                     <div>
                       <div className="text-xs text-indigo-400 uppercase mb-2">Back</div>
                       <p className="text-gray-800">{(item as FlashcardItem).back}</p>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Progress Stepper */}
      <nav aria-label="Progress" className="mb-10">
        <ol className="flex items-center justify-center space-x-8">
          <li className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 1 ? 'border-indigo-600 font-bold' : 'border-gray-300'}`}>1</span>
            <span className="ml-2 font-medium">Upload</span>
          </li>
          <li className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 2 ? 'border-indigo-600 font-bold' : 'border-gray-300'}`}>2</span>
            <span className="ml-2 font-medium">Configure</span>
          </li>
          <li className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
            <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 3 ? 'border-indigo-600 font-bold' : 'border-gray-300'}`}>3</span>
            <span className="ml-2 font-medium">Results</span>
          </li>
        </ol>
      </nav>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fa-solid fa-triangle-exclamation text-red-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {step === 1 && renderUploadStep()}
      {step === 2 && renderConfigStep()}
      {step === 3 && renderResultsStep()}
    </div>
  );
};
