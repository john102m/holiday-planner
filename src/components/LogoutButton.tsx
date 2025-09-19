import { clearTokens, isLoggedIn } from "../services/auth";
import { useNavigate } from "react-router-dom";

const AuthButton: React.FC = () => {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();

  const handleClick = () => {
    if (loggedIn) {
      clearTokens();
    }
    navigate("/login"); // or your login route
  };

  return (
    <button
      onClick={handleClick}
      title={loggedIn ? "Logout" : "Login"}
      className="text-xl text-gray-600 hover:text-gray-900 px-2 py-1 rounded transition"
    >
      {loggedIn ? "🔓" : "🔐"}
    </button>
  );
};

export default AuthButton;
