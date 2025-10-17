import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser } from "../../services/apis/api"; // adjust path as needed
import type { User } from "../../services/types";
import { GenericModal } from "../GenericModal";
import placeholder from "/placeholder.png";

const UserEditPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    console.log("Looking for user id: ", id)
    useEffect(() => {
        async function fetchUser() {
            if (!id) return;
            try {
                const data = await getUserById(id);
                setUser(data);
            } catch (err) {
                console.error("Failed to fetch user", err);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [id]);

    const handleSave = async () => {
        if (!user) return;
        try {
            await updateUser(user);
            setShowSuccessModal(true);

        } catch (err) {
            console.error("Failed to update user", err);
        }
    };

    if (loading || !user) return <div>Loading...</div>;

    return (
        <>
            <div className="flex justify-center mb-6">
                <img
                    src={user.avatarUrl ?? placeholder}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border shadow"
                    onError={(e) => {
                        e.currentTarget.src = placeholder;
                    }}
                />
            </div>
            <h2 className="text-2xl font-bold mb-4">Edit User</h2>

            <label className="block mb-2">Name</label>
            <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="w-full p-2 border rounded mb-4"
            />

            <label className="block mb-2">Email</label>
            <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="w-full p-2 border rounded mb-4"
            />

            <label className="block mb-2">Role</label>
            <select
                value={user.role ?? ""}
                onChange={(e) => setUser({ ...user, role: e.target.value })}
                className="w-full p-2 border rounded mb-4"
            >
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
                <option value="collaborator">Collaborator</option>
                <option value="guest">Guest</option>
            </select>

            <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded"
            >
                Save Changes
            </button>

            {showSuccessModal && (
                <GenericModal title="Success" onClose={() => setShowSuccessModal(false)}>
                    <p className="mb-4">User updated successfully.</p>
                    <button
                        onClick={() => {
                            setShowSuccessModal(false);
                            navigate("/admin");
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Back to Dashboard
                    </button>
                </GenericModal>
            )}
        </>
    );

};

export default UserEditPage;
