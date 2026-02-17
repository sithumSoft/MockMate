import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Code, 
  MessageSquare, 
  Sparkles, 
  Loader2,
  ChevronDown,
  TrendingUp,
  Building2,
  Landmark
} from 'lucide-react';
import type { InterviewMode } from '@/types/interview';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface JobInputProps {
  onStart: (jobDescription: string, mode: InterviewMode) => void;
  isLoading: boolean;
}

const JOB_CATEGORIES = {
  'IT & Development': {
    icon: Code,
    jobs: {
      frontend: `Frontend Engineer - React Specialist

We are looking for a skilled Frontend Engineer with 3+ years of experience in React and modern JavaScript. 

Requirements:
- Strong proficiency in React, TypeScript, and modern ES6+
- Experience with state management (Redux, Zustand, or Context API)
- Knowledge of CSS-in-JS, Tailwind CSS, or styled-components
- Understanding of web performance optimization
- Experience with testing frameworks (Jest, React Testing Library)
- Familiarity with Next.js and SSR concepts
- Good understanding of REST APIs and GraphQL`,

      backend: `Senior Backend Engineer - Node.js

Join our backend team to build scalable APIs and microservices.

Requirements:
- 4+ years of experience with Node.js and Express/NestJS
- Strong understanding of database design (PostgreSQL, MongoDB)
- Experience with message queues (RabbitMQ, Kafka)
- Knowledge of Docker, Kubernetes, and CI/CD pipelines
- Understanding of microservices architecture
- Experience with cloud platforms (AWS, GCP, or Azure)
- Familiarity with caching strategies (Redis)`,

      fullstack: `Full Stack Developer

We're seeking a versatile Full Stack Developer to join our growing team.

Requirements:
- 2+ years of experience with React and Node.js
- Proficiency in JavaScript/TypeScript
- Experience with SQL and NoSQL databases
- Knowledge of RESTful API design
- Familiarity with Git and Agile methodologies
- Understanding of cloud deployment (Vercel, AWS)
- Good problem-solving skills and attention to detail`,

      devops: `DevOps Engineer - Cloud Infrastructure

Looking for a DevOps Engineer to manage and scale our cloud infrastructure.

Requirements:
- 3+ years of experience with AWS/Azure/GCP
- Strong knowledge of Docker and Kubernetes
- Experience with Infrastructure as Code (Terraform, CloudFormation)
- Proficiency in CI/CD pipelines (Jenkins, GitLab CI, GitHub Actions)
- Understanding of monitoring and logging (Prometheus, Grafana, ELK)
- Experience with scripting (Python, Bash, PowerShell)
- Knowledge of security best practices`,

      dataengineer: `Data Engineer

Join our data team to build and maintain data pipelines and infrastructure.

Requirements:
- 2+ years of experience with Python and SQL
- Strong understanding of data warehousing concepts
- Experience with ETL/ELT processes
- Knowledge of big data technologies (Spark, Hadoop, Kafka)
- Familiarity with cloud data platforms (AWS Redshift, Google BigQuery, Snowflake)
- Experience with data modeling and optimization
- Understanding of data governance and quality`
    }
  },
  'Business & Analytics': {
    icon: TrendingUp,
    jobs: {
      businessanalyst: `Business Analyst

We're seeking a Business Analyst to bridge the gap between business needs and technical solutions.

Requirements:
- 3+ years of experience in business analysis
- Strong analytical and problem-solving skills
- Proficiency in requirements gathering and documentation
- Experience with data analysis tools (Excel, SQL, Tableau, Power BI)
- Knowledge of Agile methodologies and SDLC
- Excellent communication and stakeholder management skills
- Understanding of process improvement methodologies (Six Sigma, Lean)
- Ability to create user stories, use cases, and process flows`,

      dataanalyst: `Data Analyst

Join our analytics team to transform data into actionable insights.

Requirements:
- 2+ years of experience in data analysis
- Strong proficiency in SQL and Excel
- Experience with data visualization tools (Tableau, Power BI, Looker)
- Knowledge of statistical analysis and A/B testing
- Familiarity with Python/R for data manipulation
- Understanding of business intelligence concepts
- Ability to present findings to non-technical stakeholders
- Experience with dashboard creation and KPI tracking`,

      productmanager: `Product Manager

Lead product strategy and development for our digital products.

Requirements:
- 3+ years of product management experience
- Strong understanding of product lifecycle
- Experience with product roadmap planning
- Knowledge of Agile/Scrum methodologies
- Ability to define and track product metrics
- Excellent stakeholder management skills
- Experience with user research and A/B testing
- Understanding of UX/UI principles
- Strong analytical and prioritization skills`
    }
  },
  'Finance & Accounting': {
    icon: TrendingUp,
    jobs: {
      financialanalyst: `Financial Analyst

Seeking a Financial Analyst to support business planning and financial forecasting.

Requirements:
- 2+ years of experience in financial analysis
- Strong proficiency in Excel (advanced formulas, pivot tables, macros)
- Experience with financial modeling and forecasting
- Knowledge of accounting principles (GAAP/IFRS)
- Familiarity with financial software (SAP, Oracle, QuickBooks)
- Understanding of budgeting and variance analysis
- Ability to prepare financial reports and presentations
- Strong analytical and attention to detail
- Bachelor's degree in Finance, Accounting, or related field`,

      accountant: `Senior Accountant

Join our accounting team to manage financial records and ensure compliance.

Requirements:
- 3+ years of accounting experience
- CPA certification preferred
- Strong knowledge of GAAP and financial reporting
- Experience with month-end and year-end close processes
- Proficiency in accounting software (QuickBooks, SAP, Oracle)
- Understanding of tax regulations and compliance
- Experience with audits and internal controls
- Strong analytical and reconciliation skills
- Excellent attention to detail`,

      riskanalyst: `Risk Analyst

Analyze and mitigate financial and operational risks for the organization.

Requirements:
- 2+ years of experience in risk management
- Strong understanding of risk assessment methodologies
- Knowledge of regulatory compliance (Basel III, Dodd-Frank, etc.)
- Experience with risk management software
- Proficiency in data analysis and statistical methods
- Understanding of credit, market, and operational risk
- Ability to prepare risk reports and presentations
- Strong problem-solving and communication skills`
    }
  },
  'Government & Public Sector': {
    icon: Landmark,
    jobs: {
      publicadmin: `Public Administrator

Seeking a Public Administrator to manage government programs and services.

Requirements:
- 2+ years of experience in public administration
- Strong understanding of government policies and regulations
- Experience with budget management and resource allocation
- Knowledge of public policy development
- Excellent communication and stakeholder engagement skills
- Ability to manage cross-functional teams
- Understanding of procurement processes
- Experience with grant management
- Bachelor's degree in Public Administration or related field`,

      policyanalyst: `Policy Analyst

Analyze and develop policies for government agencies or organizations.

Requirements:
- 2+ years of policy research and analysis experience
- Strong research and analytical skills
- Experience with policy development and evaluation
- Knowledge of legislative and regulatory processes
- Ability to conduct cost-benefit analysis
- Excellent written and verbal communication skills
- Experience with stakeholder consultation
- Understanding of quantitative and qualitative research methods
- Master's degree in Public Policy or related field preferred`,

      programcoordinator: `Government Program Coordinator

Coordinate and oversee government-funded programs and initiatives.

Requirements:
- 2+ years of program coordination experience
- Strong project management skills
- Knowledge of grant administration and compliance
- Experience with budget tracking and reporting
- Ability to coordinate with multiple stakeholders
- Understanding of government procurement processes
- Excellent organizational and documentation skills
- Familiarity with performance metrics and evaluation
- Experience with community outreach and engagement`
    }
  },
  'Operations & Management': {
    icon: Building2,
    jobs: {
      projectmanager: `Project Manager

Lead cross-functional projects from initiation to completion.

Requirements:
- 3+ years of project management experience
- PMP or Agile certification preferred
- Strong understanding of project management methodologies
- Experience with project management tools (Jira, MS Project, Asana)
- Excellent stakeholder management and communication skills
- Ability to manage budgets, timelines, and resources
- Experience with risk management and mitigation
- Strong problem-solving and decision-making skills
- Understanding of change management`,

      operationsmanager: `Operations Manager

Oversee daily operations and drive operational excellence.

Requirements:
- 4+ years of operations management experience
- Strong understanding of operational processes and workflows
- Experience with process improvement (Lean, Six Sigma)
- Knowledge of supply chain and logistics
- Ability to manage teams and resources
- Experience with budgeting and cost optimization
- Strong analytical and problem-solving skills
- Excellent leadership and communication skills
- Familiarity with ERP systems`,

      hrmanager: `Human Resources Manager

Lead HR initiatives including recruitment, employee relations, and talent development.

Requirements:
- 3+ years of HR management experience
- Strong knowledge of employment law and HR best practices
- Experience with full-cycle recruitment
- Ability to develop and implement HR policies
- Knowledge of performance management systems
- Experience with HRIS systems
- Strong interpersonal and conflict resolution skills
- Understanding of compensation and benefits
- Bachelor's degree in HR or related field`
    }
  }
};

export const JobInput = ({ onStart, isLoading }: JobInputProps) => {
  const [jobDescription, setJobDescription] = useState('');
  const [mode, setMode] = useState<InterviewMode>('technical');
  const [charCount, setCharCount] = useState(0);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJobDescription(value);
    setCharCount(value.length);
  };

  const loadSample = (jobDesc: string) => {
    setJobDescription(jobDesc);
    setCharCount(jobDesc.length);
  };

  const handleSubmit = () => {
    if (jobDescription.trim().length < 50) return;
    onStart(jobDescription.trim(), mode);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div 
        className="text-center space-y-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          MockMate
        </h1>
        <p className="text-muted-foreground text-lg">
          Practice interviews with AI-powered feedback tailored to your target role
        </p>
      </motion.div>

      {/* Categorized Sample Job Descriptions */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Start with Sample Jobs</CardTitle>
            <CardDescription>
              Select from categorized job descriptions or enter your own
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(JOB_CATEGORIES).map(([category, data], idx) => {
                const Icon = data.icon;
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-auto py-3 group">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                            <span className="font-medium text-sm">{category}</span>
                          </div>
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>{category}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Object.entries(data.jobs).map(([key, jobDesc]) => {
                          const jobTitle = jobDesc.split('\n')[0];
                          return (
                            <DropdownMenuItem
                              key={key}
                              onClick={() => loadSample(jobDesc)}
                              className="cursor-pointer"
                            >
                              <span className="text-sm">{jobTitle}</span>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Interview Mode Selection */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Interview Mode</CardTitle>
            <CardDescription>
              Choose the type of interview you want to practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={mode}
              onValueChange={(value) => setMode(value as InterviewMode)}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
            <div>
              <RadioGroupItem
                value="screening"
                id="screening"
                className="peer sr-only"
              />
              <Label
                htmlFor="screening"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <MessageSquare className="mb-3 h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Screening</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Mixed technical & behavioral
                  </div>
                </div>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="technical"
                id="technical"
                className="peer sr-only"
              />
              <Label
                htmlFor="technical"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Code className="mb-3 h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Technical</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Deep technical focus
                  </div>
                </div>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="behavioral"
                id="behavioral"
                className="peer sr-only"
              />
              <Label
                htmlFor="behavioral"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Briefcase className="mb-3 h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Behavioral</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Soft skills & culture fit
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      </motion.div>

      {/* Job Description Input */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Description</CardTitle>
            <CardDescription>
              Paste the job description for the role you're interviewing for
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste job description here... (minimum 50 characters)"
            value={jobDescription}
            onChange={handleDescriptionChange}
            className="min-h-[250px] resize-none"
            disabled={isLoading}
          />
          <div className="flex justify-between items-center text-sm">
            <span className={charCount < 50 ? 'text-destructive' : 'text-muted-foreground'}>
              {charCount} characters {charCount < 50 && '(minimum 50 required)'}
            </span>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full md:w-auto"
            >
              <Button
                onClick={handleSubmit}
                disabled={jobDescription.trim().length < 50 || isLoading}
                size="lg"
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all text-lg font-semibold px-8 py-6 w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Start Interview
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Features */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        {[
          { emoji: '🎯', title: 'Role-Specific', description: 'Questions tailored to the job description' },
          { emoji: '⚡', title: 'Instant Feedback', description: 'Get scores and improvement tips immediately' },
          { emoji: '🎙️', title: 'Voice Input', description: 'Practice speaking your answers aloud' }
        ].map((feature, idx) => (
          <motion.div
            key={feature.title}
            className="p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted border border-border"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 + idx * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="text-2xl mb-2">{feature.emoji}</div>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
