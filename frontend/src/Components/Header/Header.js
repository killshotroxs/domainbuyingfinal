import React from "react";
import "../Header/Header.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Header = () => {
  return (
    <>
      <div className="header">
        <div>
          <h1>
            Dom<span style={{ color: "pink" }}>AI</span>nBuy.ing
          </h1>
        </div>
        <div>
          <h2>About</h2>
        </div>
        <div>
          <h2>Pricing</h2>
        </div>
        <div>
          <h2>Contact</h2>
        </div>
      </div>
    </>
  );
};

export default Header;
