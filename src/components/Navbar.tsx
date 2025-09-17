
import { NavLink } from 'react-router-dom';

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Dashboard", to: "/dashboard" },
  // { label: "Admin", to: "/admindashboard" }, // optional
];

function Navbar() {
  const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-md text-sm font-medium transition ${
      isActive
        ? 'bg-blue-500 text-white shadow-sm'
        : 'text-blue-900 hover:bg-blue-100 hover:text-blue-700'
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-100 border-b border-blue-300 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <NavLink
          to="/"
          className="text-blue-900 font-bold text-lg hover:text-blue-700 transition-colors duration-200"
        >
          Itinera
        </NavLink>

        <div className="flex space-x-4">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={navLinkStyles}>
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
