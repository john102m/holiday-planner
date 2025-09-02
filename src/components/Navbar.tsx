import { NavLink } from 'react-router-dom';

type NavLinkProps = { isActive: boolean };

function Navbar() {
const navLinkStyles = ({ isActive }: NavLinkProps) =>
  `px-4 py-2 rounded-md transition-all duration-200 ${
    isActive
      ? 'bg-blue-300 text-white-800 font-semibold underline shadow-sm'
      : 'text-blue-900 hover:bg-blue-100 hover:text-blue-700'
  }`;

    return (
        <nav className="fixed top-0 left-0 w-full bg-blue-200 p-3 text-white flex justify-center space-x-8 z-50 shadow-md">
            <NavLink to="/" className={navLinkStyles}>
                Home
            </NavLink>
            <NavLink to="/dashboard" className={navLinkStyles}>
                Dashboard
            </NavLink>
            <NavLink to="/dashboardlower" className={navLinkStyles}>
                Dashboard Lower
            </NavLink>            
            <NavLink to="/destinations/da9a83d7-7bff-4915-8888-3604f026257b" className={navLinkStyles}>
                Destination
            </NavLink>
        </nav>
    );
}

export default Navbar;
