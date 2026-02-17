import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  RotateCcw, 
  Download,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Code,
  Layers
} from 'lucide-react';
import type { Interview, QuestionCategory } from '@/types/interview';
import { exportInterviewToPDF } from '@/lib/pdfExport';

interface InterviewReportProps {
  interview: Interview;
  onRestart: () => void;
}

const getScoreColor = (score: number): string => {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  if (score >= 4) return 'text-orange-600';
  return 'text-red-600';
};

const getScoreBg = (score: number): string => {
  if (score >= 8) return 'bg-green-500';
  if (score >= 6) return 'bg-yellow-500';
  if (score >= 4) return 'bg-orange-500';
  return 'bg-red-500';
};

const getCategoryIcon = (category: QuestionCategory) => {
  switch (category) {
    case 'technical':
      return <Code className="w-4 h-4" />;
    case 'behavioral':
      return <MessageSquare className="w-4 h-4" />;
    case 'system-design':
      return <Layers className="w-4 h-4" />;
  }
};

const getCategoryLabel = (category: QuestionCategory): string => {
  switch (category) {
    case 'technical':
      return 'Technical';
    case 'behavioral':
      return 'Behavioral';
    case 'system-design':
      return 'System Design';
  }
};

const getPerformanceLevel = (score: number): { label: string; emoji: string } => {
  if (score >= 9) return { label: 'Exceptional', emoji: '🌟' };
  if (score >= 8) return { label: 'Excellent', emoji: '✨' };
  if (score >= 7) return { label: 'Good', emoji: '👍' };
  if (score >= 6) return { label: 'Satisfactory', emoji: '✓' };
  if (score >= 5) return { label: 'Needs Improvement', emoji: '⚠' };
  return { label: 'Requires Work', emoji: '📚' };
};

export const InterviewReportView = ({ interview, onRestart }: InterviewReportProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const answeredQuestions = interview.questions.filter(q => q.userAnswer);
  const categoryStats = answeredQuestions.reduce((acc, q) => {
    if (!acc[q.category]) {
      acc[q.category] = { count: 0, totalScore: 0 };
    }
    acc[q.category].count++;
    acc[q.category].totalScore += q.score || 0;
    return acc;
  }, {} as Record<QuestionCategory, { count: number; totalScore: number }>);

  const overallScore = interview.overallScore || 0;
  const performance = getPerformanceLevel(overallScore);

  const handleDownload = async () => {
    await exportInterviewToPDF(interview);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">{performance.emoji}</div>
        <h1 className="text-3xl font-bold">Interview Complete!</h1>
        <p className="text-muted-foreground">
          Here's your performance report for <span className="font-semibold">{interview.jobTitle}</span>
        </p>
        
        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mt-4">
          <Button
            onClick={handleDownload}
            size="lg"
            className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5" />
            Download PDF Report
          </Button>
          <Button
            onClick={onRestart}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Start New Interview
          </Button>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="text-sm text-muted-foreground mb-1">Overall Score</div>
              <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}<span className="text-2xl text-muted-foreground">/10</span>
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-lg px-4 py-1">
                  {performance.label}
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-md">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{answeredQuestions.length} of {interview.questions.length} answered</span>
                  </div>
                  <Progress 
                    value={(answeredQuestions.length / interview.questions.length) * 100} 
                    className="h-3"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {interview.strengths?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Strengths</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-2xl font-bold text-orange-600">
                      {interview.weaknesses?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Areas to Improve</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {interview.questions.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Questions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="feedback">Detailed Feedback</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryStats).map(([category, stats]) => {
                  const avgScore = Math.round(stats.totalScore / stats.count);
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category as QuestionCategory)}
                          <span className="font-medium capitalize">
                            {getCategoryLabel(category as QuestionCategory)}
                          </span>
                          <Badge variant="secondary">{stats.count} questions</Badge>
                        </div>
                        <span className={`font-bold ${getScoreColor(avgScore)}`}>
                          {avgScore}/10
                        </span>
                      </div>
                      <Progress 
                        value={avgScore * 10} 
                        className={`h-2 ${getScoreBg(avgScore)}`}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {interview.strengths?.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  )) || (
                    <li className="text-muted-foreground">No strengths recorded</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <TrendingDown className="w-5 h-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {interview.weaknesses?.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>{weakness}</span>
                    </li>
                  )) || (
                    <li className="text-muted-foreground">No areas for improvement recorded</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          {answeredQuestions.map((q, index) => (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      {getCategoryIcon(q.category)}
                      {getCategoryLabel(q.category)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Question {index + 1}
                    </span>
                  </div>
                  <div className={`text-xl font-bold ${getScoreColor(q.score || 0)}`}>
                    {q.score}/10
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Question:</div>
                  <p className="font-medium">{q.question}</p>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Your Answer:</div>
                  <p className="bg-muted p-3 rounded-lg">{q.userAnswer}</p>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Feedback:</div>
                  <p className="text-foreground">{q.feedback}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Overall Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed whitespace-pre-line">
                {interview.overallFeedback}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
