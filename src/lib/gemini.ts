import Groq from 'groq-sdk';
import type { 
  GeneratedQuestion, 
  AnswerEvaluation, 
  Question, 
  InterviewMode,
  DifficultyLevel 
} from '@/types/interview';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

if (!API_KEY) {
  console.warn('Groq API key not found. Please set VITE_GROQ_API_KEY environment variable.');
}

const groq = new Groq({ 
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
});

export const parseJobDescription = async (jobDescription: string): Promise<{
  jobTitle: string;
  techStack: string[];
  difficulty: DifficultyLevel;
}> => {
  const prompt = `
You are an expert job description analyzer. Parse the following job description and extract:
1. Job title
2. Tech stack (programming languages, frameworks, tools, databases)
3. Seniority level (junior, mid, or senior) based on years of experience and requirements

Job Description:
"""${jobDescription}"""

Respond ONLY with a JSON object in this exact format:
{
  "jobTitle": "extracted job title",
  "techStack": ["tech1", "tech2", "tech3"],
  "difficulty": "junior|mid|senior"
}
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    });
    
    const content = response.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error parsing job description:', error);
    return {
      jobTitle: 'Software Engineer',
      techStack: ['JavaScript', 'Python'],
      difficulty: 'mid'
    };
  }
};

export const generateInterviewQuestion = async (
  _jobDescription: string,
  jobTitle: string,
  techStack: string[],
  difficulty: DifficultyLevel,
  round: number,
  previousQA: Question[],
  mode: InterviewMode
): Promise<GeneratedQuestion> => {
  const categoryDistribution: Record<InterviewMode, string> = {
    'screening': 'Mix of 50% technical fundamentals, 30% behavioral, 20% problem-solving',
    'technical': '70% technical (coding, algorithms, system design), 20% behavioral, 10% architecture',
    'behavioral': '70% behavioral/soft skills, 20% situational, 10% technical background'
  };

  const difficultyGuidance: Record<DifficultyLevel, string> = {
    'junior': 'Focus on fundamentals, basic concepts, and learning attitude. Avoid complex architecture or advanced patterns.',
    'mid': 'Include practical experience, design patterns, and some system design. Test problem-solving skills.',
    'senior': 'Deep dive into architecture, scalability, trade-offs, leadership, and complex problem-solving.'
  };

  // Progressive difficulty: Start easy, get harder
  const questionDifficulty = round <= 3 ? 'easy' : round <= 6 ? 'medium' : 'hard';
  
  const prompt = `
You are an expert technical interviewer conducting a ${mode} interview for: "${jobTitle}"

Job Context:
- Tech Stack: ${techStack.join(', ')}
- Seniority: ${difficulty}
- Interview Mode: ${mode}
- Question Round: ${round} of 10
- Question Difficulty: ${questionDifficulty} (start simple, progressively get harder)

${previousQA.length > 0 ? `Previous Q&A in this interview:\n${previousQA.map((q, i) => `
Q${i + 1}: ${q.question}
A: ${q.userAnswer || 'Not answered'}
Category: ${q.category}`).join('\n')}` : 'This is the first question.'}

Guidelines:
- ${difficultyGuidance[difficulty]}
- ${categoryDistribution[mode]}
- **IMPORTANT**: Questions 1-3 should be SIMPLE and fundamental (basics, definitions, simple concepts)
- Questions 4-6 should be MEDIUM difficulty (practical scenarios, common problems)
- Questions 7-10 should be HARD and advanced (complex architectures, optimization, edge cases)
- Make questions specific to the tech stack mentioned
- Questions should build on previous answers if applicable
- For technical questions, include expected keywords for evaluation

Generate ONE interview question.

Response format (JSON only):
{
  "question": "The interview question text - be specific and clear",
  "category": "technical|behavioral|system-design",
  "expectedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "followUps": ["Follow-up if answer is vague", "Deeper question if they excel"]
}
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    });
    
    const content = response.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        question: parsed.question,
        category: parsed.category,
        expectedKeywords: parsed.expectedKeywords || [],
        followUps: parsed.followUps || []
      };
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error generating question:', error);
    return {
      question: `Tell me about your experience with ${techStack[0] || 'software development'} and how you've used it in production.`,
      category: 'technical',
      expectedKeywords: ['experience', 'production', 'challenges', 'solutions'],
      followUps: ['Can you elaborate on that?', 'What would you do differently?']
    };
  }
};

export const evaluateAnswer = async (
  question: string,
  answer: string,
  expectedKeywords: string[],
  category: string
): Promise<AnswerEvaluation> => {
  const evaluationPrompt = `
You are an expert interviewer evaluating a candidate's response.

Question: "${question}"

Candidate Answer: "${answer}"

Key concepts expected: ${expectedKeywords.join(', ')}

Question Category: ${category}

Evaluate based on:
1. Technical accuracy (40%) - Is the information correct?
2. Completeness (30%) - Did they cover the key aspects?
3. Communication clarity (20%) - Is the answer well-structured and clear?
4. ${category === 'behavioral' ? 'STAR method usage (10%) - Did they use Situation, Task, Action, Result format?' : 'Depth of understanding (10%) - Did they show deep knowledge?'}

Scoring Guide:
- 9-10: Exceptional answer, exceeds expectations
- 7-8: Good answer, covers main points well
- 5-6: Adequate, missing some key points
- 3-4: Below average, significant gaps
- 1-2: Poor, major misunderstandings

Provide constructive feedback highlighting strengths and specific areas for improvement.

Response format (JSON only):
{
  "score": number,
  "feedback": "Detailed constructive feedback (2-3 sentences on strengths, 2-3 on improvements)",
  "missingConcepts": ["Concept they should have mentioned"],
  "followUpNeeded": boolean,
  "strengths": ["Specific strength 1", "Specific strength 2"]
}
`;

  const idealAnswerPrompt = `
You are an expert software engineer providing a high-quality answer to an interview question.

Question: "${question}"

Question Category: ${category}

Key concepts to cover: ${expectedKeywords.join(', ')}

Provide a comprehensive, well-structured answer that demonstrates:
- Deep technical knowledge
- Practical experience
- Clear communication
${category === 'behavioral' ? '- STAR method (Situation, Task, Action, Result)' : '- Real-world examples and best practices'}

Generate an ideal answer that a strong candidate would give. Keep it concise but thorough (150-250 words).

Return ONLY the answer text, no JSON formatting.
`;

  try {
    // Run evaluation and ideal answer generation in parallel
    const [evaluationResponse, idealAnswerResponse] = await Promise.all([
      groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: evaluationPrompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
      groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: idealAnswerPrompt }],
        temperature: 0.7,
        max_tokens: 1024,
      })
    ]);
    
    const evaluationContent = evaluationResponse.choices[0]?.message?.content || '';
    const idealAnswer = idealAnswerResponse.choices[0]?.message?.content?.trim() || '';
    
    const jsonMatch = evaluationContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(10, Math.max(1, Math.round(parsed.score))),
        feedback: parsed.feedback,
        missingConcepts: parsed.missingConcepts || [],
        followUpNeeded: parsed.followUpNeeded || false,
        strengths: parsed.strengths || [],
        idealAnswer: idealAnswer
      };
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return {
      score: 5,
      feedback: 'Answer received. Unable to provide detailed evaluation at this time.',
      missingConcepts: [],
      followUpNeeded: false,
      strengths: ['Attempted the question'],
      idealAnswer: ''
    };
  }
};

export const generateOverallFeedback = async (
  jobTitle: string,
  questions: Question[]
): Promise<{
  overallScore: number;
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}> => {
  const answeredQuestions = questions.filter(q => q.userAnswer);
  const totalQuestions = questions.length;
  const unansweredCount = totalQuestions - answeredQuestions.length;
  
  const prompt = `
You are a senior hiring manager providing final interview feedback.

Position: ${jobTitle}

Interview Summary:
- Total Questions: ${totalQuestions}
- Answered Questions: ${answeredQuestions.length}
- Unanswered Questions: ${unansweredCount}

${answeredQuestions.map((q, i) => `
Q${i + 1} (${q.category}): ${q.question}
Candidate Answer: ${q.userAnswer}
Score: ${q.score}/10
`).join('\n')}

${unansweredCount > 0 ? `\nNOTE: ${unansweredCount} question(s) were skipped/unanswered. These must be counted as 0/10 in the overall score calculation.` : ''}

Provide comprehensive feedback:
1. Overall assessment of the candidate
2. Key strengths demonstrated
3. Areas needing improvement (include skipped questions if applicable)
4. Specific recommendations for future interviews
5. Hiring recommendation (strong yes, yes, maybe, no, strong no)

Response format (JSON only):
{
  "overallScore": number (sum of all scores including 0 for unanswered / total questions, 1-10),
  "overallFeedback": "2-3 paragraph comprehensive assessment",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    });
    
    const content = response.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Calculate accurate overall score: (sum of answered scores + 0 for unanswered) / total questions
      const totalScoreSum = answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
      const accurateAvgScore = totalQuestions > 0 ? totalScoreSum / totalQuestions : 0;
      
      return {
        overallScore: Number(accurateAvgScore.toFixed(1)),
        overallFeedback: parsed.overallFeedback,
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || (unansweredCount > 0 ? [`Skipped ${unansweredCount} question(s) without answering`] : []),
        recommendations: parsed.recommendations || []
      };
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error generating overall feedback:', error);
    
    // Fallback: accurate calculation
    const totalScoreSum = answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
    const accurateAvgScore = totalQuestions > 0 ? totalScoreSum / totalQuestions : 0;
    
    return {
      overallScore: Number(accurateAvgScore.toFixed(1)),
      overallFeedback: 'Interview completed. Thank you for your participation.',
      strengths: answeredQuestions.length > 0 ? ['Completed some interview questions'] : [],
      weaknesses: unansweredCount > 0 ? [`Skipped ${unansweredCount} question(s) without answering`] : ['Unable to provide detailed analysis'],
      recommendations: ['Practice answering all interview questions', 'Avoid skipping questions during interviews']
    };
  }
};

export { groq };
