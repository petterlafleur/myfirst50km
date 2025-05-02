// Load required packages
require('dotenv').config(); // Only needed locally; safe if left here
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

// Variables to hold token and refresh status
let accessToken = null;
let lastRefresh = null;

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

    accessToken = response.data.access_token;
    lastRefresh = Date.now();
    console.log("✅ Token refreshed!");
  } catch (err) {
    console.error("❌ Failed to refresh token:", err.response?.data || err.message);
  }
}

// Immediately refresh token when server starts
refreshAccessToken();
// Then refresh it automatically every 50 minutes
setInterval(refreshAccessToken, 1000 * 60 * 50);

// Endpoint to get Strava activities
app.get('/activities', async (req, res) => {
  if (!accessToken) {
    return res.status(401).json({ error: "Access token not available" });
  }

  try {
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
