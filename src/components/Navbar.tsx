import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import NavbarUserInfo from "../components/NavbarUserInfo";
import LogoutButton from "../components/LogoutButton";
import { hasRole } from "../services/auth";

const baseLinks = [
  { label: "Home", to: "/" },
  { label: "Dashboard", to: "/dashboard" },
];
if (hasRole("admin")) {
  baseLinks.push({ label: "Admin", to: "/admin" });
}

const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2 rounded text-sm font-medium ${isActive
    ? "bg-blue-500 text-white"
    : "text-blue-900 hover:bg-blue-100 hover:text-blue-700"
  }`;

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <nav className="bg-blue-100 border-b border-blue-300 shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        {/* Left: Logo */}
        <NavLink
          to="/"
          className="text-blue-900 font-bold text-lg hover:text-blue-700"
        >
          Itinera
        </NavLink>
        {/* Mobile Quick Dashboard Link */}
        <div className="sm:hidden px-4 pb-2">
          <NavLink to="/dashboard" className={navLinkStyles}>
            📋 Dashboard
          </NavLink>
        </div>


        {/* Center: All visible links */}
        <div className="hidden sm:flex gap-4">
          {baseLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkStyles}>
              {link.label}
            </NavLink>
          ))}
        </div>


        {/* Right: User info + Logout */}
        <div className="hidden sm:flex items-center gap-2">
          <NavbarUserInfo />
          <LogoutButton />
        </div>

        {/* Hamburger Toggle */}
        <button
          className="sm:hidden text-blue-900 text-xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>


      {/* Mobile Menu */}
      {menuOpen && (
        <div ref={menuRef} className="sm:hidden px-4 pb-4">
          {baseLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={navLinkStyles}
              onClick={() => setMenuOpen(false)} // close on link click
            >
              {link.label}
            </NavLink>
          ))}
          <div className="mt-2 flex items-center justify-between">
            <NavbarUserInfo />
            <LogoutButton />
          </div>
        </div>
      )}


    </nav>
  );
}

export default Navbar;
