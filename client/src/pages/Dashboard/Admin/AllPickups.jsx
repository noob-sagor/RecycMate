import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from "../../../providers/AuthProvider";
import { FaEye, FaTruck, FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle, FaExclamationCircle, FaTimesCircle } from 'react-icons/fa';

const AllPickups = () => {
    const { dbUser } = useContext(AuthContext);
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [statusModal, setStatusModal] = useState({ isOpen: false, pickupId: null, newStatus: '', note: '' });

    const statuses = ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'];

    useEffect(() => {
        const fetchAllPickups = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/pickups/all`);
                setPickups(res.data);
                setLoading(false);
            } catch (error) {
                toast.error("Failed to fetch pickups.");
                console.error("Error fetching pickups:", error);
                setLoading(false);
            }
        };
        fetchAllPickups();
    }, []);

    const initiateStatusChange = (pickupId, newStatus) => {
        if (newStatus === 'approved' || newStatus === 'rejected') {
            setStatusModal({ isOpen: true, pickupId, newStatus, note: '' });
        } else {
            handleStatusChange(pickupId, newStatus, '');
        }
    };

    const handleStatusChange = async (pickupId, newStatus, adminNote = '') => {
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/pickups/${pickupId}/status`, { 
                status: newStatus,
                updatedBy: dbUser?.name || 'Admin',
                adminNote
            });

            if (response.data.modifiedCount > 0) {
                toast.success(`Pickup status updated to ${newStatus}.`);
                setPickups(pickups.map(pickup => 
                    pickup._id === pickupId ? { ...pickup, status: newStatus, statusHistory: [...(pickup.statusHistory || []), { status: newStatus, timestamp: new Date(), updatedBy: dbUser?.name || 'Admin', note: adminNote }] } : pickup
                ));
            } else {
                toast.warn("Status not changed. It might already have this status.");
            }
        } catch (error) {
            toast.error("Failed to update status.");
            console.error("Error updating status:", error);
        } finally {
            setStatusModal({ isOpen: false, pickupId: null, newStatus: '', note: '' });
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-40">Loading pickups...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-green-700 mb-8">Manage All Pickups</h1>
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border p-6">
                <table className="table-auto w-full">
                    <thead>
                        <tr className="bg-green-100">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Info</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pickups.map(pickup => (
                            <tr key={pickup._id} className="hover:bg-green-50 border-b border-gray-100 last:border-0">
                                <td className="px-4 py-4">
                                    <div className="text-sm font-bold text-gray-900">{pickup.userName}</div>
                                    <div className="text-xs text-gray-500">{pickup.userEmail}</div>
                                    <div className="text-xs text-green-600 font-medium mt-1">
                                        {pickup.items?.length || 0} items
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 max-w-[200px] truncate" title={pickup.address}>
                                    {pickup.address}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <div>{pickup.preferredDate}</div>
                                    <div className="text-xs text-gray-500">at {pickup.preferredTime}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <select
                                            className="select select-bordered select-sm w-full max-w-[130px] capitalize text-xs"
                                            value={pickup.status || 'pending'}
                                            onChange={(e) => initiateStatusChange(pickup._id, e.target.value)}
                                        >
                                            {statuses.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <div className="flex bg-gray-50 rounded-lg p-1">
                                            <button 
                                                onClick={() => initiateStatusChange(pickup._id, 'approved')}
                                                className={`btn btn-sm btn-ghost hover:bg-green-100 hover:text-green-700 px-2`}
                                                title="Approve"
                                                disabled={pickup.status === 'completed' || pickup.status === 'cancelled'}
                                            >
                                                <FaCheckCircle className="text-green-500" />
                                            </button>
                                            <button 
                                                onClick={() => initiateStatusChange(pickup._id, 'rejected')}
                                                className={`btn btn-sm btn-ghost hover:bg-red-100 hover:text-red-700 px-2`}
                                                title="Reject"
                                                disabled={pickup.status === 'completed' || pickup.status === 'cancelled'}
                                            >
                                                <FaTimesCircle className="text-red-500" />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedPickup(pickup)}
                                            className="btn btn-sm btn-circle btn-ghost text-blue-600 hover:bg-blue-600 hover:text-white transition-all border border-blue-100 ml-1"
                                            title="View Details"
                                        >
                                            <FaEye size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {pickups.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-500">
                                    No pickups found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            {selectedPickup && (
                <div className="modal modal-open overflow-y-auto">
                    <div className="modal-box max-w-3xl p-0 rounded-3xl overflow-hidden shadow-2xl bg-white">
                        <div className="bg-green-600 p-8 text-white relative">
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
                            {/* Summary Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                    <div className="mt-1 capitalize px-3 py-1 bg-green-100 text-green-700 font-bold rounded-lg w-fit">{selectedPickup.status}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Preferred Date & Time</p>
                                    <p className="font-bold text-gray-800 flex items-center gap-2 mt-1">
                                        <FaCalendarAlt className="text-green-500" />
                                        {selectedPickup.preferredDate} <span className="text-gray-400 font-normal">|</span> {selectedPickup.preferredTime}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 sm:col-span-2 lg:col-span-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">User Specs</p>
                                    <p className="font-bold text-gray-800 mt-1">{selectedPickup.userName}</p>
                                    <p className="text-xs text-gray-500">{selectedPickup.userEmail}</p>
                                </div>
                            </div>

                            {/* Status Timeline */}
                            {selectedPickup.statusHistory && selectedPickup.statusHistory.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                        <div className="h-[1px] w-8 bg-gray-200"></div> Request Status Timeline
                                    </h4>
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                        <ul className="steps steps-vertical w-full">
                                            {selectedPickup.statusHistory.map((history, idx) => (
                                                <li key={idx} className={`step ${idx === selectedPickup.statusHistory.length - 1 ? 'step-success text-green-600 font-bold' : 'step-neutral text-gray-500'}`}>
                                                    <div className="flex flex-col items-start text-left w-full ml-4 py-2">
                                                        <span className="capitalize text-sm">{history.status}</span>
                                                        <span className="text-xs text-gray-400 font-normal">
                                                            {new Date(history.timestamp).toLocaleString()} • by {history.updatedBy}
                                                        </span>
                                                        {history.note && (
                                                            <div className="mt-2 text-xs bg-white p-2 border border-gray-100 rounded-lg shadow-sm w-full font-medium text-gray-600">
                                                                <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block mb-1">Admin Note:</span>
                                                                {history.note}
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Items & Images */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                    <div className="h-[1px] w-8 bg-gray-200"></div> Items to Recycle
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedPickup.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-green-200 transition-all group">
                                            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-50 shadow-inner">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.category} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <FaTruck size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-center py-1">
                                                <h5 className="font-bold text-gray-800 text-lg leading-tight">{item.category}</h5>
                                                <p className="text-green-600 font-bold mt-1 text-sm bg-green-50 inline-block px-3 py-0.5 rounded-full w-fit">Quantity: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Logistics */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                    <div className="h-[1px] w-8 bg-gray-200"></div> Pickup Logistics
                                </h4>
                                <div className="bg-gray-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                        <FaMapMarkerAlt size={100} />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-green-400 font-bold uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
                                            <FaMapMarkerAlt /> Pickup Location
                                        </p>
                                        <p className="text-lg font-medium leading-relaxed">{selectedPickup.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-action p-6 bg-gray-50/50 border-t border-gray-100">
                            <button onClick={() => setSelectedPickup(null)} className="btn btn-ghost hover:bg-gray-200 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px]">Close Details</button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPickup(null)}></div>
                </div>
            )}
            {/* Admin Note Modal */}
            {statusModal.isOpen && (
                <div className="modal modal-open">
                    <div className="modal-box rounded-3xl p-8">
                        <h3 className="font-bold text-xl mb-2 text-gray-800 flex items-center gap-2">
                            {statusModal.newStatus === 'approved' ? (
                                <><FaCheckCircle className="text-green-500" /> Approve Request</>
                            ) : (
                                <><FaExclamationCircle className="text-red-500" /> Reject Request</>
                            )}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 font-medium">Please provide a reason or note for the user.</p>
                        
                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-bold text-xs uppercase tracking-wider text-gray-500">Admin Note / Reason</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered h-24 rounded-xl focus:border-green-500 transition-colors"
                                placeholder={`E.g., ${statusModal.newStatus === 'approved' ? 'Approved for pickup on Friday.' : 'Rejected due to items not being accepted.'}`}
                                value={statusModal.note}
                                onChange={(e) => setStatusModal({ ...statusModal, note: e.target.value })}
                            ></textarea>
                        </div>
                        
                        <div className="modal-action flex gap-3 m-0">
                            <button 
                                onClick={() => setStatusModal({ isOpen: false, pickupId: null, newStatus: '', note: '' })}
                                className="btn btn-ghost rounded-xl font-bold"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleStatusChange(statusModal.pickupId, statusModal.newStatus, statusModal.note)}
                                className={`btn border-none text-white rounded-xl shadow-lg px-8 ${statusModal.newStatus === 'approved' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-red-500 hover:bg-red-600 shadow-red-200'}`}
                            >
                                Confirm {statusModal.newStatus}
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={() => setStatusModal({ isOpen: false, pickupId: null, newStatus: '', note: '' })}></div>
                </div>
            )}
        </div>
    );
};

export default AllPickups;
