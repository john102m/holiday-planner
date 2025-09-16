import { useState } from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
        `block px-4 py-2 rounded-md text-sm font-medium transition ${isActive
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-blue-900 hover:bg-blue-100 hover:text-blue-700'
        }`;

    return (
        <nav className="fixed top-0 left-0 w-full bg-blue-100 border-b border-blue-300 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Logo or title */}
                    <NavLink
                        to="/"
                        className="text-blue-900 font-bold text-lg hover:text-blue-700 transition-colors duration-200"
                    >
                        Itinera
                    </NavLink>


                    {/* Hamburger button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="sm:hidden text-blue-900 focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    {/* Desktop nav */}
                    <div className="hidden sm:flex space-x-4">
                        <NavLink to="/" className={navLinkStyles}>Home</NavLink>
                        <NavLink to="/dashboard" className={navLinkStyles}>Dashboard</NavLink>
                        <NavLink to="/admindashboard" className={navLinkStyles}>Admin</NavLink>
                        <NavLink to="/trips/b91ade99-7421-43b4-a77e-cc4c2181430d" className={navLinkStyles}>Fuerteventura</NavLink>
                        <NavLink to="/destinations/2e499e55-a53d-46b8-9bf0-0366e43ded2e" className={navLinkStyles}>Iceland</NavLink>
                    </div>
                </div>

                {/* Mobile nav */}
                {isOpen && (
                    <div className="sm:hidden mt-2 space-y-1">
                        <NavLink to="/" className={navLinkStyles} onClick={() => setIsOpen(false)}>Home</NavLink>
                        <NavLink to="/dashboard" className={navLinkStyles} onClick={() => setIsOpen(false)}>Dashboard</NavLink>
                        <NavLink to="/admindashboard" className={navLinkStyles} onClick={() => setIsOpen(false)}>Admin</NavLink>
                        <NavLink to="/trips/b91ade99-7421-43b4-a77e-cc4c2181430d" className={navLinkStyles} onClick={() => setIsOpen(false)}>Fuerteventura</NavLink>
                        <NavLink to="/destinations/2e499e55-a53d-46b8-9bf0-0366e43ded2e" className={navLinkStyles} onClick={() => setIsOpen(false)}>Iceland</NavLink>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
