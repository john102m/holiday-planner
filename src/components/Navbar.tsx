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
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
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
        <div className="sm:hidden mt-2 px-4 pb-2 h-14 flex items-center">
          <NavLink
            to="/dashboard"
            className="text-blue-900 rounded p-0.5 border font-bold text-lg hover:text-blue-700"
          >
            Dashboard
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
          ref={buttonRef}
          className="sm:hidden text-blue-900 text-xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className={`sm:hidden px-4 pb-4 transform transition-all duration-300 ease-in-out ${menuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
            }`}
        >
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
