import React, {useState}from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../services/types";
import { getUserId, isAdmin } from "../../services/auth";
import { GenericModal } from "../GenericModal";
import { deleteUser } from "../../services/apis/api";

interface UserCardProps {
    user: User;
    onDelete?: (id: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onDelete }) => {
    console.log("User:", user)
    const navigate = useNavigate();
    const canDelete = isAdmin() && user.id !== getUserId();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    return (
        <>

            <div className="border rounded p-4 shadow hover:shadow-lg transition">
                <img
                    src={user.avatarUrl ?? "/placeholder.png"}
                    alt={user.name}
                    className="w-12 h-12 rounded-full mb-2"
                />
                <h3 className="font-semibold text-lg">{user.name || user.email}</h3>
                <p className="text-gray-600 text-sm mb-2">{user.role ?? "No role assigned"}</p>
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                    >
                        Edit
                    </button>
                    {canDelete && (
                        <button
                            onClick={() => onDelete?.(user.id ?? "")}
                            className="px-2 py-1 bg-red-500 text-white rounded"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
            {showDeleteModal && (
                <GenericModal title="Confirm Delete" onClose={() => setShowDeleteModal(false)}>
                    <p>Are you sure you want to delete this user?</p>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => {
                                deleteUser(user.id ?? "");
                                setShowDeleteModal(false);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded"
                        >
                            Yes, Delete
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="px-4 py-2 bg-gray-300 text-black rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </GenericModal>
            )}
        </>
    );
};

export default UserCard;
