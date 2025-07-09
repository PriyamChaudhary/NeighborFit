// server.js
// Express server for NeighborFit app. Serves API endpoint to match neighborhoods based on user preferences.
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies

// Load neighborhood data from src/data/nearby.json
const dataPath = path.join(__dirname, '..', 'src', 'data', 'nearby.json');
console.log('Attempting to load:', dataPath);
let neighborhoods = [];
try {
  neighborhoods = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Loaded ${neighborhoods.length} neighborhoods`);
} catch (e) {
  console.error('Failed to load nearby.json:', e);
}

// Matching algorithm: calculates similarity score using Euclidean distance for each factor
// Handles missing/null values and normalizes rent for fair comparison
function matchNeighborhoods(userPrefs, neighborhoods) {
  return neighborhoods
    .map(n => {
      let score = 0;
      let factors = 0;

      // Compare transport preference
      if (userPrefs.transport != null && n.transport != null) {
        score += Math.pow(Number(n.transport) - Number(userPrefs.transport), 2);
        factors++;
      }
      // Compare safety preference
      if (userPrefs.safety != null && n.safety != null) {
        score += Math.pow(Number(n.safety) - Number(userPrefs.safety), 2);
        factors++;
      }
      // Compare noise preference
      if (userPrefs.noise != null && n.noise != null) {
        score += Math.pow(Number(n.noise) - Number(userPrefs.noise), 2);
        factors++;
      }
      // Compare air quality preference
      if (userPrefs.airQuality != null && n.airQuality != null) {
        score += Math.pow(Number(n.airQuality) - Number(userPrefs.airQuality), 2);
        factors++;
      }
      // Compare rent if provided
      if (
        userPrefs.rent != null &&
        userPrefs.rent !== "" &&
        n.rent != null
      ) {
        // Normalize rent for fair comparison
        const maxRent = 20000;
        const normalizedUserRent = Number(userPrefs.rent) / maxRent;
        const normalizedLocationRent = Number(n.rent) / maxRent;
        score += Math.pow(normalizedLocationRent - normalizedUserRent, 2);
        factors++;
      }

      // If no factors matched, set a high score so it sorts last
      const finalScore = factors > 0 ? Math.sqrt(score / factors) : 999;
      return { ...n, score: finalScore };
    })
    .filter(n => n.score < 999) // Exclude neighborhoods with no matching factors
    .sort((a, b) => a.score - b.score) // Sort by best match
    .slice(0, 5); // Return top 5 matches
}

// API endpoint to get best neighborhood matches
app.post('/api/match', (req, res) => {
  const userPrefs = req.body;
  const matches = matchNeighborhoods(userPrefs, neighborhoods);
  res.json(matches);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});