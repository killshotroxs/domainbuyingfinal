require("dotenv").config();
const express = require("express");
const { OpenAI } = require("openai");
const cors = require("cors");
const axios = require("axios");
const app = express();
app.set('trust proxy', 1); // Trust first proxy
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
  message: "Too many requests from this IP, please try again after 24Hours.",
});

app.use(limiter);

const openai = new OpenAI(process.env.OPENAI_API_KEY);

app.set('trust proxy', 1);

app.post("/generateDomainSuggestions", async (req, res) => {
  const { niche } = req.body;

  try {
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: `Generate short and relevant domain names for a website related to ${niche}. Only output 5 names, focus on names that convey ${niche} themes or concepts. Only output domain names and nothing else, make sure you don't repeat any result.`,
        },
      ],
    });

    // Log the full OpenAI response for debugging
    console.log("OpenAI Response:", JSON.stringify(openaiResponse.data, null, 2));

    // Extract choices array
    const choices = openaiResponse.data.choices;
    
    if (!choices || choices.length === 0) {
      throw new Error("No choices found in OpenAI response.");
    }

    // Extract suggestions from the response
    const suggestions = choices[0].message.content
      .trim()
      .split("\n")
      .map((s) => s.replace(/^\d+\.\s*/, ""));

    res.json({ suggestions });
  } catch (error) {
    console.error("Error fetching domain name suggestions: ", error);

    // Log full error details
    if (error.response) {
      console.error("Error response data:", error.response.data);
    } else {
      console.error("Non-response error:", error);
    }

    res.status(500).json({
      message: "Error fetching domain name suggestions",
      error: error.message,
      details: error.response ? error.response.data : error,
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
