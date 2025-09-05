import { type Email, type AiResponse, type Analytics, type InsertEmail, type InsertAiResponse } from "@shared/schema";
import { randomUUID } from "crypto";
import { processEmail, filterSupportEmails, sortEmailsByPriority } from "./services/emailProcessor";
import { loadSampleData } from "./seedData";

export interface IStorage {
  // Email operations
  getEmails(): Promise<Email[]>;
  getEmailById(id: string): Promise<Email | undefined>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmailStatus(id: string, status: string): Promise<void>;
  
  // AI Response operations
  getResponseByEmailId(emailId: string): Promise<AiResponse | undefined>;
  createAiResponse(response: InsertAiResponse): Promise<AiResponse>;
  updateAiResponse(id: string, updates: Partial<AiResponse>): Promise<void>;
  
  // Analytics operations
  getAnalytics(): Promise<Analytics>;
  updateAnalytics(data: Partial<Analytics>): Promise<void>;
  
  // Bulk operations
  processBulkEmails(emails: InsertEmail[]): Promise<void>;
  seedSampleData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private emails: Map<string, Email>;
  private aiResponses: Map<string, AiResponse>;
  private analytics: Analytics;
  private isSeeded: boolean = false;

  constructor() {
    this.emails = new Map();
    this.aiResponses = new Map();
    this.analytics = {
      id: randomUUID(),
      date: new Date(),
      totalEmails: 0,
      urgentEmails: 0,
      resolvedEmails: 0,
      avgResponseTime: 0,
      sentimentStats: { positive: 0, negative: 0, neutral: 0 },
      categoryStats: {}
    };
  }

  async getEmails(): Promise<Email[]> {
    if (!this.isSeeded) {
      await this.seedSampleData();
    }
    
    const emailList = Array.from(this.emails.values());
    const supportEmails = filterSupportEmails(emailList);
    return sortEmailsByPriority(supportEmails);
  }

  async getEmailById(id: string): Promise<Email | undefined> {
    return this.emails.get(id);
  }

  async createEmail(insertEmail: InsertEmail): Promise<Email> {
    const id = randomUUID();
    const email: Email = {
      ...insertEmail,
      id,
      receivedDate: new Date(),
      status: 'pending',
      sentiment: insertEmail.sentiment || null,
      priority: insertEmail.priority || null,
      category: insertEmail.category || null,
      extractedInfo: insertEmail.extractedInfo || null,
      keywords: insertEmail.keywords || null
    };
    
    this.emails.set(id, email);
    await this.updateEmailStats();
    return email;
  }

  async updateEmailStatus(id: string, status: string): Promise<void> {
    const email = this.emails.get(id);
    if (email) {
      email.status = status as any;
      this.emails.set(id, email);
      await this.updateEmailStats();
    }
  }

  async getResponseByEmailId(emailId: string): Promise<AiResponse | undefined> {
    return Array.from(this.aiResponses.values()).find(response => response.emailId === emailId);
  }

  async createAiResponse(insertResponse: InsertAiResponse): Promise<AiResponse> {
    const id = randomUUID();
    const response: AiResponse = {
      ...insertResponse,
      id,
      createdAt: new Date(),
      sentAt: null,
      status: insertResponse.status || 'draft',
      qualityScore: insertResponse.qualityScore || null
    };
    
    this.aiResponses.set(id, response);
    return response;
  }

  async updateAiResponse(id: string, updates: Partial<AiResponse>): Promise<void> {
    const response = this.aiResponses.get(id);
    if (response) {
      Object.assign(response, updates);
      this.aiResponses.set(id, response);
    }
  }

  async getAnalytics(): Promise<Analytics> {
    await this.updateEmailStats();
    return this.analytics;
  }

  async updateAnalytics(data: Partial<Analytics>): Promise<void> {
    Object.assign(this.analytics, data);
  }

  async processBulkEmails(emails: InsertEmail[]): Promise<void> {
    for (const emailData of emails) {
      try {
        const processedEmail = await processEmail(emailData);
        const email = await this.createEmail(processedEmail);
        
        if (processedEmail.aiResponse) {
          await this.createAiResponse({
            ...processedEmail.aiResponse,
            emailId: email.id
          });
        }
      } catch (error) {
        console.error('Error processing email:', error);
      }
    }
  }

  async seedSampleData(): Promise<void> {
    if (this.isSeeded) return;
    
    try {
      const sampleEmails = loadSampleData();
      console.log(`Loading ${sampleEmails.length} sample emails...`);
      
      await this.processBulkEmails(sampleEmails);
      this.isSeeded = true;
      
      console.log('Sample data loaded successfully');
    } catch (error) {
      console.error('Error seeding sample data:', error);
      this.isSeeded = true; // Mark as seeded to prevent repeated attempts
    }
  }

  private async updateEmailStats(): Promise<void> {
    const emails = Array.from(this.emails.values());
    const supportEmails = filterSupportEmails(emails);
    
    const totalEmails = supportEmails.length;
    const urgentEmails = supportEmails.filter(e => e.priority === 'urgent').length;
    const resolvedEmails = supportEmails.filter(e => e.status === 'resolved').length;
    
    // Calculate sentiment stats
    const sentimentStats = supportEmails.reduce((stats, email) => {
      if (email.sentiment) {
        stats[email.sentiment] = (stats[email.sentiment] || 0) + 1;
      }
      return stats;
    }, { positive: 0, negative: 0, neutral: 0 });

    // Calculate category stats
    const categoryStats = supportEmails.reduce((stats, email) => {
      if (email.category) {
        stats[email.category] = (stats[email.category] || 0) + 1;
      }
      return stats;
    }, {});

    this.analytics = {
      ...this.analytics,
      totalEmails,
      urgentEmails,
      resolvedEmails,
      avgResponseTime: Math.floor(Math.random() * 180) + 60, // Mock response time
      sentimentStats,
      categoryStats
    };
  }
}

export const storage = new MemStorage();
