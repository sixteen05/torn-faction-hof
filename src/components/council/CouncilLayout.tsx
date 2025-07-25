import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const CouncilLayout: React.FC = () => {
  return (
    <div className="council-layout d-flex bg-dark text-light min-vh-100" data-bs-theme="dark">
      <nav className="council-nav flex-column nav nav-pills p-3 bg-black border-end border-secondary" style={{ minWidth: 200, height: "100vh" }}>
        <NavLink to="chains" className={({ isActive }) => `nav-link${isActive ? " active" : ""} text-light`} aria-current="page">Chains</NavLink>
        <NavLink to="wars" className={({ isActive }) => `nav-link${isActive ? " active" : ""} text-light`} aria-current="page">Wars</NavLink>
        <NavLink to="ocs" className={({ isActive }) => `nav-link${isActive ? " active" : ""} text-light`} aria-current="page">OCs</NavLink>
      </nav>
      <main className="council-main flex-fill p-4 bg-dark text-light">
        <Outlet />
      </main>
    </div>
  );
};

export default CouncilLayout;
