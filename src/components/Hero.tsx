import { NavLink } from "react-router-dom";

export default function Hero() {
  return (
    <>
      {/* Logo Header */}
      <header
        className="w-full h-28 bg-center bg-contain bg-no-repeat mt-18"
        style={{
          backgroundImage: "url('/logo.png')",
        }}
      />

      {/* Button Below Logo */}
      <div className="flex justify-center mt-6">
        <NavLink
          to="/dashboard"
          className="
            text-white
            bg-blue-600 
            rounded-xl 
            px-6 py-2 
            font-semibold 
            text-base 
            hover:bg-blue-500 
            transition 
            shadow-md
            active:scale-95
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
          "
        >
          Dashboard
        </NavLink>
      </div>
    </>
  );
}
