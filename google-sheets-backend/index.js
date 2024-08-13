require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const credentials = {
    type: 'service_account',
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN
  };

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Initialize the JWT client using the service account credentials
const jwtClient = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
);

const drive = google.drive({ version: 'v3', auth: jwtClient });
const sheets = google.sheets({ version: 'v4', auth: jwtClient });

const supabaseUrl = 'LockIn/supabaseClient.js';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2YWpqaGpldXdxemdrdXp4bmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg5NjU2OTYsImV4cCI6MjAzNDU0MTY5Nn0.wYqQ4qrNL-cKPDnsIznBuCCnHwXljU-oNzd5wyXCo_U';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.post('/storeUser', async (req, res) => {
  const { idToken } = req.body;

  try {
    const { data, error } = await supabase.auth.api.getUser(idToken);
    if (error) {
      throw error;
    }

    // Store user data in Supabase
    const { id, email, ...userData } = data;
    const { error: dbError } = await supabase
      .from('users')
      .insert([{ id, email, ...userData }]);
    if (dbError) {
      throw dbError;
    }

    res.json({ message: 'User stored successfully' });
  } catch (error) {
    console.error('Error storing user:', error);
    res.status(500).json({ error: 'Error storing user' });
  }
});

app.post('/createSheet', async (req, res) => {
  try {
    // Authorize the client
    await jwtClient.authorize();

    // Create a new Google Sheet
    const response = await drive.files.create({
      requestBody: {
        name: 'LockInData',
        mimeType: 'application/vnd.google-apps.spreadsheet',
      },
    });

    const fileId = response.data.id;

    // Add data to the Google Sheet
    const { data } = req.body;  // Expecting an array of arrays from the client
    await sheets.spreadsheets.values.update({
      spreadsheetId: fileId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      resource: {
        values: [
          ['Week', 'Total Hours', 'Total Minutes', 'Avg Hours', 'Avg Minutes', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          ...data,  // Spread the data rows into the values array
        ],
      },
    });

    res.send(`Spreadsheet created: https://docs.google.com/spreadsheets/d/${fileId}`);
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    res.status(500).send('Error creating spreadsheet');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
