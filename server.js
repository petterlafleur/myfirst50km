// Load required packages
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Initialize Express app
const app = express();
app.use(cors());

// Load environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// Function to refresh Strava access token
async function refreshAccessToken() {
  try {
    const response = await axios.post('https://www.strava.com/oauth/token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: REFRESH_TOKEN
      }
    });

    console.log("✅ Token refreshed!");
    return response.data.access_token;
  } catch (err) {
    console.error("❌ Failed to refresh token:", err.response?.data || err.message);
    throw err;
  }
}

// Endpoint to get Strava activities
app.get('/activities', async (req, res) => {
  try {
    const accessToken = await refreshAccessToken();

    const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error("❌ Error fetching activities:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
