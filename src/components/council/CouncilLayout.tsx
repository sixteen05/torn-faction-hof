import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Council.css";
import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const CouncilLayout: React.FC = () => {
  const [footerHidden, setFooterHidden] = useState(false);

  const hideFooter = () => {
    setFooterHidden(true);
  };

  return (
    <div className="council-layout d-flex bg-dark text-light min-vh-100" data-bs-theme="dark">
      <nav className="council-nav flex-column nav nav-pills p-3 bg-black border-end border-secondary">
        <NavLink to="chains" className={({ isActive }) => `nav-link${isActive ? " active" : ""} text-light`} aria-current="page">Chains</NavLink>
        <NavLink to="wars" className={({ isActive }) => `nav-link${isActive ? " active" : ""} text-light`} aria-current="page">Wars</NavLink>
        <NavLink to="ocs" className={({ isActive }) => `nav-link${isActive ? " active" : ""} text-light`} aria-current="page">OCs</NavLink>
      </nav>
      <div className="d-flex flex-column flex-fill">
        <main className="flex-fill p-4 bg-dark text-light">
          <Outlet />
        </main>
      </div>
      <footer className={`council-footer bg-black text-center py-3 border-top border-secondary${footerHidden ? ' hidden' : ''}`}>
        <button
          className="close-btn"
          onClick={hideFooter}
          title="Hide footer"
          aria-label="Hide footer"
        >
          ×
        </button>
        <div className="container">
          <span className="text-warning">
            Made for Torn | Crime, Hospital, Jail, Weapons, Money, Trading, Smuggling
          </span>
          <br />
          <span className="text-muted small">
            Contact <a href="https://www.torn.com/profile.php?XID=3538936" target="_blank" rel="noopener noreferrer" className="text-info">red-it</a> for questions or support
          </span>
        </div>
      </footer>
    </div>
  );
};

export default CouncilLayout;
