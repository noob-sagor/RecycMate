import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from "../../../providers/AuthProvider";
import { FaTrash, FaPlus, FaBox, FaCheckCircle, FaExclamationCircle, FaTruck } from 'react-icons/fa';

const InventoryLedger = () => {
    const { dbUser } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        componentType: '',
        quantity: 1,
        condition: 'good',
        source: 'pickup',
        notes: ''
    });

    useEffect(() => {
        fetchInventory();
        fetchSummary();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/inventory`);
            setInventory(res.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            toast.error("Failed to fetch inventory");
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/inventory/summary`);
            setSummary(res.data);
        } catch (error) {
            console.error("Error fetching inventory summary:", error);
        }
    };

    const handleAddEntry = async (e) => {
        e.preventDefault();
        
        if (!formData.componentType || formData.quantity < 1) {
            return toast.error("Component type and quantity are required");
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/inventory`, {
                ...formData,
                recordedBy: dbUser?.name || 'Warehouse Staff'
            });
            
            toast.success("Inventory entry added successfully!");
            setShowModal(false);
            setFormData({ componentType: '', quantity: 1, condition: 'good', source: 'pickup', notes: '' });
            fetchInventory();
            fetchSummary();
        } catch (error) {
            toast.error("Failed to add inventory entry");
            console.error(error);
        }
    };

    const handleUpdateQuantity = async (id, change, reason) => {
        if (!reason) {
            return toast.error("Reason is required");
        }

        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/inventory/${id}`, {
                quantityChange: change,
                reason,
                updatedBy: dbUser?.name || 'Warehouse Staff'
            });

            toast.success("Inventory updated successfully!");
            fetchInventory();
            fetchSummary();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update inventory");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-40">Loading inventory...</div>;
    }

    const componentTypes = [
        'Battery', 'PCB/Motherboard', 'Screen/Display', 'Outer Casing', 
        'Charger', 'Storage', 'Camera', 'Other'
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-green-700 mb-8 flex items-center gap-3">
                    <FaBox /> Basic Inventory Ledger
                </h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summary.map(item => (
                    <div key={item._id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{item._id}</p>
                        <div className="space-y-2">
                            <p className="text-2xl font-bold text-green-600">{item.totalQuantity}</p>
                            <p className="text-xs text-gray-500">
                                <span className="font-bold text-green-600">{item.storedCount}</span> Stored • 
                                <span className="font-bold text-blue-600 ml-1">{item.soldCount}</span> Sold
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Button */}
            <button
                onClick={() => setShowModal(true)}
                className="btn btn-success text-white rounded-xl gap-2 shadow-lg"
            >
                <FaPlus /> Add Inventory Entry
            </button>

            {/* Inventory Table */}
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border p-6">
                <table className="table-auto w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Component</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Condition</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {inventory.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-gray-400">No inventory entries found</td>
                            </tr>
                        ) : (
                            inventory.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4 font-bold text-gray-800">{item.componentType}</td>
                                    <td className="px-4 py-4 text-lg font-bold text-green-600">{item.quantity}</td>
                                    <td className="px-4 py-4 text-sm text-gray-600 capitalize">{item.condition}</td>
                                    <td className="px-4 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                            item.status === 'stored' ? 'bg-blue-100 text-blue-700' :
                                            item.status === 'sold' ? 'bg-green-100 text-green-700' :
                                            item.status === 'consumed' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-600 capitalize">{item.source}</td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleUpdateQuantity(item._id, -1, 'sold')}
                                                className="btn btn-sm btn-outline btn-error rounded-md"
                                                title="Decrease (Sold)"
                                            >
                                                -
                                            </button>
                                            <button
                                                onClick={() => handleUpdateQuantity(item._id, 1, 'restocked')}
                                                className="btn btn-sm btn-outline btn-success rounded-md"
                                                title="Increase (Restocked)"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Entry Modal */}
            {showModal && (
                <div className="modal modal-open z-[100]">
                    <div className="modal-box rounded-3xl p-8 bg-white shadow-2xl max-w-md">
                        <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center gap-2">
                            <FaPlus className="text-green-600" /> Add Inventory Entry
                        </h3>
                        
                        <form onSubmit={handleAddEntry} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Component Type</label>
                                <select
                                    value={formData.componentType}
                                    onChange={(e) => setFormData({ ...formData, componentType: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                                >
                                    <option value="">Select Component</option>
                                    {componentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Condition</label>
                                <select
                                    value={formData.condition}
                                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                                >
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="damaged">Damaged</option>
                                    <option value="broken">Broken</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Source</label>
                                <select
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                                >
                                    <option value="pickup">Pickup</option>
                                    <option value="refurbishment">Refurbishment</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Notes (Optional)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none min-h-[80px]"
                                    placeholder="Add any notes..."
                                />
                            </div>

                            <div className="modal-action mt-6 gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost rounded-xl">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-success text-white rounded-xl shadow-lg">
                                    Add Entry
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                </div>
            )}
        </div>
    );
};

export default InventoryLedger;
