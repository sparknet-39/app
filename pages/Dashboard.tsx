import React, { useEffect, useState } from 'react';
import { DocumentFile, GeneratedContent, ContentType } from '../types';
import { fileService, generationService } from '../services/mockBackend';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onSelectFile: (file: DocumentFile) => void;
  onSelectGeneration: (gen: GeneratedContent) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectFile, onSelectGeneration }) => {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [recentGenerations, setRecentGenerations] = useState<GeneratedContent[]>([]);

  useEffect(() => {
    setFiles(fileService.getFiles());
    setRecentGenerations(generationService.getAll());
  }, []);

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm("Are you sure you want to delete this file?")) {
      fileService.deleteFile(id);
      setFiles(fileService.getFiles());
    }
  };

  const getIconForType = (type: ContentType) => {
    switch (type) {
      case ContentType.MCQ: return 'fa-list-ul';
      case ContentType.FLASHCARD: return 'fa-clone';
      case ContentType.SHORT_QA: return 'fa-pen-to-square';
      default: return 'fa-file-lines';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Uploads</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{files.length}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Study Sets</dt>
          <dd className="mt-1 text-3xl font-semibold text-indigo-600">{recentGenerations.length}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 cursor-pointer hover:bg-indigo-50 transition" onClick={() => onNavigate('generate')}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fa-solid fa-plus text-indigo-600 text-2xl mb-2"></i>
              <p className="font-medium text-indigo-600">Create New</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Files */}
        <section className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Your Documents</h2>
            <button onClick={() => onNavigate('generate')} className="text-sm text-indigo-600 hover:text-indigo-900">Upload New</button>
          </div>
          <div className="flow-root">
            {files.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No files uploaded yet.</p>
            ) : (
              <ul className="-my-5 divide-y divide-gray-200">
                {files.map((file) => (
                  <li key={file.id} className="py-4 hover:bg-gray-50 cursor-pointer -mx-6 px-6 transition-colors" onClick={() => onSelectFile(file)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <i className={`fa-regular ${file.type.includes('pdf') ? 'fa-file-pdf text-red-500' : 'fa-file-text text-blue-500'} text-xl mr-3`}></i>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-indigo-600 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button onClick={(e) => handleDeleteFile(file.id, e)} className="ml-4 text-gray-400 hover:text-red-500">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Recent Generated Content */}
        <section className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Study Materials</h2>
          </div>
          <div className="flow-root">
            {recentGenerations.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No content generated yet.</p>
            ) : (
              <ul className="-my-5 divide-y divide-gray-200">
                {recentGenerations.map((gen) => (
                  <li key={gen.id} className="py-4 hover:bg-gray-50 cursor-pointer -mx-6 px-6 transition-colors" onClick={() => onSelectGeneration(gen)}>
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100">
                          <i className={`fa-solid ${getIconForType(gen.type)} text-indigo-600`}></i>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {gen.type.replace('_', ' ')} Set
                        </p>
                        <p className="text-xs text-gray-500">
                          {gen.items.length} items • {gen.difficulty}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(gen.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
