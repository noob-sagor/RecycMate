import React, { useEffect, useState } from 'react';
import { FaTruck, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import axios from 'axios';

const UserDashboard = () => {
    const { user } = useAuth();
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyPickups = async () => {
            if (!user?.email) return;
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/pickups/my/${user.email}`);
                setPickups(res.data);
            } catch (error) {
                console.error("Error fetching my pickups:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyPickups();
    }, [user?.email]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="badge badge-warning gap-2 font-medium capitalize py-3 px-4"><FaClock /> {status}</span>;
            case 'completed':
                return <span className="badge badge-success gap-2 font-medium capitalize py-3 px-4 text-white"><FaCheckCircle /> {status}</span>;
            case 'cancelled':
                return <span className="badge badge-error gap-2 font-medium capitalize py-3 px-4 text-white"><FaExclamationCircle /> {status}</span>;
            default:
                return <span className="badge badge-ghost gap-2 font-medium capitalize py-3 px-4">{status}</span>;
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-green-700">My Recycling Activities</h1>
                <div className="stats shadow bg-green-50 border border-green-100">
                    <div className="stat">
                        <div className="stat-title text-green-600">Total Requests</div>
                        <div className="stat-value text-green-700">{pickups.length}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaTruck className="text-green-600" /> Recent Pickup Requests
                    </h2>
                </div>

                {loading ? (
                    <div className="p-10 flex justify-center">
                        <span className="loading loading-spinner loading-lg text-green-600"></span>
                    </div>
                ) : pickups.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead className="bg-gray-50">
                                <tr className="text-gray-600">
                                    <th>Items</th>
                                    <th>Pickup Details</th>
                                    <th>Status</th>
                                    <th>Requested On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pickups.map((pickup) => (
                                    <tr key={pickup._id} className="hover:bg-green-50/30 transition-colors">
                                        <td className="max-w-xs">
                                            <div className="font-medium text-gray-800 truncate" title={pickup.itemsList}>
                                                {pickup.itemsList}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-sm">
                                                <p className="font-semibold text-gray-700">{pickup.preferredDate}</p>
                                                <p className="text-gray-500">{pickup.preferredTime}</p>
                                                <p className="text-xs text-gray-400 italic mt-1 truncate max-w-[150px]">{pickup.address}</p>
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(pickup.status)}</td>
                                        <td className="text-sm text-gray-500">
                                            {new Date(pickup.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <div className="flex justify-center mb-4 text-gray-300 text-6xl">
                            <FaTruck />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600">No requests yet</h3>
                        <p className="text-gray-400 mt-2">Start your recycling journey by creating your first pickup request!</p>
                        <button 
                            onClick={() => window.location.href = '/pickup-request'}
                            className="btn btn-success text-white mt-6"
                        >
                            Create Pickup Request
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
