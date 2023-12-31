import React from 'react'

const Pricing = () => {
  return (
    <div></div>
  )
}

export default Pricing


// import React, { useState } from "react";
// import axios from "axios";

// const Pricing = () => {
//   const [domainName, setDomainName] = useState("");
//   const [isAvailable, setIsAvailable] = useState(null);

//   const checkDomainAvailability = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:3001/checkDomainAvailability?domain=${domainName}`
//       );

//       setIsAvailable(response.data.available);
//     } catch (error) {
//       console.error("Error checking domain availability: ", error);
//     }
//   };

//   return (
//     <div className="pricing-container">
//       <input
//         type="text"
//         placeholder="Enter a domain name..."
//         value={domainName}
//         onChange={(e) => setDomainName(e.target.value)}
//       />
//       <button onClick={checkDomainAvailability}>Check Availability</button>

//       {isAvailable !== null && (
//         <div className="availability-result">
//           {isAvailable
//             ? `${domainName} is available!`
//             : `${domainName} is not available.`}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Pricing;
