import { User, UserRole, DocumentFile, GeneratedContent } from "../types";

// Local Storage Keys
const USER_KEY = 'smartprep_user';
const FILES_KEY = 'smartprep_files';
const GEN_KEY = 'smartprep_generations';

// Mock Delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  login: async (email: string): Promise<User> => {
    await delay(800);
    const user: User = {
      id: 'u_123',
      name: email.split('@')[0],
      email,
      role: email.includes('admin') ? UserRole.ADMIN : UserRole.STUDENT,
      avatar: `https://ui-avatars.com/api/?name=${email}&background=0D8ABC&color=fff`
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },
  
  logout: () => {
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  }
};

export const fileService = {
  upload: async (file: File): Promise<DocumentFile> => {
    await delay(1500); // Simulate upload time
    
    // Simulate Text Extraction
    let content = "";
    if (file.type === 'text/plain') {
      content = await file.text();
    } else {
      // Mock extraction for demo purposes for PDF/Images
      content = "This is simulated extracted text for demonstration. In a real environment, this would be parsed content from the PDF or DOCX file using backend libraries. SmartPrep allows you to study efficiently by generating questions from this content.";
    }

    const newDoc: DocumentFile = {
      id: `doc_${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      status: 'EXTRACTED',
      content: content
    };

    const existing = fileService.getFiles();
    localStorage.setItem(FILES_KEY, JSON.stringify([newDoc, ...existing]));
    return newDoc;
  },

  getFiles: (): DocumentFile[] => {
    const d = localStorage.getItem(FILES_KEY);
    return d ? JSON.parse(d) : [];
  },

  getFile: (id: string): DocumentFile | undefined => {
    const files = fileService.getFiles();
    return files.find(f => f.id === id);
  },

  deleteFile: (id: string) => {
    const files = fileService.getFiles().filter(f => f.id !== id);
    localStorage.setItem(FILES_KEY, JSON.stringify(files));
  }
};

export const generationService = {
  save: (gen: GeneratedContent) => {
    const existing = generationService.getAll();
    localStorage.setItem(GEN_KEY, JSON.stringify([gen, ...existing]));
  },
  
  getAll: (): GeneratedContent[] => {
    const g = localStorage.getItem(GEN_KEY);
    return g ? JSON.parse(g) : [];
  },

  getById: (id: string): GeneratedContent | undefined => {
    return generationService.getAll().find(g => g.id === id);
  }
};
