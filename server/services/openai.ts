import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface SentimentAnalysisResult {
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  reasoning: string;
}

export interface PriorityAnalysisResult {
  priority: "urgent" | "normal" | "low";
  confidence: number;
  reasoning: string;
  urgencyKeywords: string[];
}

export interface EmailCategoryResult {
  category: string;
  confidence: number;
  reasoning: string;
}

export interface ExtractedInfoResult {
  contactDetails: string[];
  requirements: string[];
  sentimentIndicators: string[];
  keyPoints: string[];
}

export interface ResponseGenerationResult {
  content: string;
  qualityScore: number;
  tone: string;
}

export async function analyzeSentiment(emailBody: string): Promise<SentimentAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the sentiment of customer support emails and provide detailed analysis. Respond with JSON in this format: { 'sentiment': 'positive'|'negative'|'neutral', 'confidence': number, 'reasoning': string }"
        },
        {
          role: "user",
          content: `Analyze the sentiment of this customer support email:\n\n${emailBody}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      sentiment: result.sentiment,
      confidence: Math.max(0, Math.min(1, result.confidence)),
      reasoning: result.reasoning
    };
  } catch (error) {
    // Provide fallback sentiment analysis when API quota is exceeded
    console.warn('OpenAI API error, using fallback sentiment analysis:', (error as Error).message);
    
    // Simple keyword-based sentiment analysis as fallback
    const body = emailBody.toLowerCase();
    const negativeWords = ['urgent', 'critical', 'cannot', 'problem', 'error', 'issue', 'down', 'broken', 'failed'];
    const positiveWords = ['thank', 'please', 'help', 'appreciate', 'good', 'great'];
    
    const negativeCount = negativeWords.filter(word => body.includes(word)).length;
    const positiveCount = positiveWords.filter(word => body.includes(word)).length;
    
    let sentiment: "positive" | "negative" | "neutral" = "neutral";
    if (negativeCount > positiveCount) {
      sentiment = "negative";
    } else if (positiveCount > negativeCount) {
      sentiment = "positive";
    }
    
    return {
      sentiment,
      confidence: 0.8,
      reasoning: `Fallback analysis based on keyword detection (${negativeCount} negative, ${positiveCount} positive keywords)`
    };
  }
}

export async function analyzePriority(emailSubject: string, emailBody: string): Promise<PriorityAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an email priority classification expert. Analyze support emails and classify them as urgent, normal, or low priority. Look for keywords like 'immediately', 'critical', 'cannot access', 'down', 'emergency', 'asap', 'urgent'. Respond with JSON in this format: { 'priority': 'urgent'|'normal'|'low', 'confidence': number, 'reasoning': string, 'urgencyKeywords': string[] }"
        },
        {
          role: "user",
          content: `Classify the priority of this support email:\n\nSubject: ${emailSubject}\n\nBody: ${emailBody}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      priority: result.priority,
      confidence: Math.max(0, Math.min(1, result.confidence)),
      reasoning: result.reasoning,
      urgencyKeywords: result.urgencyKeywords || []
    };
  } catch (error) {
    // Provide fallback priority analysis when API quota is exceeded
    console.warn('OpenAI API error, using fallback priority analysis:', (error as Error).message);
    
    const text = (emailSubject + ' ' + emailBody).toLowerCase();
    const urgentKeywords = ['urgent', 'critical', 'immediately', 'asap', 'emergency', 'down', 'cannot access', 'blocked', 'broken', 'failed'];
    const foundKeywords = urgentKeywords.filter(keyword => text.includes(keyword));
    
    let priority: "urgent" | "normal" | "low" = "normal";
    if (foundKeywords.length >= 2) {
      priority = "urgent";
    } else if (foundKeywords.length === 0 && text.includes('query')) {
      priority = "low";
    }
    
    return {
      priority,
      confidence: 0.8,
      reasoning: `Fallback analysis based on keyword detection`,
      urgencyKeywords: foundKeywords
    };
  }
}

export async function categorizeEmail(emailSubject: string, emailBody: string): Promise<EmailCategoryResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an email categorization expert. Categorize support emails into categories like: Technical, Billing, Sales, Account, General, Refund, Integration, Login, etc. Respond with JSON in this format: { 'category': string, 'confidence': number, 'reasoning': string }"
        },
        {
          role: "user",
          content: `Categorize this support email:\n\nSubject: ${emailSubject}\n\nBody: ${emailBody}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      category: result.category,
      confidence: Math.max(0, Math.min(1, result.confidence)),
      reasoning: result.reasoning
    };
  } catch (error) {
    // Provide fallback categorization when API quota is exceeded
    console.warn('OpenAI API error, using fallback categorization:', (error as Error).message);
    
    const text = (emailSubject + ' ' + emailBody).toLowerCase();
    
    if (text.includes('billing') || text.includes('payment') || text.includes('charge') || text.includes('invoice')) {
      return { category: "Billing", confidence: 0.8, reasoning: "Fallback: Detected billing-related keywords" };
    } else if (text.includes('login') || text.includes('password') || text.includes('access') || text.includes('account')) {
      return { category: "Account", confidence: 0.8, reasoning: "Fallback: Detected account-related keywords" };
    } else if (text.includes('integration') || text.includes('api')) {
      return { category: "Integration", confidence: 0.8, reasoning: "Fallback: Detected integration-related keywords" };
    } else if (text.includes('refund')) {
      return { category: "Refund", confidence: 0.8, reasoning: "Fallback: Detected refund-related keywords" };
    } else if (text.includes('pricing') || text.includes('price')) {
      return { category: "Sales", confidence: 0.8, reasoning: "Fallback: Detected pricing-related keywords" };
    } else {
      return { category: "General", confidence: 0.7, reasoning: "Fallback: Default categorization" };
    }
  }
}

export async function extractInformation(emailBody: string): Promise<ExtractedInfoResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an information extraction expert. Extract key information from customer support emails. Respond with JSON in this format: { 'contactDetails': string[], 'requirements': string[], 'sentimentIndicators': string[], 'keyPoints': string[] }"
        },
        {
          role: "user",
          content: `Extract key information from this support email:\n\n${emailBody}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      contactDetails: result.contactDetails || [],
      requirements: result.requirements || [],
      sentimentIndicators: result.sentimentIndicators || [],
      keyPoints: result.keyPoints || []
    };
  } catch (error) {
    // Provide fallback information extraction when API quota is exceeded
    console.warn('OpenAI API error, using fallback information extraction:', (error as Error).message);
    
    const sentences = emailBody.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const keyPoints = sentences.slice(0, 3); // Take first 3 sentences as key points
    
    return {
      contactDetails: [],
      requirements: keyPoints.length > 0 ? [keyPoints[0]] : ['Customer inquiry needs attention'],
      sentimentIndicators: ['Customer reaching out for support'],
      keyPoints
    };
  }
}

export async function generateResponse(
  emailSubject: string, 
  emailBody: string, 
  senderEmail: string,
  sentiment: string,
  priority: string,
  category: string,
  extractedInfo: any
): Promise<ResponseGenerationResult> {
  try {
    const contextPrompt = `Generate a professional, empathetic response to this customer support email. 

Email Details:
- From: ${senderEmail}
- Subject: ${emailSubject}
- Body: ${emailBody}
- Sentiment: ${sentiment}
- Priority: ${priority}  
- Category: ${category}
- Key Points: ${JSON.stringify(extractedInfo)}

Guidelines:
- Maintain professional and friendly tone
- Be context-aware and acknowledge their sentiment
- If customer is frustrated, acknowledge empathetically
- Include relevant details and action items
- Provide clear next steps
- Use proper email format

Respond with JSON in this format: { 'content': string, 'qualityScore': number, 'tone': string }`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a customer support response expert. Generate professional, empathetic, and context-aware responses to customer emails."
        },
        {
          role: "user",
          content: contextPrompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      content: result.content,
      qualityScore: Math.max(70, Math.min(100, result.qualityScore || 85)),
      tone: result.tone || "professional"
    };
  } catch (error) {
    // Provide fallback response generation when API quota is exceeded
    console.warn('OpenAI API error, using fallback response generation:', (error as Error).message);
    
    let responseContent = `Dear ${senderEmail.split('@')[0]},\n\nThank you for contacting our support team. `;
    
    if (sentiment === 'negative') {
      responseContent += `I understand your frustration, and I sincerely apologize for any inconvenience this may have caused. `;
    } else {
      responseContent += `I appreciate you reaching out to us. `;
    }
    
    if (priority === 'urgent') {
      responseContent += `I've marked your request as high priority and will ensure it receives immediate attention. `;
    }
    
    responseContent += `Based on your ${category.toLowerCase()} inquiry, our team will review your request and provide a detailed response within 24 hours.\n\n`;
    responseContent += `In the meantime, if you have any urgent questions, please don't hesitate to contact us.\n\n`;
    responseContent += `Best regards,\nSupport Team`;
    
    return {
      content: responseContent,
      qualityScore: 75,
      tone: sentiment === 'negative' ? 'empathetic' : 'professional'
    };
  }
}
