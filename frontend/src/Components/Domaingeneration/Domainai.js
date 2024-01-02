import "../Domaingeneration/Domainai.css";
import React, { useState } from "react";
import axios from "axios";
import Confetti from "react-confetti";

const DomainGenerator = () => {
  const [domainSuggestions, setDomainSuggestions] = useState([]);
  const [availabilityResults, setAvailabilityResults] = useState([]);
  const [formattedPrices, setFormattedPrices] = useState({});
  const [niche, setNiche] = useState("");
  const [isConfettiActive, setConfettiActive] = useState(false);

  const generateDomains = async () => {
    try {
      const openaiResponse = await axios.post(
        "https://domainbuyingserver.vercel.app/generateDomainSuggestions",
        { niche }
      );

      if (openaiResponse.status === 429) {
        const rateLimitMessage = openaiResponse.data.message;
        alert(rateLimitMessage);
        return; // Stop execution if rate limit is exceeded
      }

      const suggestions = openaiResponse.data.suggestions;

      setDomainSuggestions(suggestions);
      setAvailabilityResults([]);

      const availabilityPromises = suggestions[0].map(async (domain) => {
        try {
          const availabilityResponse = await axios.get(
            `https://domainbuyingserver.vercel.app/checkDomainAvailability?domain=${domain}`
          );

          if (availabilityResponse.status === 429) {
            const rateLimitMessage = availabilityResponse.data.message;
            alert(rateLimitMessage);
            return {
              domain,
              available: false,
              price: null,
            };
          }

          const available = availabilityResponse.data.available;
          let price = null;

          if (available && availabilityResponse.data.price) {
            price = (availabilityResponse.data.price / 1000000).toFixed(2);
          }

          return {
            domain,
            available,
            price,
          };
        } catch (error) {
          console.error("Error checking domain availability: ", error);
          return {
            domain,
            available: false,
            price: null,
          };
        }
      });

      const availabilityResults = await Promise.all(availabilityPromises);
      setAvailabilityResults(availabilityResults);

      const prices = {};
      availabilityResults.forEach((result) => {
        if (result.available && result.price) {
          prices[result.domain] = `$${result.price} USD`;
        }
      });
      setFormattedPrices(prices);

      setConfettiActive(true);

      setTimeout(() => {
        setConfettiActive(false);
      }, 3500);
    } catch (error) {
      console.error("Error fetching domain name suggestions: ", error);
    }
  };

  return (
    <div>
      <div className="search">
        <input
          type="text"
          placeholder="Enter your niche..."
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
        />
        <button onClick={generateDomains}>Generate Domain Names</button>
      </div>

      {isConfettiActive && <Confetti />}

      <div className="domain-list">
        {domainSuggestions.map((domains, index) => (
          <div key={index} className="domain-box">
            {domains.map((domain, subIndex) => (
              <div key={subIndex} className="domain-item">
                {domain}
                {availabilityResults.length > subIndex && (
                  <div
                    className={`availability-result ${
                      availabilityResults[subIndex].available
                        ? "available"
                        : "not-available"
                    }`}
                  >
                    {availabilityResults[subIndex].available
                      ? `Available - ${formattedPrices[domain] || ""}`
                      : "Not Available"}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DomainGenerator;
