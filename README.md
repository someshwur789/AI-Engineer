<h1 style="font-size:90px;">AIChatGuide</h1>

AIChatGuide is an AI-powered email and support analytics assistant built using Node.js, TypeScript, Express, and Supabase. It categorizes emails, performs sentiment and priority analysis, extracts information, and provides AI-generated responses.

---

<h3 style="font-size:20px;">Features</h3>

- Categorizes incoming support emails
- Sentiment analysis (positive, negative, neutral)
- Priority analysis for urgent emails
- Extracts key information from emails
- AI-generated responses using OpenAI API
- Stores data in Supabase database

---

<h3 style="font-size:20px;">Technologies</h3>

- Node.js
- TypeScript
- Express.js
- Supabase (PostgreSQL)
- OpenAI API
- CSV parsing for sample email data

---

<h3 style="font-size:20px;">SetUp Instructions</h3>

1. Clone the repository
```bash
git clone https://github.com/someshwur789/AIChatGuide.git
cd AIChatGuide
```

2. Install dependencies
```
npm install
```

3. Configure environment variables
- Create an account in supabase
- Create a .env file in the root folder:
```
NODE_ENV=development
DATABASE_URL=<your-supabase-url>
OPENAI_API_KEY=<your-openai-api-key>
```

4. Run the development server
```
npm run dev
```
The API will be served at: http://127.0.0.1:5000

<h2 style="font-size:20px;">NOTE:</h2>
  The project uses sample email data in **attached_assets/Sample_Support_Emails_Dataset.csv**. Make sure the file exists if you want to load sample emails.
  
<h3 style="font-size:20px;">Here the Sample Results of the Project</h3>

<img width="1919" height="1078" alt="Screenshot 2025-09-05 231801" src="https://github.com/user-attachments/assets/0710240e-7594-49cd-a103-86eae2f32697" />


<img width="1919" height="1077" alt="Screenshot 2025-09-05 231850" src="https://github.com/user-attachments/assets/d6d1c839-f1a4-419b-b253-5e14b23d2005" />


