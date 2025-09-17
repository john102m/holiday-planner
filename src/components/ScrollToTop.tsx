import React, { useState, useEffect } from "react";

const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const fabBase =
    "fixed bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-colors";

  const handleScroll = () => {
    setVisible(window.scrollY > 300); // show button after 300px scroll
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;
  //⬆ (U+2B06) → thick arrow
  return (

    <button
      onClick={scrollToTop}
      className={`${fabBase} w-12 h-12 bottom-20 right-4 md:bottom-6 md:right-6 fixed`}
      aria-label="Scroll to top"
    >
      <span className="text-white text-2xl">⬆</span>
    </button>


  );
};

export default ScrollToTopButton;
