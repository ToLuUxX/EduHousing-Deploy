"use client";

import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      {/* Logo */}
      <a
        href="/"
        className="navbar-brand"
        onClick={(e) => {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("reset-map"));
        }}
      >
        <span className="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" fill="#1976d2" opacity="0.15" stroke="#1976d2" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M9 22V12h6v10" stroke="#1976d2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="brand-name">
          edu<span className="brand-accent">ousing</span>
        </span>
      </a>

      {/* Links desktop */}
      <ul className="navbar-links">
        <li><a href="#" className="nav-link active">Carte</a></li>
        <li><a href="#" className="nav-link">Logements</a></li>
        <li><a href="#" className="nav-link">À propos</a></li>
      </ul>

      {/* Actions */}
      <div className="navbar-actions">
        <a href="#" className="btn-outline">Connexion</a>
        <a href="#" className="btn-primary">S&apos;inscrire</a>
      </div>

      {/* Burger mobile */}
      <button
        className={`burger${menuOpen ? " open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <a href="#" className="mobile-link active">Carte</a>
          <a href="#" className="mobile-link">Logements</a>
          <a href="#" className="mobile-link">À propos</a>
          <div className="mobile-actions">
            <a href="#" className="btn-outline">Connexion</a>
            <a href="#" className="btn-primary">S&apos;inscrire</a>
          </div>
        </div>
      )}

      <style jsx>{`
        .navbar {
          position: relative;
          display: flex;
          align-items: center;
          gap: 32px;
          padding: 0 32px;
          height: 60px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          z-index: 2000;
          font-family: 'Sora', sans-serif;
        }

        /* Brand */
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
          flex-shrink: 0;
          cursor: pointer;
          border-radius: 10px;
          padding: 4px 8px;
          margin-left: -8px;
          transition: background 0.15s;
        }

        .navbar-brand:hover {
          background: #eff6ff;
        }

        .brand-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-name {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .brand-accent {
          color: #1976d2;
        }

        /* Links */
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          flex: 1;
        }

        .nav-link {
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          padding: 6px 12px;
          border-radius: 8px;
          transition: color 0.15s, background 0.15s;
        }

        .nav-link:hover {
          color: #0f172a;
          background: #f1f5f9;
        }

        .nav-link.active {
          color: #1976d2;
          background: #eff6ff;
        }

        /* Actions */
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .btn-outline {
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          padding: 7px 16px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }

        .btn-outline:hover {
          border-color: #1976d2;
          color: #1976d2;
          background: #eff6ff;
        }

        .btn-primary {
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          padding: 7px 16px;
          border-radius: 10px;
          background: #1976d2;
          border: 1px solid #1976d2;
          transition: background 0.15s, box-shadow 0.15s;
        }

        .btn-primary:hover {
          background: #1565c0;
          box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
        }

        /* Burger */
        .burger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 36px;
          height: 36px;
          padding: 6px;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 8px;
          margin-left: auto;
        }

        .burger:hover {
          background: #f1f5f9;
        }

        .burger span {
          display: block;
          height: 2px;
          width: 100%;
          background: #334155;
          border-radius: 2px;
          transition: transform 0.2s, opacity 0.2s;
        }

        .burger.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .burger.open span:nth-child(2) {
          opacity: 0;
        }

        .burger.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Mobile menu */
        .mobile-menu {
          position: absolute;
          top: 60px;
          left: 0;
          right: 0;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mobile-link {
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          color: #64748b;
          padding: 10px 12px;
          border-radius: 8px;
          transition: color 0.15s, background 0.15s;
        }

        .mobile-link:hover,
        .mobile-link.active {
          color: #1976d2;
          background: #eff6ff;
        }

        .mobile-actions {
          display: flex;
          gap: 10px;
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .mobile-actions .btn-outline,
        .mobile-actions .btn-primary {
          flex: 1;
          text-align: center;
        }

        @media (max-width: 640px) {
          .navbar {
            padding: 0 16px;
            gap: 0;
          }

          .navbar-links,
          .navbar-actions {
            display: none;
          }

          .burger {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
}
