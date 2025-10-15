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
        <h1 className="text-[#f4d0e5] font-serif font-extralight drop-shadow-xl">
          Itinera
        </h1>


          <NavLink
            to="/dashboard"
            className="
              text-blue-900 
              bg-blue-300 
              rounded-2xl 
              pt-1 pl-3 pr-3 pb-1 
              font-bold 
              text-lg 
              hover:text-blue-700 
              hover:bg-blue-200 
              transition-colors 
              shadow-sm
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
            "
          >
            Dashboard
          </NavLink>

      </div>

    </header>
  );
}




