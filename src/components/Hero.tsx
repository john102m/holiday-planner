// src/components/Hero.tsx
import { NavLink } from "react-router-dom";
export default function Hero() {
  return (
    <header
      className="w-full aspect-[4/1] bg-center bg-contain bg-no-repeat mt-20"
      style={{
        backgroundImage: "url('/logo.png')",
      }}
    >

      {/* Optional content here */}
      <NavLink
        to="/dashboard"
        className="
            hidden md:block
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


    </header>
  );
}




