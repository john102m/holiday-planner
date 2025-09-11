import React from "react";
//import { useStore } from "../../services/store";
import { useNavigate } from "react-router-dom";
//import type { User } from "../../services/types";

const UsersGridSection: React.FC = () => {
  //const usersState = useStore((state) => state.users); // grab users from store
  //const users = React.useMemo(() => Object.values(usersState), [usersState]);
  const navigate = useNavigate();

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
        {/* {users.map((user: User) => (
          <div key={user.id} className="border rounded p-4 shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-lg">{user.name || user.email}</h3>
            <p className="text-gray-600 text-sm mb-2">{user.role}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                className="px-2 py-1 bg-yellow-500 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => console.log("Delete:", user.id)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))} */}
      </div>
    </div>
  );
};

export default UsersGridSection;
