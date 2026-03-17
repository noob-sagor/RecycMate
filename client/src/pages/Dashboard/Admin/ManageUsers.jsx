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
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <span className="loading loading-ring loading-lg text-green-600"></span>
                <p className="text-gray-500 font-medium animate-pulse">Loading users...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Control access levels and manage platform participants.</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                    <span className="text-green-700 font-bold">{users.length}</span>
                    <span className="text-green-600/70 text-xs font-bold uppercase tracking-wider">Total Members</span>
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                <table className="table-auto w-full">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Participant</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Authentication</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Platform Role</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Management</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-green-50/30 transition-colors group">
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full border-2 border-green-500/20 overflow-hidden shrink-0 shadow-sm">
                                            <img className="w-full h-full object-cover" src={user.photo || "https://i.ibb.co/mJR9nxM/user.png"} alt="User Avatar" />
                                        </div>
                                        <div className="text-sm font-bold text-gray-900 leading-tight">{user.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                        user.role === 'agent' ? 'bg-blue-100 text-blue-700' :
                                        user.role === 'staff' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <select
                                        className="select select-bordered select-sm h-9 rounded-lg border-gray-200 focus:border-green-500 text-xs font-bold capitalize bg-gray-50/50 w-full max-w-[140px]"
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
