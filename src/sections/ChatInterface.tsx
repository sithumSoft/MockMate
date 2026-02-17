import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff, 
  Send, 
  SkipForward, 
  Volume2, 
  VolumeX,
  User,
  Bot,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { useSpeech, useTextToSpeech } from '@/hooks/useSpeech';
import type { Question, QuestionCategory } from '@/types/interview';

interface ChatInterfaceProps {
  currentQuestion: Question | null;
  currentRound: number;
  totalRounds: number;
  isLoading: boolean;
  evaluation: {
    score: number;
    feedback: string;
    isEvaluating: boolean;
  } | null;
  onSubmitAnswer: (answer: string) => void;
  onNextQuestion: () => void;
  onFinish: () => void;
}

const getCategoryColor = (category: QuestionCategory): string => {
  switch (category) {
    case 'technical':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'behavioral':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'system-design':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

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

export const ChatInterface = ({
  currentQuestion,
  currentRound,
  totalRounds,
  isLoading,
  evaluation,
  onSubmitAnswer,
  onNextQuestion,
  onFinish
}: ChatInterfaceProps) => {
  const [answer, setAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const previousQuestionRef = useRef<string | null>(null);

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeech
  } = useSpeech();

  const { speak, stop, isSpeaking, browserSupportsTTS } = useTextToSpeech();

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentQuestion, evaluation, transcript]);

  // Auto-play question when it changes
  useEffect(() => {
    if (currentQuestion && 
        browserSupportsTTS && 
        autoPlayEnabled && 
        currentQuestion.question !== previousQuestionRef.current) {
      
      // Wait a brief moment for UI to render, then speak
      const timer = setTimeout(() => {
        speak(currentQuestion.question);
      }, 500);
      
      previousQuestionRef.current = currentQuestion.question;
      
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, browserSupportsTTS, autoPlayEnabled, speak]);

  // Update answer when speech transcript changes
  useEffect(() => {
    if (transcript && !hasSubmitted) {
      setAnswer(prev => {
        const newAnswer = prev + (prev ? ' ' : '') + transcript;
        return newAnswer;
      });
      resetTranscript();
    }
  }, [transcript, hasSubmitted, resetTranscript]);

  const handleSubmit = () => {
    if (!answer.trim() || hasSubmitted) return;
    setHasSubmitted(true);
    onSubmitAnswer(answer.trim());
  };

  const handleNext = () => {
    setAnswer('');
    setHasSubmitted(false);
    resetTranscript();
    stop();
    if (currentRound >= totalRounds) {
      onFinish();
    } else {
      onNextQuestion();
    }
  };

  const toggleSpeech = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speakQuestion = () => {
    if (currentQuestion && browserSupportsTTS) {
      if (isSpeaking) {
        stop();
      } else {
        speak(currentQuestion.question);
      }
    }
  };

  const isLastQuestion = currentRound >= totalRounds;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Progress Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">
                {currentRound}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{totalRounds}</span>
              <span className="text-sm text-muted-foreground ml-2">
                Question {currentRound} of {totalRounds}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {browserSupportsTTS && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                  className="gap-2"
                  title={autoPlayEnabled ? "Auto-play ON" : "Auto-play OFF"}
                >
                  {autoPlayEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4" />}
                  <span className="text-xs">Auto-play</span>
                </Button>
              )}
              <Badge variant="outline" className={currentQuestion ? getCategoryColor(currentQuestion.category) : ''}>
                {currentQuestion?.category === 'system-design' ? 'System Design' : 
                 currentQuestion?.category === 'behavioral' ? 'Behavioral' : 'Technical'}
              </Badge>
            </div>
          </div>
          <Progress 
            value={(currentRound / totalRounds) * 100} 
            className="h-2 mt-3"
          />
        </CardHeader>
      </Card>

      {/* Voice Indicator Banner */}
      {(isListening || isSpeaking) && (
        <Card className="border-2 border-primary bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-center gap-3">
              {isSpeaking && (
                <>
                  <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                  <span className="font-medium text-primary">🎙️ AI is speaking the question...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stop}
                    className="ml-auto"
                  >
                    Stop
                  </Button>
                </>
              )}
              {isListening && (
                <>
                  <Mic className="w-5 h-5 text-red-500 animate-pulse" />
                  <span className="font-medium text-red-500">🔴 Recording your answer...</span>
                  <span className="text-xs text-muted-foreground">(Speak clearly)</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={stopListening}
                    className="ml-auto"
                  >
                    <MicOff className="w-4 h-4 mr-1" />
                    Stop Recording
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Area */}
      <Card className="min-h-[400px] max-h-[600px] overflow-y-auto">
        <CardContent className="p-6 space-y-6">
          {/* Question Bubble */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="bg-muted rounded-2xl rounded-tl-none p-4">
                <p className="text-foreground leading-relaxed">
                  {currentQuestion?.question}
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                {browserSupportsTTS && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={speakQuestion}
                    className="gap-2"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    {isSpeaking ? 'Stop' : 'Listen'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* User Answer Bubble */}
          {(answer || hasSubmitted) && (
            <div className="flex gap-4 flex-row-reverse">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none p-4">
                  <p className="leading-relaxed">
                    {answer}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Evaluation Card */}
          {evaluation && !evaluation.isEvaluating && (
            <>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <Card className="border-l-4 border-l-primary rounded-tl-none">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Feedback
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Score:</span>
                          <span className={`text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
                            {evaluation.score}/10
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={evaluation.score * 10} 
                        className={`h-2 ${getScoreBg(evaluation.score)}`}
                      />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-foreground leading-relaxed">
                        {evaluation.feedback}
                      </p>
                      <div className="flex items-center gap-2">
                        {evaluation.score >= 7 ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {evaluation.score >= 7 
                            ? 'Great answer! You demonstrated strong knowledge.' 
                            : 'Good effort! Review the feedback to improve.'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Ideal Answer Card */}
              {evaluation.idealAnswer && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950 rounded-tl-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-yellow-900 dark:text-yellow-100">Ideal Answer</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-yellow-900 dark:text-yellow-100 leading-relaxed whitespace-pre-line">
                          {evaluation.idealAnswer}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Evaluating Indicator */}
          {evaluation?.isEvaluating && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="bg-muted rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing your answer...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </CardContent>
      </Card>

      {/* Input Area */}
      {!hasSubmitted ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Voice Instructions */}
              {browserSupportsSpeech && browserSupportsTTS && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-xs text-blue-900 dark:text-blue-100">
                      <strong>Voice Interview Mode:</strong> The question was spoken aloud automatically. 
                      Click "🎤 Voice Answer" to respond by speaking, or type your answer below.
                    </div>
                  </div>
                </div>
              )}
              
              <Textarea
                ref={textareaRef}
                placeholder={isListening ? "Listening to your voice... (or type here)" : "Type your answer here or use voice input..."}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isLoading}
              />
              
              {/* Live Transcript */}
              {isListening && interimTranscript && (
                <div className="text-sm text-muted-italic bg-muted p-2 rounded">
                  {interimTranscript}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {browserSupportsSpeech ? (
                    <Button
                      variant={isListening ? "destructive" : "default"}
                      size="lg"
                      onClick={toggleSpeech}
                      disabled={isLoading}
                      className="gap-2 shadow-lg"
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-5 h-5" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          🎤 Voice Answer
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Voice input not supported
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleNext}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || isLoading}
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-primary to-accent"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit Answer
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {isLastQuestion 
                  ? 'This was the final question. View your results!' 
                  : 'Ready for the next question?'}
              </div>
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isLastQuestion ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Finish Interview
                  </>
                ) : (
                  <>
                    <SkipForward className="w-4 h-4" />
                    Next Question
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
