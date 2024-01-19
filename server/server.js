require("dotenv").config();
const express = require("express");
const { OpenAI } = require("openai");
const cors = require("cors");
const axios = require("axios");
const app = express();
app.set('trust proxy', 1); 
const rateLimit = require("express-rate-limit");

const corsOptions = {
  origin: ["http://localhost:3000", "https://www.domainbuy.ing"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());


const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  max: 10, // limit each IP to 5 requests per windowMs
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

    
    console.log("OpenAI full response:", JSON.stringify(openaiResponse, null, 2));

    
    if (!openaiResponse || !openaiResponse.choices || !openaiResponse.choices[0]) {
      throw new Error('Unexpected response structure from OpenAI.');
    }

    
    const messageContent = openaiResponse.choices[0].message.content;

    if (!messageContent) {
      throw new Error('No content in the first choice of the response.');
    }

    const suggestions = messageContent
      .trim()
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    res.json({ suggestions });
  } catch (error) {
    console.error("Error fetching domain name suggestions: ", error);
    res.status(500).json({
      message: "Error fetching domain name suggestions",
      error: error.message
    });
  }
});

app.get("/checkDomainAvailability", async (req, res) => {
  let { domain } = req.query;

  
  domain = domain.replace(/^[0-9]+\.\s*/, '').trim();

 
  if (!/^[\w.-]+\.[\w]+$/.test(domain)) {
    return res.status(400).json({ message: "Invalid domain format" });
  }

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

   
    res.json(response.data);
  } catch (error) {
    console.error(`Error checking domain availability for ${domain}:`, error.response?.data || error.message);

    if (error.response) {
      res.status(error.response.status).json({
        message: "Error checking domain availability",
        error: error.response.data,
      });
    } else {
      res.status(500).json({
        message: "Error checking domain availability",
        error: error.message,
      });
    }
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
