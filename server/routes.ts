import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmailSchema, insertAiResponseSchema } from "@shared/schema";
import { processEmail } from "./services/emailProcessor";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all emails
  app.get("/api/emails", async (req, res) => {
    try {
      const emails = await storage.getEmails();
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Get specific email with AI response
  app.get("/api/emails/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const email = await storage.getEmailById(id);
      
      if (!email) {
        return res.status(404).json({ error: "Email not found" });
      }

      const aiResponse = await storage.getResponseByEmailId(id);
      res.json({ email, aiResponse });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Create new email
  app.post("/api/emails", async (req, res) => {
    try {
      const validatedData = insertEmailSchema.parse(req.body);
      const processedEmail = await processEmail(validatedData);
      const email = await storage.createEmail(processedEmail);
      
      // Create AI response if generated
      if (processedEmail.aiResponse) {
        await storage.createAiResponse({
          ...processedEmail.aiResponse,
          emailId: email.id
        });
      }
      
      res.status(201).json(email);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Update email status
  app.patch("/api/emails/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['pending', 'processing', 'resolved'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      await storage.updateEmailStatus(id, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Get AI response for email
  app.get("/api/emails/:id/response", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await storage.getResponseByEmailId(id);
      
      if (!response) {
        return res.status(404).json({ error: "AI response not found" });
      }
      
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Update AI response
  app.patch("/api/responses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      await storage.updateAiResponse(id, updates);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Mark AI response as sent
  app.post("/api/responses/:id/send", async (req, res) => {
    try {
      const { id } = req.params;
      
      await storage.updateAiResponse(id, {
        status: 'sent',
        sentAt: new Date()
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Get analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Refresh emails (trigger sample data reload)
  app.post("/api/emails/refresh", async (req, res) => {
    try {
      await storage.seedSampleData();
      const emails = await storage.getEmails();
      res.json({ success: true, count: emails.length });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
