import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../services/types";
import { getUsers } from "../../services/apis/api";
import UserCard from "../admincards/UserCard";
const UsersGridSection: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsers() {
      const data = await getUsers();
      if (data) setUsers(data);
    }
    fetchUsers();
  }, []);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => navigate("/admin/users/add")}
        >
          + Add User
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <UserCard key={user.id} user={user} onDelete={(id) => console.log("Delete:", id)} />
        ))}

      </div>
    </div>
  );
};

export default UsersGridSection;
