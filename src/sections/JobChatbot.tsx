import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Loader2,
  User,
  Bot,
  Sparkles,
  MessageCircle,
  X,
  Minimize2
} from 'lucide-react';
import Groq from 'groq-sdk';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

const groq = new Groq({ 
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
});

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const JobChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hello! I'm your AI Career Advisor.\n\nI'm here to help you succeed in your career journey! I can assist with:\n\n• 📝 Resume & cover letter optimization\n• 🎯 Job search strategies & techniques\n• 💼 Interview preparation & practice questions\n• 💰 Salary negotiation tactics\n• 🚀 Career development & growth planning\n• 📊 Industry insights & market trends\n• 🔄 Career transition guidance\n• 🎓 Skill development recommendations\n\nWhat would you like to discuss today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an expert AI Career Advisor with 15+ years of experience in HR, recruitment, and career coaching. You provide professional, actionable, and personalized career guidance.

Your expertise includes:
- Resume and CV writing: ATS optimization, formatting, keyword optimization, industry-specific best practices
- Cover letters: Compelling storytelling, company research integration, customization strategies
- Job search strategies: Job board tactics, networking tips, LinkedIn optimization, hidden job market access
- Interview preparation: Common questions, behavioral interview techniques (STAR method), technical interview prep, salary discussions
- Salary negotiation: Market research, negotiation tactics, benefits evaluation, counter-offer strategies
- Career development: Skill gap analysis, career path planning, professional branding, leadership development
- Industry insights: Market trends, in-demand skills, emerging technologies, industry transitions
- Career transitions: Transferable skills identification, pivot strategies, upskilling recommendations

Communication style:
- Professional yet approachable and encouraging
- Provide specific, actionable advice with examples
- Use bullet points for clarity when listing multiple points
- Ask clarifying questions when needed to give better advice
- Be honest about challenges while remaining optimistic
- Tailor advice to the user's specific situation
- Keep responses concise (2-4 paragraphs) but comprehensive
- Use emojis sparingly for emphasis

Always aim to empower users with practical strategies they can implement immediately.`
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'user',
            content: userMessage.content
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "How do I optimize my resume for ATS?",
    "What are the best interview preparation strategies?",
    "How should I negotiate my salary offer?",
    "Tips for effective job searching in 2026",
    "How to transition to a new career field?",
    "What skills are most in-demand right now?"
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 hover:scale-110 transition-transform"
            >
              <MessageCircle className="w-7 h-7" />
            </Button>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse"
            >
              AI
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-6 z-50 w-[420px] h-[600px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)]"
          >
            <Card className="h-full flex flex-col shadow-2xl border-2">
              <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-accent/10 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        Career Advisor
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Sparkles className="w-2.5 h-2.5" />
                          AI
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Your personal career coach
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 min-h-0">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex gap-2 ${
                          message.role === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-gradient-to-br from-accent to-primary text-white'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <User className="w-3.5 h-3.5" />
                          ) : (
                            <Bot className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div
                          className={`flex-1 max-w-[75%] rounded-2xl px-3 py-2 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground ml-auto rounded-tr-sm'
                              : 'bg-muted rounded-tl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {message.content}
                          </p>
                          <span className="text-[10px] opacity-60 mt-1 block">
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2"
                      >
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-accent to-primary text-white flex items-center justify-center">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 max-w-[75%] rounded-2xl rounded-tl-sm px-3 py-2 bg-muted">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Quick Prompts - Always Visible */}
                <div className="px-3 py-2 border-t bg-muted/30 flex-shrink-0">
                  <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">Quick questions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((prompt, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickPrompt(prompt)}
                        className="text-[10px] h-6 px-2"
                        disabled={isLoading}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <div className="border-t p-3 bg-background flex-shrink-0">
                  <div className="flex gap-2">
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything about your career..."
                      className="min-h-[50px] max-h-[100px] resize-none text-sm"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="self-end h-[50px] w-[50px] flex-shrink-0"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Press Enter to send • Shift+Enter for new line
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
