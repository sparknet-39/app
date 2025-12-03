export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export enum ContentType {
  MCQ = 'MCQ',
  SHORT_QA = 'SHORT_QA',
  LONG_QA = 'LONG_QA',
  FLASHCARD = 'FLASHCARD'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  status: 'UPLOADED' | 'EXTRACTED' | 'ERROR';
  content?: string; // Extracted text
}

export interface GeneratedContent {
  id: string;
  fileId: string;
  type: ContentType;
  createdAt: string;
  items: GeneratedItem[];
  difficulty: Difficulty;
}

// Union type for different generated item structures
export type GeneratedItem = MCQItem | QAItem | FlashcardItem;

export interface MCQItem {
  type: 'MCQ';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QAItem {
  type: 'QA';
  question: string;
  answer: string; // Model answer
  points?: string[]; // For long QA outline
}

export interface FlashcardItem {
  type: 'FLASHCARD';
  front: string;
  back: string;
}

export interface GenerationConfig {
  contentType: ContentType;
  count: number;
  difficulty: Difficulty;
  language?: string;
}
