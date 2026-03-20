import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from "../../../providers/AuthProvider";
import { FaEye, FaHistory, FaCalendarAlt, FaMapMarkerAlt, FaTruck } from 'react-icons/fa';

const PickupHistory = () => {
    const { dbUser } = useContext(AuthContext);
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPickup, setSelectedPickup] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/pickups/all`);
                // Filter only settled statuses: approved, rejected, completed, cancelled
                const settledPickups = res.data.filter(p => 
                    ['approved', 'rejected', 'completed', 'cancelled'].includes(p.status)
                );
                setPickups(settledPickups);
                setLoading(false);
            } catch (error) {
                toast.error("Failed to fetch pickup history.");
                console.error("Error fetching history:", error);
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-40">Loading history...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-green-700 mb-8 flex items-center gap-3">
                <FaHistory /> Pickup History
            </h1>
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border p-6">
                <table className="table-auto w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">User Info</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Location</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Date & Time</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pickups.map(pickup => (
                            <tr key={pickup._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-4">
                                    <div className="text-sm font-bold text-gray-900">{pickup.userName}</div>
                                    <div className="text-xs text-gray-500">{pickup.userEmail}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 max-w-[200px] truncate" title={pickup.address}>
                                    {pickup.address}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <div>{pickup.preferredDate}</div>
                                    <div className="text-xs text-gray-500">at {pickup.preferredTime}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        pickup.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        pickup.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        pickup.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {pickup.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <button 
                                        onClick={() => setSelectedPickup(pickup)}
                                        className="btn btn-sm btn-ghost text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-2"
                                    >
                                        <FaEye /> Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {pickups.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-12 text-gray-400 font-medium">
                                    No historical records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Details Modal (Same as in AllPickups but read-only) */}
            {selectedPickup && (
                <div className="modal modal-open z-[50]">
                    <div className="modal-box max-w-3xl p-0 rounded-3xl shadow-2xl bg-white max-h-[90vh] overflow-y-auto relative">
                        <div className="bg-green-600 p-8 text-white sticky top-0 z-20">
                            <button 
                                onClick={() => setSelectedPickup(null)}
                                className="btn btn-sm btn-circle absolute right-6 top-6 bg-green-500 border-none text-white hover:bg-green-700"
                            >
                                ✕
                            </button>
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <FaTruck size={24} /> Pickup Details
                            </h3>
                            <p className="text-green-50 mt-1 opacity-90 text-sm font-medium tracking-wide">
                                Request ID: <span className="font-mono text-xs">{selectedPickup._id}</span>
                            </p>
                        </div>

                        
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                    <div className={`mt-1 capitalize px-3 py-1 font-bold rounded-lg w-fit text-sm ${
                                        selectedPickup.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        selectedPickup.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        selectedPickup.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>{selectedPickup.status}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date & Time</p>
                                    <p className="font-bold text-gray-800 flex items-center gap-2 mt-1 text-sm">
                                        <FaCalendarAlt className="text-green-500" />
                                        {selectedPickup.preferredDate} | {selectedPickup.preferredTime}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">User Info</p>
                                    <p className="font-bold text-gray-800 mt-1 text-sm">{selectedPickup.userName}</p>
                                    <p className="text-xs text-gray-500">{selectedPickup.userEmail}</p>
                                </div>
                            </div>

                            {selectedPickup.statusHistory && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">History Log</h4>
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        <ul className="space-y-4">
                                            {selectedPickup.statusHistory.map((h, i) => (
                                                <li key={i} className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                                                    <div>
                                                        <p className="text-sm font-bold capitalize text-gray-800">{h.status}</p>
                                                        <p className="text-[10px] text-gray-500">{new Date(h.timestamp).toLocaleString()} • by {h.updatedBy}</p>
                                                        {h.note && <p className="mt-2 text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-100 italic">"{h.note}"</p>}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Items</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedPickup.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-50 border">
                                                <img src={item.image} alt={item.category} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-800">{item.category}</h5>
                                                <p className="text-green-600 font-bold text-xs uppercase">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-gray-900 p-6 rounded-2xl text-white">
                                <p className="text-green-400 font-bold uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
                                    <FaMapMarkerAlt /> Pickup Location
                                </p>
                                <p className="text-sm leading-relaxed">{selectedPickup.address}</p>
                            </div>
                        </div>
                        
                        <div className="modal-action p-6 bg-gray-50 border-t border-gray-100">
                            <button onClick={() => setSelectedPickup(null)} className="btn btn-ghost hover:bg-gray-200 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px]">Close History</button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPickup(null)}></div>
                </div>
            )}
        </div>
    );
};

export default PickupHistory;
