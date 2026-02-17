import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Briefcase, 
  TrendingUp, 
  Trash2, 
  Eye, 
  RotateCcw,
  ChevronRight,
  BarChart3,
  Target,
  Download
} from 'lucide-react';
import type { Interview, InterviewStatus } from '@/types/interview';
import { storage } from '@/lib/storage';
import { exportAnalyticsToPDF } from '@/lib/pdfExport';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

interface HistoryDashboardProps {
  onSelectInterview: (interview: Interview) => void;
  onStartNew: () => void;
}

const getScoreColor = (score: number): string => {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  if (score >= 4) return 'text-orange-600';
  return 'text-red-600';
};

const getStatusBadge = (status: InterviewStatus) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case 'ongoing':
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
  }
};

export const HistoryDashboard = ({ onSelectInterview, onStartNew }: HistoryDashboardProps) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = () => {
    const allInterviews = storage.getAllInterviews();
    setInterviews(allInterviews);
  };

  const handleDelete = (id: string) => {
    storage.deleteInterview(id);
    loadInterviews();
    setDeleteId(null);
  };

  const getStats = () => {
    const completed = interviews.filter(i => i.status === 'completed');
    if (completed.length === 0) return null;

    const avgScore = completed.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completed.length;
    const totalQuestions = completed.reduce((sum, i) => sum + i.questions.length, 0);
    const totalAnswered = completed.reduce((sum, i) => 
      sum + i.questions.filter(q => q.userAnswer).length, 0
    );

    return {
      totalInterviews: interviews.length,
      completedInterviews: completed.length,
      averageScore: Math.round(avgScore),
      totalQuestions,
      totalAnswered,
      responseRate: Math.round((totalAnswered / totalQuestions) * 100)
    };
  };

  const stats = getStats();

  const handleExportToPDF = async () => {
    if (stats) {
      await exportAnalyticsToPDF(interviews, stats);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Interview History</h1>
          <p className="text-muted-foreground">
            Track your progress and review past interviews
          </p>
        </div>
        <div className="flex gap-2">
          {stats && (
            <Button variant="outline" onClick={handleExportToPDF} className="gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          )}
          <Button onClick={onStartNew} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            New Interview
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalInterviews}</div>
                  <div className="text-xs text-muted-foreground">Total Interviews</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                    {stats.averageScore}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.completedInterviews}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.responseRate}%</div>
                  <div className="text-xs text-muted-foreground">Response Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Interviews</CardTitle>
          <CardDescription>
            Click on an interview to view detailed feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">No interviews yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your first mock interview to see your history here
              </p>
              <Button onClick={onStartNew}>Start Interview</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map((interview) => (
                <div
                  key={interview._id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => onSelectInterview(interview)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{interview.jobTitle}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(interview.createdAt).toLocaleDateString()}
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs">
                          {interview.mode}
                        </Badge>
                        <span>•</span>
                        {getStatusBadge(interview.status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {interview.status === 'completed' && interview.overallScore && (
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(interview.overallScore)}`}>
                          {interview.overallScore}
                        </div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInterview(interview);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Dialog open={deleteId === interview._id} onOpenChange={(open) => !open && setDeleteId(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(interview._id!);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Interview</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this interview? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button 
                              variant="destructive"
                              onClick={() => interview._id && handleDelete(interview._id)}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
