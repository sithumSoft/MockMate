export type QuestionCategory = 'technical' | 'behavioral' | 'system-design';
export type DifficultyLevel = 'junior' | 'mid' | 'senior';
export type InterviewStatus = 'ongoing' | 'completed';
export type InterviewMode = 'screening' | 'technical' | 'behavioral';

export interface Question {
  id: string;
  question: string;
  category: QuestionCategory;
  expectedKeywords: string[];
  followUps: string[];
  userAnswer?: string;
  score?: number;
  feedback?: string;
  timestamp?: Date;
}

export interface Interview {
  _id?: string;
  userId: string;
  jobDescription: string;
  jobTitle: string;
  techStack?: string[];
  difficulty: DifficultyLevel;
  status: InterviewStatus;
  mode: InterviewMode;
  createdAt: Date;
  questions: Question[];
  overallScore?: number;
  overallFeedback?: string;
  strengths?: string[];
  weaknesses?: string[];
}

export interface InterviewSession {
  id: string;
  jobTitle: string;
  difficulty: DifficultyLevel;
  status: InterviewStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  questions: Question[];
}

export interface AnswerEvaluation {
  score: number;
  feedback: string;
  missingConcepts: string[];
  followUpNeeded: boolean;
  strengths: string[];
  idealAnswer?: string;
}

export interface GeneratedQuestion {
  question: string;
  category: QuestionCategory;
  expectedKeywords: string[];
  followUps: string[];
}

export interface InterviewReport {
  interviewId: string;
  jobTitle: string;
  overallScore: number;
  totalQuestions: number;
  answeredQuestions: number;
  categoryBreakdown: {
    technical: { count: number; avgScore: number };
    behavioral: { count: number; avgScore: number };
    'system-design': { count: number; avgScore: number };
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  questions: Question[];
}
