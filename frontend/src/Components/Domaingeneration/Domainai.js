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
  const [errorMessage, setErrorMessage] = useState("");

  const generateDomains = async () => {
    try {
      const openaiResponse = await axios.post(
        "https://domainbuyingserver.vercel.app/generateDomainSuggestions",
        { niche }
      );
  
      if (openaiResponse.data.errorMessage) {
        setErrorMessage(openaiResponse.data.errorMessage);
        return; // Stop execution if there's an error message
      }
  
      const suggestions = openaiResponse.data.suggestions
        .map(suggestion => suggestion.replace(/^[0-9]+\.\s*/, '')); // Remove any numeric prefixes
  
      setDomainSuggestions(suggestions);
      setAvailabilityResults([]);
  
      const availabilityPromises = suggestions.map(async (domain) => {
        try {
          const availabilityResponse = await axios.get(
            `https://domainbuyingserver.vercel.app/checkDomainAvailability?domain=${domain}`
          );
  
          if (availabilityResponse.status === 429) {
            const rateLimitMessage = availabilityResponse.data.message;
            setErrorMessage(rateLimitMessage);
            return; // Stop execution if rate limit is exceeded
          }
  
          return {
            domain: domain,
            available: availabilityResponse.data.available,
            price: availabilityResponse.data.price
            // Additional properties from the response can be added here
          };
        } catch (error) {
          console.error("Error checking domain availability: ", error);
          setErrorMessage("Error checking domain availability. Please try again later.");
          return {
            domain: domain,
            available: false,
            price: null
            // Ensure to return an object with the expected structure even in case of an error
          };
        }
      });
  
      const availabilityResults = await Promise.all(availabilityPromises);
      setAvailabilityResults(availabilityResults);
  
      const prices = {};
      availabilityResults.forEach((result) => {
        if (result.available && result.price) {
          prices[result.domain] = `$${(result.price / 1000000).toFixed(2)} USD`;
        }
      });
      setFormattedPrices(prices);
  
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 3500);
  
    } catch (error) {
      console.error("Error fetching domain name suggestions: ", error);
      setErrorMessage("Error fetching domain name suggestions. Please try again later.");
    }
  };

  return (
    <div>
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

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

      {domainSuggestions.map((domain, index) => (
  <div key={index} className="domain-box">
    <div className="domain-item">
      {domain}
      {availabilityResults.length > index && (
        <div
          className={`availability-result ${
            availabilityResults[index].available
              ? "available"
              : "not-available"
          }`}
        >
          {availabilityResults[index].available
            ? `Available - ${formattedPrices[domain] || ""}`
            : "Not Available"}
        </div>
      )}
    </div>
  </div>
))}
    </div>
  );
};

export default DomainGenerator;