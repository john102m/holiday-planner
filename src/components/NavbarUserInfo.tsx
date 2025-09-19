import { getUserEmail, hasRole } from "../services/auth";

const NavbarUserInfo: React.FC = () => {
  const email = getUserEmail();

  const roleLabel = hasRole("admin")
    ? "🛡️ Admin"
    : hasRole("owner")
    ? "👑 Owner"
    : hasRole("collaborator")
    ? "🤝 Collaborator"
    : "👤 Guest";

  const roleColor = hasRole("admin")
    ? "bg-green-600"
    : hasRole("owner")
    ? "bg-blue-600"
    : hasRole("collaborator")
    ? "bg-purple-600"
    : "bg-yellow-500";

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <span className="font-semibold text-sm sm:text-base">
        {email ?? "Guest"}
      </span>
      <span className={`px-2 py-1 rounded text-white text-xs sm:text-sm ${roleColor}`}>
        {roleLabel}
      </span>
    </div>
  );
};

export default NavbarUserInfo;

