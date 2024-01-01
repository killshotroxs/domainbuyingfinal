import "../Domaingeneration/Domainai.css";
import React, { useState } from "react";
import axios from "axios";
import Confetti from "react-confetti"; // Import the Confetti component

const DomainGenerator = () => {
  const [domainSuggestions, setDomainSuggestions] = useState([]);
  const [availabilityResults, setAvailabilityResults] = useState([]);
  const [formattedPrices, setFormattedPrices] = useState({});
  const [niche, setNiche] = useState(""); // Added niche to the state
  const [isConfettiActive, setConfettiActive] = useState(false); // State for confetti

  const generateDomains = async () => {
    try {
      // Call the new endpoint on your server to fetch domain suggestions from OpenAI
      const openaiResponse = await axios.post(
        "https://domainbuyingserver.vercel.app/generateDomainSuggestions",
        { niche }
      );

      const suggestions = openaiResponse.data.suggestions;

      setDomainSuggestions(suggestions);
      setAvailabilityResults([]); // Reset previous availability results

      // Fetch availability for each domain suggestion
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
            // Update the object to include possible price data
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
                      ? `Available - ${formattedPrices[domain] || ''}`
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
