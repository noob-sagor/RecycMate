import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from "../../../providers/AuthProvider";

const ManageUsers = () => {
    const { dbUser, setUser, setDbUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const userRoles = ['user', 'agent', 'staff', 'admin'];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
                setUsers(res.data);
                setLoading(false);
            } catch (error) {
                toast.error("Failed to fetch users.");
                console.error("Error fetching users:", error);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            // Assuming the backend uses _id for user identification
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/users/role/${userId}`, { role: newRole });
            if (response.data.modifiedCount > 0) {
                toast.success(`User role updated to ${newRole}.`);
                // Update local state for immediate UI feedback
                setUsers(users.map(user => 
                    user._id === userId ? { ...user, role: newRole } : user
                ));
                // If the current logged-in user's role changed, update AuthContext
                if (dbUser && dbUser._id === userId) {
                    setDbUser({ ...dbUser, role: newRole });
                }
            } else {
                toast.warn("Role not changed. User might not exist or role is the same.");
            }
        } catch (error) {
            toast.error("Failed to update user role.");
            console.error("Error updating user role:", error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading users...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-green-700 mb-8">Manage Users</h1>
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border p-6">
                <table className="table-auto w-full">
                    <thead>
                        <tr className="bg-green-100">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-green-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-green-500 overflow-hidden">
                                            <img className="w-full h-full object-cover" src={user.photo || "https://i.ibb.co/mJR9nxM/user.png"} alt="User Avatar" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium capitalize">{user.role}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                    <select
                                        className="select select-bordered select-sm w-full max-w-xs"
                                        defaultValue={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                    >
                                        {userRoles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;
