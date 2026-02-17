import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { 
  History, 
  Sparkles, 
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
  BarChart3
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { JobInput } from '@/sections/JobInput';
import { ChatInterface } from '@/sections/ChatInterface';
import { InterviewReportView } from '@/sections/InterviewReport';
import { HistoryDashboard } from '@/sections/HistoryDashboard';
import { AnalyticsDashboard } from '@/sections/AnalyticsDashboard';
import { JobChatbot } from '@/sections/JobChatbot';
import { useInterview } from '@/hooks/useInterview';
import type { Interview, InterviewMode } from '@/types/interview';
import { storage } from '@/lib/storage';
import './App.css';

type ViewState = 'input' | 'interview' | 'report' | 'history' | 'analytics';

function App() {
  const [view, setView] = useState<ViewState>('input');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
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
  } = useInterview();

  // Check for existing session on mount
  useEffect(() => {
    const sessionId = storage.getCurrentSession();
    if (sessionId) {
      const existingInterview = storage.getInterview(sessionId);
      if (existingInterview && existingInterview.status === 'ongoing') {
        // Could restore session here if desired
      }
    }
  }, []);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleStartInterview = async (jobDescription: string, mode: InterviewMode) => {
    await startInterview(jobDescription, mode);
    setView('interview');
  };

  const handleSubmitAnswer = async (answer: string) => {
    await submitAnswer(answer);
  };

  const handleNextQuestion = async () => {
    if (currentRound >= 5) {
      await finishInterview();
      setView('report');
    } else {
      await nextQuestion();
    }
  };

  const handleFinishInterview = async () => {
    await finishInterview();
    setView('report');
  };

  const handleRestart = () => {
    reset();
    setView('input');
  };

  const handleViewHistory = () => {
    setView('history');
  };

  const handleSelectInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setView('report');
  };

  const handleStartNewFromHistory = () => {
    setView('input');
  };

  const handleViewAnalytics = () => {
    setView('analytics');
  };

  const renderContent = () => {
    switch (view) {
      case 'input':
        return (
          <JobInput 
            onStart={handleStartInterview} 
            isLoading={isLoading} 
          />
        );
      
      case 'interview':
        return (
          <ChatInterface
            currentQuestion={currentQuestion}
            currentRound={currentRound}
            totalRounds={10}
            isLoading={isLoading}
            evaluation={evaluation}
            onSubmitAnswer={handleSubmitAnswer}
            onNextQuestion={handleNextQuestion}
            onFinish={handleFinishInterview}
          />
        );
      
      case 'report':
        const reportInterview = selectedInterview || interview;
        if (!reportInterview) return null;
        return (
          <InterviewReportView
            interview={reportInterview}
            onRestart={handleRestart}
          />
        );
      
      case 'history':
        return (
          <HistoryDashboard
            onSelectInterview={handleSelectInterview}
            onStartNew={handleStartNewFromHistory}
          />
        );
      
      case 'analytics':
        return (
          <AnalyticsDashboard
            interviews={storage.getAllInterviews()}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-center" richColors />
      
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-xl font-bold"
                onClick={() => setView('input')}
              >
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="hidden sm:inline">MockMate</span>
                <span className="sm:hidden">MockMate</span>
              </Button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant={view === 'analytics' ? 'default' : 'ghost'}
                onClick={handleViewAnalytics}
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
              <Button
                variant={view === 'history' ? 'default' : 'ghost'}
                onClick={handleViewHistory}
                className="gap-2"
              >
                <History className="w-4 h-4" />
                History
              </Button>
              {view !== 'input' && (
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  New Interview
                </Button>
              )}
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-4 py-3 space-y-2">
              <Button
                variant={view === 'analytics' ? 'default' : 'ghost'}
                onClick={() => {
                  handleViewAnalytics();
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
              <Button
                variant={view === 'history' ? 'default' : 'ghost'}
                onClick={() => {
                  handleViewHistory();
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start gap-2"
              >
                <History className="w-4 h-4" />
                History
              </Button>
              {view !== 'input' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleRestart();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  New Interview
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">MockMate</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Powered by Groq AI</span>
              <span>•</span>
              <span>Built with React & Tailwind</span>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="w-5 h-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-5 h-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>
              Practice makes perfect. Keep interviewing to improve your skills!
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Career Advisor Chatbot */}
      <JobChatbot />
    </div>
  );
}

export default App;
