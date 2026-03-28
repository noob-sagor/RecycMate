import React, { useEffect, useState } from 'react';
import { FaMicrochip, FaBatteryFull, FaDesktop, FaBoxOpen, FaClipboardList, FaCheckCircle, FaExclamationTriangle, FaTools } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';

const ElectricianDashboard = () => {
    const { user } = useAuth();
    const [assignedPickups, setAssignedPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [breakdownData, setBreakdownData] = useState({
        battery: false,
        pcb: false,
        screen: false,
        casing: false,
        notes: ''
    });

    useEffect(() => {
        const fetchPickups = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/pickups/all`);
                // Electricians typically handle pickups that are 'inspected' or 'collector-arrived'
                setAssignedPickups(res.data.filter(p => !['completed', 'cancelled', 'broken-down'].includes(p.status)));
            } catch (error) {
                console.error("Error fetching pickups:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPickups();
    }, []);

    const handleBreakdownSubmit = async () => {
        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/pickups/breakdown/${selectedPickup._id}`, {
                breakdown: breakdownData,
                updatedBy: user.email
            });
            if (res.data.modifiedCount > 0) {
                toast.success("Component breakdown submitted successfully!");
                setAssignedPickups(assignedPickups.map(p => p._id === selectedPickup._id ? { ...p, status: 'broken-down' } : p));
                setShowBreakdown(false);
                setBreakdownData({ battery: false, pcb: false, screen: false, casing: false, notes: '' });
            }
        } catch (error) {
            toast.error("Failed to submit breakdown.");
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Electrician <span className="text-green-600">Workstation</span>
                </h1>
                <p className="text-gray-500 mt-1">Record micro-component breakdowns for collected e-waste.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <FaTools size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Pending Breakdowns</p>
                            <h3 className="text-3xl font-black text-green-700">{assignedPickups.filter(p => p.status === 'inspected' || p.status === 'collector-arrived').length}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <FaClipboardList className="text-green-600" /> Devices Awaiting Breakdown
                    </h2>
                </div>

                {loading ? (
                    <div className="p-20 flex justify-center">
                        <span className="loading loading-spinner loading-lg text-green-600"></span>
                    </div>
                ) : assignedPickups.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold">
                                    <th className="py-5 pl-8">Device Type</th>
                                    <th>Current Status</th>
                                    <th className="pr-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedPickups.map((pickup) => (
                                    <tr key={pickup._id} className="hover:bg-green-50/30 transition-all">
                                        <td className="py-5 pl-8 font-bold text-gray-800">
                                            {pickup.items?.[0]?.category || 'Electronic Device'}
                                        </td>
                                        <td>
                                            <span className={`badge py-3 px-4 font-bold capitalize text-[10px] ${pickup.status === 'inspected' ? 'badge-success text-white' : 'badge-ghost'
                                                }`}>
                                                {pickup.status}
                                            </span>
                                        </td>
                                        <td className="pr-8 text-right">
                                            <button
                                                onClick={() => { setSelectedPickup(pickup); setShowBreakdown(true); }}
                                                className="btn btn-sm btn-green bg-green-600 hover:bg-green-700 text-white border-none rounded-xl font-bold"
                                            >
                                                Start Breakdown
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <FaExclamationTriangle className="mx-auto text-gray-200" size={60} />
                        <h3 className="text-xl font-bold text-gray-700 mt-4">No devices to breakdown</h3>
                        <p className="text-gray-500">Pickups will appear here once they are inspected.</p>
                    </div>
                )}
            </div>

            {/* Breakdown Modal */}
            {showBreakdown && (
                <div className="modal modal-open z-[60]">
                    <div className="modal-box rounded-3xl p-8 bg-white max-w-lg relative">
                        <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                            <FaMicrochip className="text-green-600" /> Component Breakdown
                        </h3>
                        <div className="space-y-6">
                            <p className="text-sm text-gray-500 font-medium">Select the components present and functional in this device:</p>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-green-50 transition-all">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-success"
                                        checked={breakdownData.battery}
                                        onChange={(e) => setBreakdownData({ ...breakdownData, battery: e.target.checked })}
                                    />
                                    <div className="flex items-center gap-2">
                                        <FaBatteryFull className="text-green-600" />
                                        <span className="text-sm font-bold">Battery</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-green-50 transition-all">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-success"
                                        checked={breakdownData.pcb}
                                        onChange={(e) => setBreakdownData({ ...breakdownData, pcb: e.target.checked })}
                                    />
                                    <div className="flex items-center gap-2">
                                        <FaMicrochip className="text-blue-600" />
                                        <span className="text-sm font-bold">PCB / Motherboard</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-green-50 transition-all">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-success"
                                        checked={breakdownData.screen}
                                        onChange={(e) => setBreakdownData({ ...breakdownData, screen: e.target.checked })}
                                    />
                                    <div className="flex items-center gap-2">
                                        <FaDesktop className="text-purple-600" />
                                        <span className="text-sm font-bold">Screen / Display</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-green-50 transition-all">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-success"
                                        checked={breakdownData.casing}
                                        onChange={(e) => setBreakdownData({ ...breakdownData, casing: e.target.checked })}
                                    />
                                    <div className="flex items-center gap-2">
                                        <FaBoxOpen className="text-orange-600" />
                                        <span className="text-sm font-bold">Outer Casing</span>
                                    </div>
                                </label>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Technical Notes</label>
                                <textarea
                                    className="textarea textarea-bordered w-full h-24 rounded-xl focus:ring-2 ring-green-100"
                                    placeholder="Add any specific component details or damage notes..."
                                    value={breakdownData.notes}
                                    onChange={(e) => setBreakdownData({ ...breakdownData, notes: e.target.value })}
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-action mt-8 gap-4">
                            <button onClick={() => setShowBreakdown(false)} className="btn btn-ghost px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest">Cancel</button>
                            <button onClick={handleBreakdownSubmit} className="btn btn-success text-white px-8 rounded-xl shadow-lg shadow-green-200">Submit Breakdown</button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={() => setShowBreakdown(false)}></div>
                </div>
            )}
        </div>
    );
};

export default ElectricianDashboard;
