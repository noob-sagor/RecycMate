import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from "../../../providers/AuthProvider";
import { FaTrash, FaCheckCircle, FaExclamationTriangle, FaFlask } from 'react-icons/fa';

const DisposalManagement = () => {
    const { dbUser } = useContext(AuthContext);
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [disposalModal, setDisposalModal] = useState({ isOpen: false, pickupId: null, method: '', notes: '' });

    useEffect(() => {
        fetchPendingDisposals();
    }, []);

    const fetchPendingDisposals = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/pickups/all`);
            // Filter pickups that have breakdown but not yet disposal finalized
            const pending = res.data.filter(p => 
                p.breakdown && !p.disposal && 
                ['broken-down', 'disposition-assigned', 'in-progress'].includes(p.status)
            );
            setPickups(pending);
        } catch (error) {
            console.error("Error fetching pickups:", error);
            toast.error("Failed to fetch pickups");
        } finally {
            setLoading(false);
        }
    };

    const initiateDisposal = (pickupId) => {
        setDisposalModal({ isOpen: true, pickupId, method: '', notes: '' });
    };

    const handleFinalizeDisposal = async () => {
        if (!disposalModal.method) {
            return toast.error("Please select a disposal method");
        }

        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/pickups/disposal/${disposalModal.pickupId}`,
                {
                    disposalMethod: disposalModal.method,
                    notes: disposalModal.notes,
                    updatedBy: dbUser?.name || 'Admin'
                }
            );

            if (response.data.modifiedCount > 0) {
                toast.success("Disposal finalized successfully!");
                setDisposalModal({ isOpen: false, pickupId: null, method: '', notes: '' });
                fetchPendingDisposals();
            }
        } catch (error) {
            toast.error("Failed to finalize disposal");
            console.error(error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-40">Loading...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-green-700 mb-8 flex items-center gap-3">
                    <FaTrash /> Disposal Management
                </h1>
            </div>

            {/* Pending Disposals List */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Pending Disposals</h2>
                
                {pickups.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <FaCheckCircle className="text-5xl mx-auto mb-4 text-green-500" />
                        <p className="font-bold text-lg">No pending disposals</p>
                        <p className="text-sm">All pickups have been processed!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-auto w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Request ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Components</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pickups.map(pickup => (
                                    <tr key={pickup._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 font-mono text-xs text-gray-600">{pickup._id.slice(-8)}</td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-bold text-gray-900">{pickup.userName}</div>
                                            <div className="text-xs text-gray-500">{pickup.userEmail}</div>
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            {pickup.breakdown?.components?.length || 0} components
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-yellow-100 text-yellow-700">
                                                {pickup.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => initiateDisposal(pickup._id)}
                                                className="btn btn-sm btn-success text-white rounded-lg gap-1"
                                            >
                                                <FaTrash size={12} /> Finalize
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Disposal Modal */}
            {disposalModal.isOpen && (
                <div className="modal modal-open z-[100]">
                    <div className="modal-box rounded-3xl p-8 bg-white shadow-2xl max-w-md">
                        <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center gap-2">
                            <FaTrash className="text-orange-600" /> Finalize Disposal
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-500 ml-1 mb-2 block uppercase">Disposal Method</label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'recycle', label: 'Recycle ♻️', description: 'Send to recycling facility' },
                                        { value: 'hazardous', label: 'Hazardous Waste ⚠️', description: 'Send to hazardous waste handler' },
                                        { value: 'refurbish', label: 'Refurbish 🔧', description: 'Prepare for resale/reuse' }
                                    ].map(option => (
                                        <label key={option.value} className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                                            <input
                                                type="radio"
                                                name="disposal"
                                                value={option.value}
                                                checked={disposalModal.method === option.value}
                                                onChange={(e) => setDisposalModal({ ...disposalModal, method: e.target.value })}
                                                className="mt-1"
                                            />
                                            <div className="ml-3">
                                                <p className="font-bold text-gray-800">{option.label}</p>
                                                <p className="text-xs text-gray-500">{option.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Notes (Optional)</label>
                                <textarea
                                    value={disposalModal.notes}
                                    onChange={(e) => setDisposalModal({ ...disposalModal, notes: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none min-h-[80px]"
                                    placeholder="Add disposal notes or facility details..."
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                <p className="text-xs text-blue-700 font-medium">
                                    This action will mark the pickup as disposal-finalized. Ensure all components details are recorded.
                                </p>
                            </div>

                            <div className="modal-action mt-6 gap-3">
                                <button
                                    onClick={() => setDisposalModal({ isOpen: false, pickupId: null, method: '', notes: '' })}
                                    className="btn btn-ghost rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleFinalizeDisposal}
                                    className="btn btn-warning text-white rounded-xl shadow-lg"
                                >
                                    Finalize Disposal
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/40 backdrop-blur-sm"></div>
                </div>
            )}
        </div>
    );
};

export default DisposalManagement;
