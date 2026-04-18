# HostelLogic Web App

This is the web application for the HostelLogic AI Dialogflow chatbot. It features a beautiful light-themed UI and is pre-configured to be deployed for free on [Vercel](https://vercel.com/).

## How to Deploy to Vercel

1. **Upload to GitHub**: Create a new GitHub repository and push this `webapp` folder to it.
2. **Import to Vercel**: 
   - Go to [Vercel](https://vercel.com/) and create a new project.
   - Import your GitHub repository.
3. **Configure Environment Variables**:
   Under the "Environment Variables" section in Vercel, you must add the following variables using the details from your `hostellogic-ai-eucg-4b1385c1582b.json` file:
   - `DIALOGFLOW_PROJECT_ID`: Set this to `hostellogic-ai-eucg`
   - `DIALOGFLOW_CLIENT_EMAIL`: Set this to `hostelbot@hostellogic-ai-eucg.iam.gserviceaccount.com`
   - `DIALOGFLOW_PRIVATE_KEY`: Copy the **entire** `"private_key"` string from your JSON file (including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` and all `\n` characters).
4. **Deploy**: Click Deploy! Vercel will automatically host the static files (`index.html`, `chat.html`, etc.) and set up the `api/chat.js` file as a Serverless Function.

## Local Testing
Since the webapp relies on Node.js to connect to Dialogflow securely without exposing your Private Key, you'll need Node installed to test the API locally (`npm install` then use Vercel CLI `vercel dev`). For quick tests, just push to Vercel!
