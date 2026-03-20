import React, { useEffect, useState } from 'react';
import { FaTruck, FaClock, FaCheckCircle, FaExclamationCircle, FaEye, FaMapMarkerAlt, FaCalendarAlt, FaHistory, FaBan, FaCheckDouble } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import StatusTracker from '../../../components/StatusTracker';

const UserDashboard = () => {
    const { user } = useAuth();
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
    const [isRescheduling, setIsRescheduling] = useState(false);

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

    const handleReschedule = async () => {
        if (!rescheduleData.date || !rescheduleData.time) {
            return toast.error("Please select both date and time.");
        }
        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/pickups/reschedule/${selectedPickup._id}`, {
                preferredDate: rescheduleData.date,
                preferredTime: rescheduleData.time,
                updatedBy: user.email
            });
            if (res.data.modifiedCount > 0) {
                toast.success("Pickup rescheduled successfully!");
                const updatedPickup = { 
                    ...selectedPickup, 
                    preferredDate: rescheduleData.date, 
                    preferredTime: rescheduleData.time,
                    status: 'pending',
                    statusHistory: [
                        ...(selectedPickup.statusHistory || []),
                        {
                            status: 'rescheduled',
                            timestamp: new Date(),
                            updatedBy: user.email,
                            note: `Rescheduled to ${rescheduleData.date} at ${rescheduleData.time}`
                        }
                    ]
                };
                setPickups(pickups.map(p => p._id === selectedPickup._id ? updatedPickup : p));
                setIsRescheduling(false);
                setSelectedPickup(null);
            }
        } catch (error) {
            toast.error("Failed to reschedule.");
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this pickup request?")) return;
        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/pickups/cancel/${id}`, {
                updatedBy: user.email
            });
            if (res.data.modifiedCount > 0) {
                toast.success("Pickup cancelled.");
                setPickups(pickups.map(p => p._id === id ? { ...p, status: 'cancelled' } : p));
                setSelectedPickup(null);
            }
        } catch (error) {
            toast.error("Failed to cancel.");
        }
    };

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
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        My Recycling <span className="text-green-600">Activities</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Track your contributions to a greener planet.</p>
                </div>
                <div className="stats shadow-xl bg-white border border-gray-100 px-4">
                    <div className="stat">
                        <div className="stat-title text-gray-500 font-bold uppercase text-[10px] tracking-widest">Total Requests</div>
                        <div className="stat-value text-green-600 text-4xl">{pickups.length}</div>
                        <div className="stat-desc text-gray-400 mt-1 flex items-center gap-1 font-medium italic"><FaHistory size={10} /> Lifetime history</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-xl">
                            <FaTruck size={18} />
                        </div>
                        Recent Pickup Requests
                    </h2>
                </div>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <span className="loading loading-spinner loading-lg text-green-600"></span>
                        <p className="text-gray-400 font-medium animate-pulse">Loading your activities...</p>
                    </div>
                ) : pickups.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full border-collapse">
                            <thead className="bg-gray-50/50">
                                <tr className="text-gray-500 uppercase text-[10px] tracking-widest font-bold">
                                    <th className="py-5 pl-8">Items & Quantities</th>
                                    <th>Logistics</th>
                                    <th className="text-center">Status</th>
                                    <th>Requested On</th>
                                    <th className="pr-8 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {pickups.map((pickup) => (
                                    <tr key={pickup._id} className="hover:bg-green-50/30 transition-all group">
                                        <td className="py-5 pl-8">
                                            <div className="flex flex-col gap-1.5">
                                                {pickup.items?.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                        <span className="font-bold text-gray-700 text-sm">{item.category}</span>
                                                        <span className="text-gray-400 text-xs font-medium">x {item.quantity}</span>
                                                    </div>
                                                )) || <span className="text-gray-400 italic">No items listed</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                                                    <FaCalendarAlt className="text-green-500" size={12} />
                                                    {pickup.preferredDate}
                                                </div>
                                                <div className="text-gray-500 text-xs font-medium ml-5 italic">
                                                    at {pickup.preferredTime}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-400 text-xs mt-1 truncate max-w-[200px]">
                                                    <FaMapMarkerAlt className="text-gray-300" size={12} />
                                                    {pickup.address}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            {getStatusBadge(pickup.status)}
                                        </td>
                                        <td className="text-sm font-medium text-gray-500">
                                            {new Date(pickup.createdAt).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="pr-8 text-right">
                                            <button 
                                                onClick={() => setSelectedPickup(pickup)}
                                                className="btn btn-sm btn-circle btn-ghost text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm border border-green-100"
                                                title="View Details"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-20 text-center bg-gray-50/10">
                        <div className="flex justify-center mb-6 text-green-100">
                            <div className="relative">
                                <FaTruck size={80} />
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full border-4 border-white"></div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-gray-800">No requests yet</h3>
                        <p className="text-gray-500 mt-2 max-w-xs mx-auto font-medium">Your recycling history is currently empty. Start making an impact today!</p>
                        <button 
                            onClick={() => window.location.href = '/pickup-request'}
                            className="btn bg-green-600 hover:bg-green-700 text-white mt-8 px-8 rounded-xl shadow-lg shadow-green-200 border-none normal-case"
                        >
                            Schedule First Pickup
                        </button>
                    </div>
                )}
            </div>

            {/* Details Modal */}
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
                            {/* Real-time Status Tracker */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-2">
                                    <div className="h-[1px] w-8 bg-gray-200"></div> Real-time Status Tracker
                                </h4>
                                <StatusTracker currentStatus={selectedPickup.status} statusHistory={selectedPickup.statusHistory} />
                            </div>

                            {/* Summary Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                    <div className="mt-1">{getStatusBadge(selectedPickup.status)}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Preferred Date & Time</p>
                                    <p className="font-bold text-gray-800 flex items-center gap-2 mt-1">
                                        <FaCalendarAlt className="text-green-500" />
                                        {selectedPickup.preferredDate} <span className="text-gray-400 font-normal">|</span> {selectedPickup.preferredTime}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 sm:col-span-2 lg:col-span-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Requested On</p>
                                    <p className="font-bold text-gray-800 mt-1">
                                        {new Date(selectedPickup.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {selectedPickup.status === 'pending' && (
                                <div className="flex flex-wrap gap-4 pt-2">
                                    <button 
                                        onClick={() => setIsRescheduling(true)}
                                        className="btn btn-outline btn-success rounded-xl flex-1 gap-2 border-2"
                                    >
                                        <FaCalendarAlt /> Reschedule
                                    </button>
                                    <button 
                                        onClick={() => handleCancel(selectedPickup._id)}
                                        className="btn btn-outline btn-error rounded-xl flex-1 gap-2 border-2"
                                    >
                                        <FaBan /> Cancel Request
                                    </button>
                                </div>
                            )}

                            {/* Collector Details (Checklist/Inspection) if available */}
                            {(selectedPickup.checklist || selectedPickup.inspection) && (
                                <div className="space-y-6 bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                                        <div className="h-[1px] w-8 bg-blue-200"></div> Collector Updates
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {selectedPickup.checklist && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                    <FaCheckCircle className="text-green-500" /> Pickup Checklist
                                                </p>
                                                <ul className="text-xs text-gray-500 space-y-1 ml-6 list-disc">
                                                    {selectedPickup.checklist.items?.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {selectedPickup.inspection && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                    <FaCheckDouble className="text-blue-500" /> Inspection Report
                                                </p>
                                                <div className="ml-6 space-y-1">
                                                    <p className="text-xs font-bold text-gray-600">Condition: <span className="text-blue-600">{selectedPickup.inspection.condition}</span></p>
                                                    <p className="text-xs text-gray-500 italic">"{selectedPickup.inspection.notes}"</p>
                                                </div>
                                            </div>
                                        )}
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

                            {/* Detailed Activity Log */}
                            {selectedPickup.statusHistory && selectedPickup.statusHistory.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                        <div className="h-[1px] w-8 bg-gray-200"></div> Detailed Activity Log
                                    </h4>
                                    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                                        <ul className="divide-y divide-gray-50">
                                            {[...selectedPickup.statusHistory].reverse().map((history, idx) => (
                                                <li key={idx} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                            idx === 0 ? 'bg-green-100 text-green-600 shadow-sm' : 'bg-gray-100 text-gray-400'
                                                        }`}>
                                                            {idx === 0 ? <FaCheckCircle size={14} /> : <FaHistory size={12} />}
                                                        </div>
                                                        {idx !== selectedPickup.statusHistory.length - 1 && (
                                                            <div className="w-[2px] h-full bg-gray-100 mt-2"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start gap-4">
                                                            <p className={`text-sm font-bold capitalize ${idx === 0 ? 'text-green-700' : 'text-gray-700'}`}>
                                                                {history.status}
                                                            </p>
                                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                                {new Date(history.timestamp).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1 font-medium italic">
                                                            <span className="opacity-50">by</span> {history.updatedBy}
                                                        </p>
                                                        {history.note && (
                                                            <div className="mt-2 text-[11px] bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-gray-600 font-medium">
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
                        </div>
                        
                        <div className="modal-action p-6 bg-gray-50/50 border-t border-gray-100">
                            <button onClick={() => setSelectedPickup(null)} className="btn btn-ghost hover:bg-gray-200 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px]">Close Details</button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPickup(null)}></div>
                </div>
            )}
            {/* Reschedule Modal */}
            {isRescheduling && (
                <div className="modal modal-open z-[100]">
                    <div className="modal-box rounded-3xl p-8 bg-white shadow-2xl relative z-[110]">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FaCalendarAlt className="text-green-600" /> Reschedule Pickup
                        </h3>
                        <div className="space-y-6">
                            <div className="relative group">
                                <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Preferred Date</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500" />
                                    <input 
                                        type="date" 
                                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" 
                                        value={rescheduleData.date}
                                        onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="relative group">
                                <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Preferred Time</label>
                                <div className="relative">
                                    <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500" />
                                    <input 
                                        type="time" 
                                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" 
                                        value={rescheduleData.time}
                                        onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-action mt-8 gap-4">
                            <button onClick={() => setIsRescheduling(false)} className="btn btn-ghost rounded-xl px-8">Cancel</button>
                            <button onClick={handleReschedule} className="btn btn-success text-white rounded-xl px-8 shadow-lg shadow-green-200">Confirm</button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={() => setIsRescheduling(false)}></div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
