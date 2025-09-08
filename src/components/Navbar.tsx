import { NavLink } from 'react-router-dom';

type NavLinkProps = { isActive: boolean };

function Navbar() {
    const navLinkStyles = ({ isActive }: NavLinkProps) =>
        `px-4 py-2 rounded-md transition-all duration-200 ${isActive
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
            <NavLink to="/admindashboard" className={navLinkStyles}>
                Admin
            </NavLink>         {/* trip id for trip to Fuerteventua */}
            <NavLink to="/trips/b91ade99-7421-43b4-a77e-cc4c2181430d" className={navLinkStyles}>  
      
                Fuerteventura
            </NavLink>
            <NavLink to="/destinations/2e499e55-a53d-46b8-9bf0-0366e43ded2e" className={navLinkStyles}>
                Iceland
            </NavLink>
        </nav>
    );
}

export default Navbar;
