import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const emails = pgTable("emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sender: text("sender").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  sentDate: timestamp("sent_date").notNull(),
  receivedDate: timestamp("received_date").defaultNow().notNull(),
  sentiment: text("sentiment", { enum: ["positive", "negative", "neutral"] }),
  priority: text("priority", { enum: ["urgent", "normal", "low"] }),
  category: text("category"),
  status: text("status", { enum: ["pending", "processing", "resolved"] }).default("pending"),
  extractedInfo: jsonb("extracted_info"),
  keywords: text("keywords").array(),
});

export const aiResponses = pgTable("ai_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  emailId: varchar("email_id").references(() => emails.id).notNull(),
  content: text("content").notNull(),
  qualityScore: integer("quality_score"),
  status: text("status", { enum: ["draft", "sent", "edited"] }).default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").defaultNow().notNull(),
  totalEmails: integer("total_emails").default(0),
  urgentEmails: integer("urgent_emails").default(0),
  resolvedEmails: integer("resolved_emails").default(0),
  avgResponseTime: integer("avg_response_time").default(0), // in minutes
  sentimentStats: jsonb("sentiment_stats"),
  categoryStats: jsonb("category_stats"),
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  receivedDate: true,
});

export const insertAiResponseSchema = createInsertSchema(aiResponses).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  date: true,
});

export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Email = typeof emails.$inferSelect;
export type InsertAiResponse = z.infer<typeof insertAiResponseSchema>;
export type AiResponse = typeof aiResponses.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
