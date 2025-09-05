import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadSampleData(): any[] {
  try {
    const csvPath = path.join(__dirname, '..', 'attached_assets', 'Sample_Support_Emails_Dataset_1757085828894.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',');
      const email: any = {};
      
      headers.forEach((header, index) => {
        email[header.trim()] = values[index]?.trim() || '';
      });
      
      // Convert sent_date to proper format
      if (email.sent_date) {
        const [datePart, timePart] = email.sent_date.split(' ');
        const [day, month, year] = datePart.split('-');
        email.sentDate = new Date(`${year}-${month}-${day}T${timePart}:00.000Z`);
      }
      
      return {
        sender: email.sender,
        subject: email.subject,
        body: email.body,
        sentDate: email.sentDate || new Date()
      };
    });
  } catch (error) {
    console.error('Error loading sample data:', error);
    return [];
  }
}
