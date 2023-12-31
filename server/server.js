require("dotenv").config();
const express = require("express");
const { OpenAI } = require("openai");
const cors = require("cors");
const axios = require('axios');
const app = express();
const rateLimit = require("express-rate-limit");

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin === "https://www.domainbuy.ing") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again after 24Hours.',
});

app.use(limiter);

const openai = new OpenAI(process.env.OPENAI_API_KEY);

app.post("/generateDomainSuggestions", async (req, res) => {
  const { niche } = req.body;

  try {
    const openaiResponse = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      prompt: `Generate short and relevant domain names for a website related to ${niche}. Only output 5 names, focus on names that convey ${niche} themes or concepts. Only output domain names and nothing else, make sure you don't repeat any result.`,
      max_tokens: 60 // Adjust as needed
    });

    // Extract suggestions from the response
    let suggestions = openaiResponse.data.choices[0].text.trim().split("\n");
    suggestions = suggestions.filter(s => s); // Remove empty lines if there are any

    // Send the suggestions to the client
    res.json({ suggestions });
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
    console.log(
      `Error checking domain availability for ${domain}:`,
      error.message
    );
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

    console.log(
      `Pricing response from GoDaddy API for ${domain}:`,
      response.data
    );

    res.json(response.data);
  } catch (error) {
    console.log(`Error getting domain pricing for ${domain}:`, error.message);
    res.status(500).json({
      message: "Error getting domain pricing",
      error: error.message,
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});