const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

// Export the serverless function
module.exports = exports = async function handler(req, res) {
  // Prevent CORS errors if someone directly calls the API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, sessionId } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Attempt to read credentials from environment variables for Vercel
  const projectId = process.env.DIALOGFLOW_PROJECT_ID;
  const clientEmail = process.env.DIALOGFLOW_CLIENT_EMAIL;
  // Environment variables sometimes incorrectly handle newlines in private keys
  const privateKey = process.env.DIALOGFLOW_PRIVATE_KEY 
        ? process.env.DIALOGFLOW_PRIVATE_KEY.replace(/\\n/g, '\n') 
        : undefined;

  // Let's provide a clear error message to help the user configure it
  if (!projectId || !clientEmail || !privateKey) {
    return res.status(500).json({ 
      error: 'Missing Dialogflow credentials. Please configure DIALOGFLOW_PROJECT_ID, DIALOGFLOW_CLIENT_EMAIL, and DIALOGFLOW_PRIVATE_KEY in your Vercel Environment Variables.' 
    });
  }

  try {
    // Instantiate a Dialogflow client
    const sessionClient = new dialogflow.SessionsClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      projectId: projectId,
    });

    const currentSessionId = sessionId || uuid.v4();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, currentSessionId);

    // The text query request
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: 'en-US', // Make sure this matches your agent's default language
        },
      },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    res.status(200).json({
      reply: result.fulfillmentText,
      intent: result.intent ? result.intent.displayName : 'No intent matched',
      sessionId: currentSessionId,
    });
  } catch (error) {
    console.error('Dialogflow Error:', error);
    res.status(500).json({ error: 'Failed to communicate with Dialogflow: ' + error.message });
  }
};
