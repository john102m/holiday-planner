// src/components/Hero.tsx
import { NavLink } from "react-router-dom";
export default function Hero() {
  return (
    <header
      className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] bg-center bg-cover flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://myjohnblogimages.blob.core.windows.net/images/croatia.webp')",
      }}
    >
      <div className="bg-black/40 p-6 rounded-xl text-center max-w-xl mx-4">
        <h1 className="text-[#F4EBD0] font-extrabold drop-shadow-xl">
          Itinera
        </h1>
        <p className="mt-4 text-white/80 text-lg sm:text-xl font-light drop-shadow">
          The name Itinera is Latin. It’s the plural of iter, meaning journey, route, or path.
          Roman generals, poets, and philosophers used it to describe strategic movements and personal voyages.
          Cicero and Caesar wrote of itinera as more than travel—they were transformations.
        </p>
        <NavLink
          to="/dashboard"
          className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          Dashboard
        </NavLink>

      </div>

    </header>
  );
}




