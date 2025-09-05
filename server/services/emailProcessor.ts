import { 
  analyzeSentiment, 
  analyzePriority, 
  categorizeEmail, 
  extractInformation, 
  generateResponse 
} from './openai';
import type { InsertEmail, InsertAiResponse } from '@shared/schema';

export interface ProcessedEmail extends InsertEmail {
  aiResponse?: Omit<InsertAiResponse, 'emailId'>;
}

export async function processEmail(email: InsertEmail): Promise<ProcessedEmail> {
  try {
    // Run AI analysis in parallel for efficiency
    const [sentimentResult, priorityResult, categoryResult, extractedInfo] = await Promise.all([
      analyzeSentiment(email.body),
      analyzePriority(email.subject, email.body),
      categorizeEmail(email.subject, email.body),
      extractInformation(email.body)
    ]);

    // Generate AI response
    const responseResult = await generateResponse(
      email.subject,
      email.body,
      email.sender,
      sentimentResult.sentiment,
      priorityResult.priority,
      categoryResult.category,
      extractedInfo
    );

    // Prepare processed email data
    const processedEmail: ProcessedEmail = {
      ...email,
      sentiment: sentimentResult.sentiment,
      priority: priorityResult.priority,
      category: categoryResult.category,
      status: priorityResult.priority === 'urgent' ? 'processing' : 'pending',
      extractedInfo: {
        ...extractedInfo,
        sentimentAnalysis: sentimentResult,
        priorityAnalysis: priorityResult,
        categoryAnalysis: categoryResult
      },
      keywords: [
        ...priorityResult.urgencyKeywords,
        categoryResult.category.toLowerCase(),
        sentimentResult.sentiment
      ],
      aiResponse: {
        content: responseResult.content,
        qualityScore: responseResult.qualityScore,
        status: 'draft'
      }
    };

    return processedEmail;
  } catch (error) {
    console.error('Error processing email:', error);
    throw new Error(`Failed to process email: ${(error as Error).message}`);
  }
}

export function filterSupportEmails(emails: any[]): any[] {
  const supportKeywords = ['support', 'query', 'request', 'help'];
  
  return emails.filter(email => {
    const subject = email.subject?.toLowerCase() || '';
    return supportKeywords.some(keyword => subject.includes(keyword));
  });
}

export function sortEmailsByPriority(emails: any[]): any[] {
  const priorityOrder = { urgent: 0, normal: 1, low: 2 };
  
  return emails.sort((a, b) => {
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 1;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 1;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // If same priority, sort by received date (newest first)
    return new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime();
  });
}
