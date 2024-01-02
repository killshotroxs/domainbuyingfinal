import "../Domaingeneration/Domainai.css";
import React, { useState } from "react";
import axios from "axios";
import Confetti from "react-confetti"; // can remove after production

const DomainGenerator = () => {
  const [domainSuggestions, setDomainSuggestions] = useState([]);
  const [availabilityResults, setAvailabilityResults] = useState([]);
  const [formattedPrices, setFormattedPrices] = useState({});
  const [niche, setNiche] = useState("");
  const [isConfettiActive, setConfettiActive] = useState(false);

  const generateDomains = async () => {
    try {
      // calling endpoint to fetch domains
      const openaiResponse = await axios.post(
        "https://domainbuyingserver.vercel.app/generateDomainSuggestions",
        { niche }
      );

      fetch("https://domainbuyingserver.vercel.app/generateDomainSuggestions")
        .then((response) => {
          if (response.status === 429) {
            return response.json(); // Extract the custom message from the response body
          }
          return response.json(); // Continue processing for other status codes
        })
        .then((data) => {
          if (data && data.message) {
            alert(data.message); // Display the custom message to the user
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      const suggestions = openaiResponse.data.suggestions;

      setDomainSuggestions(suggestions);
      setAvailabilityResults([]);

      // Fetch individual availability
      const availabilityPromises = suggestions[0].map(async (domain) => {
        try {
          const availabilityResponse = await axios.get(
            `https://domainbuyingserver.vercel.app/checkDomainAvailability?domain=${domain}`
          );

          const available = availabilityResponse.data.available;
          let price = null;

          // If the domain is available, format the price to two decimals.... it gives currently in micro prices
          if (available && availabilityResponse.data.price) {
            price = (availabilityResponse.data.price / 1000000).toFixed(2); // Price format adjustment
          }

          return {
            // Update the object to include the price
            domain,
            available,
            price,
          };
        } catch (error) {
          console.error("Error checking domain availability: ", error);
          return {
            // Update the object to include possible price data (mostly null)
            domain,
            available: false,
            price: null,
          };
        }
      });

      const availabilityResults = await Promise.all(availabilityPromises);
      setAvailabilityResults(availabilityResults);

      // Create an object mapping domains to their formatted prices
      const prices = {};
      availabilityResults.forEach((result) => {
        if (result.available && result.price) {
          prices[result.domain] = `$${result.price} USD`;
        }
      });
      setFormattedPrices(prices);

      // Activate confetti effect
      setConfettiActive(true);

      // Reset confetti after a short delay (adjust as needed)
      setTimeout(() => {
        setConfettiActive(false);
      }, 3500); // 1000 milliseconds = (1 seconds) time of confetti effect
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
          onChange={(e) => setNiche(e.target.value)} // Update niche using setNiche
        />
        <button onClick={generateDomains}>Generate Domain Names</button>
      </div>

      {/* Render Confetti component when isConfettiActive is true */}
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
