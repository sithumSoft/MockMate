import { useState, useCallback } from 'react';
import type { 
  Interview, 
  Question, 
  InterviewMode,
  DifficultyLevel 
} from '@/types/interview';
import { 
  parseJobDescription, 
  generateInterviewQuestion, 
  evaluateAnswer,
  generateOverallFeedback 
} from '@/lib/gemini';
import { storage } from '@/lib/storage';

interface UseInterviewReturn {
  // State
  interview: Interview | null;
  currentQuestion: Question | null;
  isLoading: boolean;
  error: string | null;
  currentRound: number;
  evaluation: {
    score: number;
    feedback: string;
    isEvaluating: boolean;
  } | null;

  // Actions
  startInterview: (jobDescription: string, mode: InterviewMode) => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  nextQuestion: () => Promise<void>;
  finishInterview: () => Promise<void>;
  reset: () => void;
}

const MAX_QUESTIONS = 10;

export const useInterview = (): UseInterviewReturn => {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    feedback: string;
    isEvaluating: boolean;
  } | null>(null);

  const startInterview = useCallback(async (jobDescription: string, mode: InterviewMode) => {
    setIsLoading(true);
    setError(null);
    setCurrentRound(0);
    setEvaluation(null);

    try {
      // Parse job description to extract metadata
      const { jobTitle, techStack, difficulty } = await parseJobDescription(jobDescription);

      // Create interview session
      const newInterview = storage.createInterview(
        jobDescription,
        jobTitle,
        difficulty,
        mode
      );

      // Store techStack in the interview
      newInterview.techStack = techStack;
      storage.updateInterview(newInterview._id!, { techStack });

      setInterview(newInterview);

      // Generate first question
      const generatedQuestion = await generateInterviewQuestion(
        jobDescription,
        jobTitle,
        techStack,
        difficulty as DifficultyLevel,
        1,
        [],
        mode
      );

      const question: Question = {
        ...generatedQuestion,
        id: crypto.randomUUID(),
        timestamp: new Date()
      };

      setCurrentQuestion(question);
      setCurrentRound(1);

      // Save question to storage
      storage.addQuestion(newInterview._id!, question);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!interview || !currentQuestion) return;

    setEvaluation({ score: 0, feedback: '', isEvaluating: true });

    try {
      // Evaluate the answer
      const evaluationResult = await evaluateAnswer(
        currentQuestion.question,
        answer,
        currentQuestion.expectedKeywords,
        currentQuestion.category
      );

      // Update storage with answer and evaluation
      storage.updateAnswer(
        interview._id!,
        currentQuestion.id,
        answer,
        evaluationResult.score,
        evaluationResult.feedback
      );

      // Update current question
      const updatedQuestion = {
        ...currentQuestion,
        userAnswer: answer,
        score: evaluationResult.score,
        feedback: evaluationResult.feedback
      };

      setCurrentQuestion(updatedQuestion);

      // Update interview with answered question
      const updatedInterview = storage.getInterview(interview._id!);
      if (updatedInterview) {
        setInterview(updatedInterview);
      }

      setEvaluation({
        score: evaluationResult.score,
        feedback: evaluationResult.feedback,
        isEvaluating: false
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate answer');
      setEvaluation(null);
    }
  }, [interview, currentQuestion]);

  const nextQuestion = useCallback(async () => {
    if (!interview || currentRound >= MAX_QUESTIONS) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setEvaluation(null);

    try {
      const { jobTitle, difficulty, jobDescription, mode, techStack } = interview;
      const nextRound = currentRound + 1;

      // Get previous Q&A for context
      const previousQA = interview.questions.slice(0, currentRound);

      // Generate next question
      const generatedQuestion = await generateInterviewQuestion(
        jobDescription,
        jobTitle,
        techStack || ['JavaScript', 'Python'],
        difficulty,
        nextRound,
        previousQA,
        mode
      );

      const question: Question = {
        ...generatedQuestion,
        id: crypto.randomUUID(),
        timestamp: new Date()
      };

      setCurrentQuestion(question);
      setCurrentRound(nextRound);

      // Save question to storage
      storage.addQuestion(interview._id!, question);

      // Update interview
      const updatedInterview = storage.getInterview(interview._id!);
      if (updatedInterview) {
        setInterview(updatedInterview);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate next question');
    } finally {
      setIsLoading(false);
    }
  }, [interview, currentRound]);

  const finishInterview = useCallback(async () => {
    if (!interview) return;

    setIsLoading(true);
    setError(null);

    try {
      const { jobTitle } = interview;
      const questions = interview.questions.filter(q => q.userAnswer);

      // Generate overall feedback
      const feedback = await generateOverallFeedback(jobTitle, questions);

      // Complete the interview
      storage.completeInterview(
        interview._id!,
        feedback.overallScore,
        feedback.overallFeedback,
        feedback.strengths,
        feedback.weaknesses
      );

      // Update state
      const updatedInterview = storage.getInterview(interview._id!);
      if (updatedInterview) {
        setInterview(updatedInterview);
      }

      setCurrentQuestion(null);
      storage.clearCurrentSession();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete interview');
    } finally {
      setIsLoading(false);
    }
  }, [interview]);

  const reset = useCallback(() => {
    setInterview(null);
    setCurrentQuestion(null);
    setIsLoading(false);
    setError(null);
    setCurrentRound(0);
    setEvaluation(null);
  }, []);

  return {
    interview,
    currentQuestion,
    isLoading,
    error,
    currentRound,
    evaluation,
    startInterview,
    submitAnswer,
    nextQuestion,
    finishInterview,
    reset
  };
};
