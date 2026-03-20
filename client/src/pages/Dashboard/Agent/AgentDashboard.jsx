import React, { useEffect, useState } from 'react';
import { FaTruck, FaMapMarkerAlt, FaClock, FaCheckCircle, FaCheckDouble, FaCamera, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';

const AgentDashboard = () => {
    const { user, dbUser } = useAuth();
    const [assignedPickups, setAssignedPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAvailable, setIsAvailable] = useState(dbUser?.isAvailable || false);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [showChecklist, setShowChecklist] = useState(false);
    const [showInspection, setShowInspection] = useState(false);

    // Checklist state
    const [checklistItems, setChecklistItems] = useState([
        "Verify item categories and quantities",
        "Check for hazardous leaks or damage",
        "Confirm user identity and address",
        "Ensure items are properly packed for transport"
    ]);
    const [completedChecklist, setCompletedChecklist] = useState([]);

    // Inspection state
    const [inspectionData, setInspectionData] = useState({ notes: '', condition: 'Working' });

    useEffect(() => {
        const fetchAssignedPickups = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/pickups/all`);
                // Filter for 'assigned' status (In a real app, filter by agentEmail)
                setAssignedPickups(res.data.filter(p => p.status !== 'completed' && p.status !== 'cancelled'));
            } catch (error) {
                console.error("Error fetching assigned pickups:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignedPickups();
    }, []);

    const toggleAvailability = async () => {
        try {
            const newStatus = !isAvailable;
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/users/availability/${user.email}`, {
                isAvailable: newStatus
            });
            if (res.data.modifiedCount > 0) {
                setIsAvailable(newStatus);
                toast.success(`You are now ${newStatus ? 'Available' : 'Unavailable'}`);
            }
        } catch (error) {
            toast.error("Failed to update availability");
        }
    };

    const handleChecklistSubmit = async () => {
        if (completedChecklist.length !== checklistItems.length) {
            return toast.error("Please complete all checklist items.");
        }
        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/pickups/checklist/${selectedPickup._id}`, {
                checklist: { items: completedChecklist },
                updatedBy: user.email
            });
            if (res.data.modifiedCount > 0) {
                toast.success("Checklist submitted. Status: Collector Arrived");
                setAssignedPickups(assignedPickups.map(p => p._id === selectedPickup._id ? { ...p, status: 'collector-arrived' } : p));
                setShowChecklist(false);
                setCompletedChecklist([]);
            }
        } catch (error) {
            toast.error("Failed to submit checklist.");
        }
    };

    const handleInspectionSubmit = async () => {
        if (!inspectionData.notes) return toast.error("Please add inspection notes.");
        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/pickups/inspection/${selectedPickup._id}`, {
                inspection: { ...inspectionData },
                updatedBy: user.email
            });
            if (res.data.modifiedCount > 0) {
                toast.success("Inspection report submitted. Status: Inspected");
                setAssignedPickups(assignedPickups.map(p => p._id === selectedPickup._id ? { ...p, status: 'inspected' } : p));
                setShowInspection(false);
                setInspectionData({ notes: '', condition: 'Working' });
            }
        } catch (error) {
            toast.error("Failed to submit inspection.");
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/pickups/status/${id}`, {
                status,
                updatedBy: user.email
            });
            if (res.data.modifiedCount > 0) {
                toast.success(`Status updated to ${status}`);
                setAssignedPickups(assignedPickups.map(p => p._id === id ? { ...p, status } : p));
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Agent <span className="text-blue-600">Dashboard</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your collection tasks and availability.</p>
                </div>
                
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <span className={`text-xs font-bold uppercase tracking-widest ${isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                        {isAvailable ? 'Available for tasks' : 'Offline'}
                    </span>
                    <input 
                        type="checkbox" 
                        className="toggle toggle-success toggle-lg" 
                        checked={isAvailable}
                        onChange={toggleAvailability}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-inner">
                            <FaTruck size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Active Tasks</p>
                            <h3 className="text-3xl font-black text-blue-700">{assignedPickups.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl shadow-inner">
                            <FaMapMarkerAlt size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Assigned Route</p>
                            <h3 className="text-lg font-bold text-green-700">Metro City Area</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <FaClipboardList className="text-blue-600" /> Assigned Collection Requests
                    </h2>
                </div>

                {loading ? (
                    <div className="p-20 flex justify-center">
                        <span className="loading loading-spinner loading-lg text-blue-600"></span>
                    </div>
                ) : assignedPickups.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full border-collapse">
                            <thead className="bg-gray-50/50">
                                <tr className="text-gray-500 uppercase text-[10px] tracking-widest font-bold">
                                    <th className="py-5 pl-8">Customer & Address</th>
                                    <th>Schedule</th>
                                    <th className="text-center">Status</th>
                                    <th className="pr-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {assignedPickups.map((pickup) => (
                                    <tr key={pickup._id} className="hover:bg-blue-50/30 transition-all group">
                                        <td className="py-5 pl-8">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{pickup.userName}</span>
                                                <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <FaMapMarkerAlt className="text-red-400" size={10} />
                                                    {pickup.address}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col text-xs">
                                                <span className="font-bold text-gray-700">{pickup.preferredDate}</span>
                                                <span className="text-gray-400 italic">at {pickup.preferredTime}</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge py-3 px-4 font-bold capitalize text-[10px] ${
                                                pickup.status === 'pending' ? 'badge-warning' : 
                                                pickup.status === 'assigned' ? 'badge-info' : 
                                                'badge-success text-white'
                                            }`}>
                                                {pickup.status}
                                            </span>
                                        </td>
                                        <td className="pr-8 text-right">
                                            <div className="flex justify-end gap-2">
                                                {pickup.status === 'assigned' && (
                                                    <button 
                                                        onClick={() => { setSelectedPickup(pickup); setShowChecklist(true); }}
                                                        className="btn btn-xs btn-primary rounded-lg shadow-sm"
                                                    >
                                                        Checklist
                                                    </button>
                                                )}
                                                {pickup.status === 'collector-arrived' && (
                                                    <button 
                                                        onClick={() => { setSelectedPickup(pickup); setShowInspection(true); }}
                                                        className="btn btn-xs btn-info text-white rounded-lg shadow-sm"
                                                    >
                                                        Inspection
                                                    </button>
                                                )}
                                                {pickup.status === 'inspected' && (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(pickup._id, 'completed')}
                                                        className="btn btn-xs btn-success text-white rounded-lg shadow-sm"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                                <button className="btn btn-xs btn-ghost btn-circle text-blue-600 hover:bg-blue-100">
                                                    <FaClock />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <FaExclamationTriangle className="mx-auto text-gray-200" size={60} />
                        <h3 className="text-xl font-bold text-gray-700 mt-4">No tasks available</h3>
                        <p className="text-gray-500">Enable availability to receive new collection requests.</p>
                    </div>
                )}
            </div>

            {/* Checklist Modal */}
            {showChecklist && (
                <div className="modal modal-open z-[60]">
                    <div className="modal-box rounded-3xl p-8 bg-white max-w-md max-h-[90vh] overflow-y-auto relative">
                        <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                            <FaClipboardList className="text-blue-600" /> Collector Checklist
                        </h3>
                        <div className="space-y-4">
                            {checklistItems.map((item, idx) => (
                                <label key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors group">
                                    <input 
                                        type="checkbox" 
                                        className="checkbox checkbox-primary" 
                                        onChange={(e) => {
                                            if (e.target.checked) setCompletedChecklist([...completedChecklist, item]);
                                            else setCompletedChecklist(completedChecklist.filter(i => i !== item));
                                        }}
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{item}</span>
                                </label>
                            ))}
                        </div>
                        <div className="modal-action mt-8 gap-4">
                            <button onClick={() => { setShowChecklist(false); setCompletedChecklist([]); }} className="btn btn-ghost px-8 rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancel</button>
                            <button onClick={handleChecklistSubmit} className="btn btn-primary px-8 rounded-xl shadow-lg shadow-blue-200">Submit Checklist</button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={() => { setShowChecklist(false); setCompletedChecklist([]); }}></div>
                </div>
            )}

            {/* Inspection Modal */}
            {showInspection && (
                <div className="modal modal-open z-[60]">
                    <div className="modal-box rounded-3xl p-8 bg-white max-w-lg max-h-[90vh] overflow-y-auto relative">
                        <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                            <FaCheckDouble className="text-info" /> Inspection Form
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Device Condition</label>
                                <select 
                                    className="select select-bordered w-full rounded-xl focus:ring-2 ring-info/20"
                                    value={inspectionData.condition}
                                    onChange={(e) => setInspectionData({ ...inspectionData, condition: e.target.value })}
                                >
                                    <option>Working</option>
                                    <option>Minor Damage</option>
                                    <option>Major Damage</option>
                                    <option>Non-Functional</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Inspection Notes</label>
                                <textarea 
                                    className="textarea textarea-bordered w-full h-32 rounded-xl focus:ring-2 ring-info/20" 
                                    placeholder="Enter basic test results and notes..."
                                    value={inspectionData.notes}
                                    onChange={(e) => setInspectionData({ ...inspectionData, notes: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-info hover:bg-info/5 transition-all cursor-pointer group">
                                <FaCamera size={32} className="mx-auto text-gray-300 group-hover:text-info mb-2" />
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add Device Photos</p>
                            </div>
                        </div>
                        <div className="modal-action mt-8 gap-4">
                            <button onClick={() => setShowInspection(false)} className="btn btn-ghost px-8 rounded-xl font-bold uppercase tracking-widest text-[10px]">Back</button>
                            <button onClick={handleInspectionSubmit} className="btn btn-info text-white px-8 rounded-xl shadow-lg shadow-info/30">Submit Report</button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={() => setShowInspection(false)}></div>
                </div>
            )}
        </div>
    );
};

export default AgentDashboard;
