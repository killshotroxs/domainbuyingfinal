require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    // Just accept all origins during development
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ... (previous code)

app.post("/generateDomainSuggestions", async (req, res) => {
  const { niche } = req.body;

  try {
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003",
        prompt: `Generate short and relevant domain names for a website related to ${niche}. Only output 5 names, Focus on names that convey ${niche} themes or concepts. Only output domain names and nothing else, make sure you don't repeat any result.`,
        max_tokens: 100,
        temperature: 0.2,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
        n: 1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const suggestions = openaiResponse.data.choices.map((choice) =>
      choice.text
        .trim()
        .split("\n")
        .map((s) => s.replace(/^\d+\.\s*/, ""))
    );

    // Send the suggestions to the client
    res.json({
      suggestions,
    });

  } catch (error) {
    console.error("Error fetching domain name suggestions: ", error);
    res.status(500).json({
      message: "Error fetching domain name suggestions",
      error: error.message,
    });
  }
});

app.get("/checkDomainAvailability", async (req, res) => {
  const { domain } = req.query;
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  const url = `https://api.godaddy.com/v1/domains/available?domain=${domain}`;

  console.log(`Checking domain availability for: ${domain}`);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `sso-key ${apiKey}:${apiSecret}`,
      },
    });

    console.log(`Response from GoDaddy API for ${domain}:`, response.data);

    res.json(response.data);
  } catch (error) {
    console.log(`Error checking domain availability for ${domain}:`, error.message);
    res.status(500).json({
      message: "Error checking domain availability",
      error: error.message,
    });
  }
});

app.post("/getDomainPricing", async (req, res) => {
  const { domain } = req.body;
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  const url = `https://api.godaddy.com/v1/pricing/domains/${domain}`;

  console.log(`Getting domain pricing for: ${domain}`);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `sso-key ${apiKey}:${apiSecret}`,
      },
    });

    console.log(`Pricing response from GoDaddy API for ${domain}:`, response.data);

    res.json(response.data);
  } catch (error) {
    console.log(`Error getting domain pricing for ${domain}:`, error.message);
    res.status(500).json({
      message: "Error getting domain pricing",
      error: error.message,
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
