import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Interview, Question, QuestionCategory } from '@/types/interview';

// Chat bubble style PDF export
export const exportInterviewToPDF = async (interview: Interview) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // Helper to add new page if needed
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Helper to draw chat bubble
  const drawChatBubble = (
    text: string,
    isUser: boolean,
    maxWidth: number,
    showScore?: number
  ) => {
    const bubbleWidth = maxWidth * 0.75;
    const xStart = isUser ? pageWidth - marginRight - bubbleWidth : marginLeft;
    const padding = 5;
    
    // Set colors
    if (isUser) {
      pdf.setFillColor(59, 130, 246); // Primary blue
      pdf.setTextColor(255, 255, 255);
    } else {
      pdf.setFillColor(243, 244, 246); // Light gray
      pdf.setTextColor(0, 0, 0);
    }

    // Calculate text height
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(text, bubbleWidth - (padding * 2));
    const textHeight = lines.length * 5;
    const bubbleHeight = textHeight + (padding * 2);

    checkPageBreak(bubbleHeight + 10);

    // Draw rounded rectangle bubble
    pdf.roundedRect(xStart, yPosition, bubbleWidth, bubbleHeight, 2, 2, 'F');

    // Draw text
    lines.forEach((line: string, idx: number) => {
      pdf.text(line, xStart + padding, yPosition + padding + 4 + (idx * 5));
    });

    yPosition += bubbleHeight;

    // Add score badge if provided
    if (showScore !== undefined) {
      yPosition += 3;
      const scoreColor = showScore >= 8 ? [34, 197, 94] :
                        showScore >= 6 ? [234, 179, 8] :
                        showScore >= 4 ? [249, 115, 22] : [239, 68, 68];
      
      pdf.setFillColor(...scoreColor as [number, number, number]);
      pdf.roundedRect(xStart, yPosition, 25, 6, 1, 1, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${showScore}/10`, xStart + 12.5, yPosition + 4, { align: 'center' });
      yPosition += 8;
    }

    yPosition += 5; // Gap between bubbles
  };

  // Helper to draw recommendation box
  const drawRecommendation = (feedback: string, maxWidth: number) => {
    const boxWidth = maxWidth * 0.85;
    const xStart = marginLeft + ((contentWidth - boxWidth) / 2);
    const padding = 5;

    pdf.setFillColor(254, 243, 199); // Light yellow
    pdf.setTextColor(120, 53, 15); // Dark brown

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(feedback, boxWidth - (padding * 2));
    const textHeight = lines.length * 4.5;
    const boxHeight = textHeight + (padding * 2) + 5;

    checkPageBreak(boxHeight + 10);

    // Draw box with icon
    pdf.setDrawColor(251, 191, 36);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(xStart, yPosition, boxWidth, boxHeight, 2, 2, 'FD');

    // Lightbulb icon (simplified)
    pdf.setTextColor(251, 191, 36);
    pdf.setFontSize(10);
    pdf.text('💡', xStart + padding, yPosition + padding + 3);

    // Recommendation text
    pdf.setTextColor(120, 53, 15);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI Recommendation:', xStart + padding + 8, yPosition + padding + 3);
    
    pdf.setFont('helvetica', 'normal');
    yPosition += padding + 7;
    lines.forEach((line: string) => {
      pdf.text(line, xStart + padding, yPosition);
      yPosition += 4.5;
    });

    yPosition += padding + 8;
  };

  // ============ PAGE 1: COVER & STATISTICS ============
  
  // Header with gradient effect (simulated with rectangles)
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, 60, 'F');
  pdf.setFillColor(147, 51, 234);
  pdf.rect(0, 0, pageWidth, 60, 'F');
  pdf.setGState(new (pdf as any).GState({ opacity: 0.7 }));
  pdf.setGState(new (pdf as any).GState({ opacity: 1 }));

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Interview Report', pageWidth / 2, 25, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(interview.jobTitle, pageWidth / 2, 35, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.text(
    new Date(interview.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    pageWidth / 2,
    45,
    { align: 'center' }
  );

  yPosition = 70;

  // Overall Score Card
  pdf.setFillColor(249, 250, 251);
  pdf.roundedRect(marginLeft, yPosition, contentWidth, 45, 3, 3, 'F');
  
  const overallScore = interview.overallScore || 0;
  const scoreColor = overallScore >= 8 ? [34, 197, 94] :
                     overallScore >= 6 ? [234, 179, 8] :
                     overallScore >= 4 ? [249, 115, 22] : [239, 68, 68];

  pdf.setTextColor(...scoreColor as [number, number, number]);
  pdf.setFontSize(48);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${overallScore}`, marginLeft + 30, yPosition + 30, { align: 'center' });
  
  pdf.setFontSize(16);
  pdf.setTextColor(107, 114, 128);
  pdf.text('/10', marginLeft + 50, yPosition + 30);

  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overall Score', marginLeft + 30, yPosition + 38, { align: 'center' });

  // Performance level
  const performanceLevel = overallScore >= 9 ? '🌟 Exceptional' :
                          overallScore >= 8 ? '✨ Excellent' :
                          overallScore >= 7 ? '👍 Good' :
                          overallScore >= 6 ? '✓ Satisfactory' :
                          overallScore >= 5 ? '⚠ Needs Improvement' : '📚 Requires Work';
  
  pdf.setFontSize(11);
  pdf.text(performanceLevel, marginLeft + 100, yPosition + 25);

  yPosition += 55;

  // Statistics Grid
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Interview Statistics', marginLeft, yPosition);
  yPosition += 10;

  const answeredQuestions = interview.questions.filter(q => q.userAnswer);
  const unansweredQuestions = interview.questions.filter(q => !q.userAnswer);
  const avgScore = answeredQuestions.length > 0
    ? answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / answeredQuestions.length
    : 0;
  
  // Accurate overall score calculation
  const totalScoreSum = answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
  const accurateOverallScore = interview.questions.length > 0 
    ? totalScoreSum / interview.questions.length 
    : 0;

  // Category breakdown
  const categoryStats = answeredQuestions.reduce((acc, q) => {
    if (!acc[q.category]) {
      acc[q.category] = { count: 0, totalScore: 0, scores: [] };
    }
    acc[q.category].count++;
    acc[q.category].totalScore += q.score || 0;
    acc[q.category].scores.push(q.score || 0);
    return acc;
  }, {} as Record<QuestionCategory, { count: number; totalScore: number; scores: number[] }>);

  const statsData = [
    ['Total Questions', interview.questions.length.toString()],
    ['Answered', answeredQuestions.length.toString()],
    ['Unanswered (counted as 0)', unansweredQuestions.length.toString()],
    ['Avg Score (answered only)', avgScore.toFixed(1)],
    ['Overall Score (all questions)', accurateOverallScore.toFixed(1)],
    ['Difficulty Level', interview.difficulty.charAt(0).toUpperCase() + interview.difficulty.slice(1)],
    ['Interview Mode', interview.mode.charAt(0).toUpperCase() + interview.mode.slice(1)],
    ['Tech Stack', interview.techStack?.join(', ') || 'N/A'],
  ];

  autoTable(pdf, {
    startY: yPosition,
    head: [],
    body: statsData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [75, 85, 99] },
      1: { cellWidth: 'auto', textColor: [0, 0, 0] }
    }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 10;

  // Category Performance
  if (Object.keys(categoryStats).length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Performance by Category', marginLeft, yPosition);
    yPosition += 8;

    const categoryData = Object.entries(categoryStats).map(([category, stats]) => [
      category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
      stats.count.toString(),
      (stats.totalScore / stats.count).toFixed(1),
      Math.max(...stats.scores).toString(),
      Math.min(...stats.scores).toString()
    ]);

    autoTable(pdf, {
      startY: yPosition,
      head: [['Category', 'Questions', 'Avg Score', 'Best', 'Worst']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' }
      }
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 10;
  }

  // Strengths & Weaknesses
  if (interview.strengths && interview.strengths.length > 0) {
    checkPageBreak(40);
    pdf.setFillColor(220, 252, 231);
    pdf.roundedRect(marginLeft, yPosition, contentWidth, 5, 1, 1, 'F');
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(21, 128, 61);
    pdf.text('✓ Key Strengths', marginLeft + 3, yPosition + 3.5);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    interview.strengths.forEach(strength => {
      checkPageBreak(6);
      const lines = pdf.splitTextToSize(`• ${strength}`, contentWidth - 10);
      lines.forEach((line: string) => {
        pdf.text(line, marginLeft + 5, yPosition);
        yPosition += 5;
      });
    });
    yPosition += 5;
  }

  if (interview.weaknesses && interview.weaknesses.length > 0) {
    checkPageBreak(40);
    pdf.setFillColor(254, 226, 226);
    pdf.roundedRect(marginLeft, yPosition, contentWidth, 5, 1, 1, 'F');
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(185, 28, 28);
    pdf.text('✗ Areas for Improvement', marginLeft + 3, yPosition + 3.5);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    interview.weaknesses.forEach(weakness => {
      checkPageBreak(6);
      const lines = pdf.splitTextToSize(`• ${weakness}`, contentWidth - 10);
      lines.forEach((line: string) => {
        pdf.text(line, marginLeft + 5, yPosition);
        yPosition += 5;
      });
    });
    yPosition += 5;
  }

  // ============ CHAT BUBBLE PAGES: QUESTIONS & ANSWERS ============
  pdf.addPage();
  yPosition = 20;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Interview Conversation', marginLeft, yPosition);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Your interview questions and answers with AI feedback', marginLeft, yPosition + 7);
  yPosition += 15;

  pdf.setDrawColor(229, 231, 235);
  pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 10;

  // Iterate through questions
  interview.questions.forEach((question: Question, index: number) => {
    checkPageBreak(30);

    // Question number badge
    pdf.setFillColor(99, 102, 241);
    pdf.circle(marginLeft + 4, yPosition + 2, 4, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${index + 1}`, marginLeft + 4, yPosition + 3, { align: 'center' });
    
    // Category badge
    const categoryColors: Record<string, [number, number, number]> = {
      technical: [59, 130, 246],
      behavioral: [16, 185, 129],
      'system-design': [139, 92, 246]
    };
    const categoryColor = categoryColors[question.category] || [100, 100, 100];
    pdf.setFillColor(...categoryColor as [number, number, number]);
    pdf.roundedRect(marginLeft + 12, yPosition - 1, 28, 5, 1, 1, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7);
    pdf.text(question.category.toUpperCase(), marginLeft + 26, yPosition + 2, { align: 'center' });
    
    yPosition += 10;

    // AI Question Bubble (left side)
    drawChatBubble(`Question: ${question.question}`, false, contentWidth);

    // User Answer Bubble (right side)
    if (question.userAnswer) {
      drawChatBubble(question.userAnswer, true, contentWidth, question.score);
      
      // AI Recommendation
      if (question.feedback) {
        drawRecommendation(question.feedback, contentWidth);
      }
    } else {
      // Unanswered question indicator
      yPosition += 5;
      
      pdf.setFillColor(254, 226, 226); // Light red background
      pdf.roundedRect(pageWidth - marginRight - (contentWidth * 0.5), yPosition, contentWidth * 0.5, 20, 2, 2, 'F');
      
      pdf.setTextColor(185, 28, 28); // Red text
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('❌ Question Skipped', pageWidth - marginRight - (contentWidth * 0.45), yPosition + 8);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(120, 53, 15);
      pdf.text('Score: 0/10', pageWidth - marginRight - (contentWidth * 0.45), yPosition + 15);
      
      yPosition += 25;
    }

    // Separator line
    checkPageBreak(5);
    pdf.setDrawColor(229, 231, 235);
    pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
    yPosition += 10;
  });

  // Footer on all pages
  const totalPages = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.setFont('helvetica', 'normal');
    
    // Left footer
    pdf.text('MockMate - AI Interview Practice', marginLeft, pageHeight - 10);
    
    // Center footer
    pdf.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    // Right footer
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - marginRight,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Save the PDF
  const filename = `mockmate-interview-${interview.jobTitle.replace(/\s+/g, '-').toLowerCase()}-${new Date(interview.createdAt).toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};

export const exportAnalyticsToPDF = async (
  interviews: Interview[],
  stats: {
    totalInterviews: number;
    completedInterviews: number;
    averageScore: number;
    totalQuestions: number;
  }
) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Performance Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Statistics
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Overall Statistics', 20, yPosition);
  yPosition += 10;

  const statsData = [
    ['Total Interviews', stats.totalInterviews.toString()],
    ['Completed Interviews', stats.completedInterviews.toString()],
    ['Average Score', `${stats.averageScore}/10`],
    ['Total Questions', stats.totalQuestions.toString()]
  ];

  autoTable(pdf, {
    startY: yPosition,
    head: [],
    body: statsData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 'auto' }
    }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 15;

  // Interview History Table
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Interview History', 20, yPosition);
  yPosition += 5;

  const historyData = interviews
    .filter(i => i.status === 'completed')
    .map(interview => [
      new Date(interview.createdAt).toLocaleDateString(),
      interview.jobTitle,
      interview.mode,
      interview.difficulty,
      `${interview.overallScore || 'N/A'}/10`
    ]);

  autoTable(pdf, {
    startY: yPosition,
    head: [['Date', 'Job Title', 'Mode', 'Level', 'Score']],
    body: historyData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 10 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 60 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 }
    }
  });

  // Save
  pdf.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
};
