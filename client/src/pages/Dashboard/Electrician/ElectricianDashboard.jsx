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
        battery: 'functional',
        pcb: 'functional',
        screen: 'functional',
        casing: 'functional',
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
                setBreakdownData({ battery: 'functional', pcb: 'functional', screen: 'functional', casing: 'functional', notes: '' });
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
                            <p className="text-sm text-gray-500 font-medium px-1">Select the disposition for each component found in this device:</p>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 pr-2 custom-scrollbar">
                                {[
                                    { id: 'battery', name: 'Battery', icon: <FaBatteryFull className="text-green-600" /> },
                                    { id: 'pcb', name: 'PCB / Motherboard', icon: <FaMicrochip className="text-blue-600" /> },
                                    { id: 'screen', name: 'Screen / Display', icon: <FaDesktop className="text-purple-600" /> },
                                    { id: 'casing', name: 'Outer Casing', icon: <FaBoxOpen className="text-orange-600" /> }
                                ].map((component) => (
                                    <div key={component.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            {component.icon}
                                            <span className="font-bold text-gray-800 text-sm">{component.name}</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {['functional', 'repairable', 'resellable', 'waste'].map((disposition) => (
                                                <button
                                                    key={disposition}
                                                    type="button"
                                                    onClick={() => setBreakdownData({ ...breakdownData, [component.id]: disposition })}
                                                    className={`btn btn-xs h-9 rounded-xl font-bold capitalize border-none transition-all ${breakdownData[component.id] === disposition 
                                                        ? 'bg-green-600 text-white shadow-md shadow-green-100' 
                                                        : 'bg-white text-gray-400 hover:bg-gray-100'}`}
                                                >
                                                    {disposition}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Technical Notes</label>
                                    <textarea
                                        className="textarea textarea-bordered w-full h-24 rounded-2xl focus:ring-4 ring-green-50 border-gray-100 text-sm"
                                        placeholder="Add any specific component details or damage notes..."
                                        value={breakdownData.notes}
                                        onChange={(e) => setBreakdownData({ ...breakdownData, notes: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="modal-action mt-8 gap-3">
                            <button onClick={() => setShowBreakdown(false)} className="btn btn-ghost px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest">Cancel</button>
                            <button onClick={handleBreakdownSubmit} className="btn btn-success text-white px-8 rounded-2xl shadow-xl shadow-green-200 font-bold border-none">Submit Breakdown</button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={() => setShowBreakdown(false)}></div>
                </div>
            )}
        </div>
    );
};

export default ElectricianDashboard;
