import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Brain,
  AlertCircle,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import type { Interview, QuestionCategory } from '@/types/interview';

interface AnalyticsDashboardProps {
  interviews: Interview[];
}

const COLORS = {
  technical: '#3b82f6',
  behavioral: '#10b981',
  'system-design': '#8b5cf6',
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444'
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export const AnalyticsDashboard = ({ interviews }: AnalyticsDashboardProps) => {
  const analytics = useMemo(() => {
    const completed = interviews.filter(i => i.status === 'completed');
    
    if (completed.length === 0) {
      return null;
    }

    // Overall Statistics
    const totalInterviews = completed.length;
    const totalQuestions = completed.reduce((sum, i) => sum + i.questions.length, 0);
    const totalAnswered = completed.reduce((sum, i) => 
      sum + i.questions.filter(q => q.userAnswer).length, 0
    );
    const avgScore = completed.reduce((sum, i) => sum + (i.overallScore || 0), 0) / totalInterviews;

    // Score Distribution
    const scoreDistribution = completed.map((interview, idx) => ({
      name: `Interview ${idx + 1}`,
      score: interview.overallScore || 0,
      date: new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    // Category Performance
    const categoryStats: Record<QuestionCategory, { total: number; totalScore: number; count: number }> = {
      technical: { total: 0, totalScore: 0, count: 0 },
      behavioral: { total: 0, totalScore: 0, count: 0 },
      'system-design': { total: 0, totalScore: 0, count: 0 }
    };

    completed.forEach(interview => {
      interview.questions.forEach(q => {
        if (q.score !== undefined && q.category in categoryStats) {
          categoryStats[q.category].totalScore += q.score;
          categoryStats[q.category].count += 1;
          categoryStats[q.category].total++;
        }
      });
    });

    const categoryPerformance = Object.entries(categoryStats).map(([category, stats]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
      avgScore: stats.count > 0 ? Math.round((stats.totalScore / stats.count) * 10) / 10 : 0,
      questions: stats.total,
      fullMark: 10
    }));

    // Difficulty Performance
    const difficultyStats = {
      junior: { total: 0, totalScore: 0 },
      mid: { total: 0, totalScore: 0 },
      senior: { total: 0, totalScore: 0 }
    };

    completed.forEach(interview => {
      if (interview.overallScore !== undefined) {
        difficultyStats[interview.difficulty].totalScore += interview.overallScore;
        difficultyStats[interview.difficulty].total += 1;
      }
    });

    const difficultyPerformance = Object.entries(difficultyStats)
      .filter(([_, stats]) => stats.total > 0)
      .map(([level, stats]) => ({
        level: level.charAt(0).toUpperCase() + level.slice(1),
        score: Math.round((stats.totalScore / stats.total) * 10) / 10,
        interviews: stats.total
      }));

    // Interview Mode Distribution
    const modeDistribution = completed.reduce((acc, interview) => {
      acc[interview.mode] = (acc[interview.mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const modeData = Object.entries(modeDistribution).map(([mode, count]) => ({
      name: mode.charAt(0).toUpperCase() + mode.slice(1),
      value: count
    }));

    // Strengths and Weaknesses
    const allStrengths: string[] = [];
    const allWeaknesses: string[] = [];

    completed.forEach(interview => {
      if (interview.strengths) allStrengths.push(...interview.strengths);
      if (interview.weaknesses) allWeaknesses.push(...interview.weaknesses);
    });

    const strengthCounts = allStrengths.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const weaknessCounts = allWeaknesses.reduce((acc, w) => {
      acc[w] = (acc[w] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topStrengths = Object.entries(strengthCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([strength, count]) => ({ strength, count }));

    const topWeaknesses = Object.entries(weaknessCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([weakness, count]) => ({ weakness, count }));

    // Progress Over Time
    const progressData = completed
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((interview, idx) => ({
        interview: idx + 1,
        score: interview.overallScore || 0,
        date: new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));

    // Calculate trend
    const recentScores = scoreDistribution.slice(-3).map(s => s.score);
    const avgRecentScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const trend = avgRecentScore >= avgScore ? 'up' : 'down';

    return {
      totalInterviews,
      totalQuestions,
      totalAnswered,
      avgScore: Math.round(avgScore * 10) / 10,
      responseRate: Math.round((totalAnswered / totalQuestions) * 100),
      scoreDistribution,
      categoryPerformance,
      difficultyPerformance,
      modeData,
      topStrengths,
      topWeaknesses,
      progressData,
      trend
    };
  }, [interviews]);

  if (!analytics) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Analytics Available</h3>
            <p className="text-muted-foreground text-center">
              Complete at least one interview to see your performance analytics
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Performance Analytics</h1>
        <p className="text-muted-foreground">
          Track your progress and identify areas for improvement
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            {analytics.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgScore}/10</div>
            <Progress value={analytics.avgScore * 10} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Across {analytics.totalInterviews} interviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalQuestions}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.totalAnswered} answered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.responseRate}%</div>
            <Progress value={analytics.responseRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalInterviews}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Completed sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
            <CardDescription>Your score improvement across interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke={COLORS.primary} 
                  fill={COLORS.primary}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Performance across different question types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={analytics.categoryPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 10]} />
                <Radar 
                  name="Score" 
                  dataKey="avgScore" 
                  stroke={COLORS.primary} 
                  fill={COLORS.primary} 
                  fillOpacity={0.6} 
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interview Mode Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Types</CardTitle>
            <CardDescription>Distribution of interview modes completed</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.modeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.modeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Difficulty Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Difficulty Performance</CardTitle>
            <CardDescription>Average scores by difficulty level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.difficultyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="score" fill={COLORS.success} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Top Strengths
            </CardTitle>
            <CardDescription>Your most consistent strong areas</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topStrengths.length > 0 ? (
              <div className="space-y-3">
                {analytics.topStrengths.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        #{idx + 1}
                      </Badge>
                      <span className="text-sm">{item.strength}</span>
                    </div>
                    <Badge>{item.count}x</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No strengths identified yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Areas for Improvement
            </CardTitle>
            <CardDescription>Focus areas to enhance your skills</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topWeaknesses.length > 0 ? (
              <div className="space-y-3">
                {analytics.topWeaknesses.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        #{idx + 1}
                      </Badge>
                      <span className="text-sm">{item.weakness}</span>
                    </div>
                    <Badge variant="destructive">{item.count}x</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No weaknesses identified yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Score Timeline</CardTitle>
          <CardDescription>Detailed view of all interview scores</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
