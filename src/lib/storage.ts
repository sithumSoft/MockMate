import type { Interview, Question, InterviewReport } from '@/types/interview';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'ai_mock_interviews';
const SESSION_KEY = 'ai_mock_current_session';

// In-memory storage for demo purposes
// In production, this would be replaced with MongoDB calls
class InterviewStorage {
  private getStorage(): Interview[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private setStorage(interviews: Interview[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
  }

  createInterview(
    jobDescription: string,
    jobTitle: string,
    difficulty: string,
    mode: string
  ): Interview {
    const interview: Interview = {
      _id: uuidv4(),
      userId: 'anonymous',
      jobDescription,
      jobTitle,
      difficulty: difficulty as any,
      status: 'ongoing',
      mode: mode as any,
      createdAt: new Date(),
      questions: []
    };

    const interviews = this.getStorage();
    interviews.push(interview);
    this.setStorage(interviews);
    this.setCurrentSession(interview._id!);

    return interview;
  }

  getInterview(id: string): Interview | null {
    const interviews = this.getStorage();
    return interviews.find(i => i._id === id) || null;
  }

  updateInterview(id: string, updates: Partial<Interview>): Interview | null {
    const interviews = this.getStorage();
    const index = interviews.findIndex(i => i._id === id);
    
    if (index === -1) return null;

    interviews[index] = { ...interviews[index], ...updates };
    this.setStorage(interviews);
    return interviews[index];
  }

  addQuestion(interviewId: string, question: Question): Interview | null {
    const interview = this.getInterview(interviewId);
    if (!interview) return null;

    const questionWithId = {
      ...question,
      id: uuidv4(),
      timestamp: new Date()
    };

    interview.questions.push(questionWithId);
    return this.updateInterview(interviewId, { questions: interview.questions });
  }

  updateAnswer(
    interviewId: string,
    questionId: string,
    answer: string,
    score: number,
    feedback: string
  ): Interview | null {
    const interview = this.getInterview(interviewId);
    if (!interview) return null;

    const questionIndex = interview.questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) return null;

    interview.questions[questionIndex] = {
      ...interview.questions[questionIndex],
      userAnswer: answer,
      score,
      feedback
    };

    return this.updateInterview(interviewId, { questions: interview.questions });
  }

  completeInterview(
    interviewId: string,
    overallScore: number,
    overallFeedback: string,
    strengths: string[],
    weaknesses: string[]
  ): Interview | null {
    return this.updateInterview(interviewId, {
      status: 'completed',
      overallScore,
      overallFeedback,
      strengths,
      weaknesses
    });
  }

  getAllInterviews(): Interview[] {
    return this.getStorage().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getInterviewReport(interviewId: string): InterviewReport | null {
    const interview = this.getInterview(interviewId);
    if (!interview) return null;

    const answeredQuestions = interview.questions.filter(q => q.userAnswer);
    
    const categoryBreakdown = {
      technical: { count: 0, avgScore: 0 },
      behavioral: { count: 0, avgScore: 0 },
      'system-design': { count: 0, avgScore: 0 }
    };

    answeredQuestions.forEach(q => {
      if (q.category in categoryBreakdown) {
        categoryBreakdown[q.category].count++;
        categoryBreakdown[q.category].avgScore += q.score || 0;
      }
    });

    // Calculate averages
    (Object.keys(categoryBreakdown) as Array<keyof typeof categoryBreakdown>).forEach(cat => {
      if (categoryBreakdown[cat].count > 0) {
        categoryBreakdown[cat].avgScore = Math.round(
          categoryBreakdown[cat].avgScore / categoryBreakdown[cat].count
        );
      }
    });

    return {
      interviewId: interview._id!,
      jobTitle: interview.jobTitle,
      overallScore: interview.overallScore || 0,
      totalQuestions: interview.questions.length,
      answeredQuestions: answeredQuestions.length,
      categoryBreakdown,
      strengths: interview.strengths || [],
      weaknesses: interview.weaknesses || [],
      recommendations: [],
      questions: interview.questions
    };
  }

  setCurrentSession(interviewId: string): void {
    localStorage.setItem(SESSION_KEY, interviewId);
  }

  getCurrentSession(): string | null {
    return localStorage.getItem(SESSION_KEY);
  }

  clearCurrentSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  deleteInterview(id: string): boolean {
    const interviews = this.getStorage();
    const filtered = interviews.filter(i => i._id !== id);
    this.setStorage(filtered);
    return filtered.length < interviews.length;
  }
}

export const storage = new InterviewStorage();
