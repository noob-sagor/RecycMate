import React, { useEffect, useState } from 'react';
import { FaMicrochip, FaBatteryFull, FaDesktop, FaBoxOpen, FaClipboardList, FaCheckCircle, FaExclamationTriangle, FaTools, FaTrash, FaPlus } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';

const ElectricianDashboard = () => {
    const { user } = useAuth();
    const [assignedPickups, setAssignedPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [showBreakdown, setShowBreakdown] = useState(false);
    
    // Feature 9 & 10: Component breakdown with dispositions
    const [components, setComponents] = useState([]);
    const [newComponent, setNewComponent] = useState({
        type: 'battery',
        name: 'Battery',
        quantity: 1,
        condition: 'unknown',
        disposition: 'unknown',
        notes: ''
    });
    const [technicalNotes, setTechnicalNotes] = useState('');

    // Component types mapping
    const componentTypes = {
        battery: { name: 'Battery', icon: FaBatteryFull, color: 'text-green-600' },
        pcb: { name: 'PCB / Motherboard', icon: FaMicrochip, color: 'text-blue-600' },
        screen: { name: 'Screen / Display', icon: FaDesktop, color: 'text-purple-600' },
        casing: { name: 'Outer Casing', icon: FaBoxOpen, color: 'text-orange-600' },
        charger: { name: 'Charger / Power Adapter', icon: FaMicrochip, color: 'text-yellow-600' },
        storage: { name: 'Storage / Hard Drive', icon: FaMicrochip, color: 'text-indigo-600' },
        camera: { name: 'Camera Module', icon: FaMicrochip, color: 'text-pink-600' },
        other: { name: 'Other Component', icon: FaMicrochip, color: 'text-gray-600' }
    };

    const dispositionOptions = [
        { value: 'unknown', label: 'Unknown', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
        { value: 'functional', label: 'Functional', bgColor: 'bg-green-100', textColor: 'text-green-700' },
        { value: 'repairable', label: 'Repairable', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
        { value: 'resellable', label: 'Resellable', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
        { value: 'waste', label: 'Waste / Dispose', bgColor: 'bg-red-100', textColor: 'text-red-700' }
    ];

    const conditionOptions = [
        { value: 'unknown', label: 'Unknown' },
        { value: 'excellent', label: 'Excellent' },
        { value: 'good', label: 'Good' },
        { value: 'damaged', label: 'Damaged' },
        { value: 'broken', label: 'Broken' }
    ];

    useEffect(() => {
        const fetchPickups = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/pickups/all`);
                setAssignedPickups(res.data.filter(p => !['completed', 'cancelled', 'disposition-assigned'].includes(p.status)));
            } catch (error) {
                console.error("Error fetching pickups:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPickups();
    }, []);

    const handleAddComponent = () => {
        if (!newComponent.type || newComponent.quantity < 1) {
            toast.error('Please select component type and quantity');
            return;
        }
        
        const component = {
            ...newComponent,
            id: Date.now()
        };
        
        setComponents([...components, component]);
        setNewComponent({
            type: 'battery',
            name: 'Battery',
            quantity: 1,
            condition: 'unknown',
            disposition: 'unknown',
            notes: ''
        });
        toast.success('Component added!');
    };

    const handleRemoveComponent = (id) => {
        setComponents(components.filter(c => c.id !== id));
        toast.success('Component removed!');
    };

    const handleUpdateComponent = (id, field, value) => {
        setComponents(components.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    const handleComponentTypeChange = (type) => {
        const componentInfo = componentTypes[type];
        setNewComponent({
            ...newComponent,
            type,
            name: componentInfo.name
        });
    };

    const handleBreakdownSubmit = async () => {
        try {
            if (components.length === 0) {
                toast.error('Please add at least one component!');
                return;
            }

            // First submit: Component breakdown recording
            const breakdownRes = await axios.patch(
                `${import.meta.env.VITE_API_URL}/pickups/breakdown/${selectedPickup._id}`,
                {
                    breakdown: { components, notes: technicalNotes, type: 'detailed' },
                    updatedBy: user.email
                }
            );

            if (breakdownRes.data.modifiedCount > 0) {
                // Second submit: Component dispositions assignment
                const dispositionRes = await axios.patch(
                    `${import.meta.env.VITE_API_URL}/pickups/dispositions/${selectedPickup._id}`,
                    {
                        components: components,
                        updatedBy: user.email
                    }
                );

                if (dispositionRes.data.modifiedCount > 0) {
                    toast.success('Component breakdown and dispositions recorded successfully!');
                    setAssignedPickups(assignedPickups.map(p =>
                        p._id === selectedPickup._id ? { ...p, status: 'disposition-assigned' } : p
                    ));
                    setShowBreakdown(false);
                    resetForm();
                } else {
                    throw new Error('Failed to record dispositions');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit breakdown.');
        }
    };

    const resetForm = () => {
        setComponents([]);
        setNewComponent({
            type: 'battery',
            name: 'Battery',
            quantity: 1,
            condition: 'unknown',
            disposition: 'unknown',
            notes: ''
        });
        setTechnicalNotes('');
    };

    const handleOpenBreakdown = (pickup) => {
        setSelectedPickup(pickup);
        setShowBreakdown(true);
        resetForm();
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
                                                onClick={() => handleOpenBreakdown(pickup)}
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

            {/* Enhanced Component Breakdown Modal - Features 9 & 10 */}
            {showBreakdown && (
                <div className="modal modal-open z-[60]">
                    <div className="modal-box rounded-3xl p-8 bg-white max-w-4xl relative max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-black text-gray-800 mb-2 flex items-center gap-3">
                            <FaMicrochip className="text-green-600" /> Micro-Component Breakdown & Disposition
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">Feature 9 & 10: Record components and assign disposition (functional, repairable, resellable, waste)</p>

                        <div className="space-y-8">
                            {/* Component Addition Section */}
                            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl border-2 border-green-200">
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaPlus className="text-green-600" /> Add Component
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Component Type Selector */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-2">Component Type</label>
                                        <select
                                            value={newComponent.type}
                                            onChange={(e) => handleComponentTypeChange(e.target.value)}
                                            className="select select-bordered w-full rounded-xl bg-white focus:ring-2 ring-green-300"
                                        >
                                            {Object.entries(componentTypes).map(([key, value]) => (
                                                <option key={key} value={key}>{value.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Quantity */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-2">Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={newComponent.quantity}
                                            onChange={(e) => setNewComponent({ ...newComponent, quantity: parseInt(e.target.value) })}
                                            className="input input-bordered w-full rounded-xl focus:ring-2 ring-green-300"
                                        />
                                    </div>

                                    {/* Condition */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-2">Condition</label>
                                        <select
                                            value={newComponent.condition}
                                            onChange={(e) => setNewComponent({ ...newComponent, condition: e.target.value })}
                                            className="select select-bordered w-full rounded-xl bg-white focus:ring-2 ring-green-300"
                                        >
                                            {conditionOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Disposition */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-2">Disposition</label>
                                        <select
                                            value={newComponent.disposition}
                                            onChange={(e) => setNewComponent({ ...newComponent, disposition: e.target.value })}
                                            className="select select-bordered w-full rounded-xl bg-white focus:ring-2 ring-green-300"
                                        >
                                            {dispositionOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Notes for Component */}
                                <div className="mb-4">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-2">Component Notes (Optional)</label>
                                    <textarea
                                        placeholder="Any specific details about this component..."
                                        value={newComponent.notes}
                                        onChange={(e) => setNewComponent({ ...newComponent, notes: e.target.value })}
                                        className="textarea textarea-bordered w-full h-16 rounded-xl focus:ring-2 ring-green-300"
                                    />
                                </div>

                                <button
                                    onClick={handleAddComponent}
                                    className="btn btn-success text-white w-full gap-2 rounded-xl font-bold"
                                >
                                    <FaPlus /> Add This Component
                                </button>
                            </div>

                            {/* Components List */}
                            {components.length > 0 ? (
                                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                                    <h4 className="text-lg font-bold text-gray-800 mb-4">Added Components ({components.length})</h4>
                                    <div className="overflow-x-auto">
                                        <table className="table w-full text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="font-bold">Component</th>
                                                    <th className="font-bold">Qty</th>
                                                    <th className="font-bold">Condition</th>
                                                    <th className="font-bold">Disposition</th>
                                                    <th className="font-bold text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {components.map(comp => {
                                                    const disposition = dispositionOptions.find(d => d.value === comp.disposition);
                                                    return (
                                                        <tr key={comp.id} className="hover:bg-gray-50">
                                                            <td className="font-bold text-gray-700">{comp.name}</td>
                                                            <td className="text-center">{comp.quantity}</td>
                                                            <td>
                                                                <select
                                                                    value={comp.condition}
                                                                    onChange={(e) => handleUpdateComponent(comp.id, 'condition', e.target.value)}
                                                                    className="select select-xs select-bordered rounded-lg"
                                                                >
                                                                    {conditionOptions.map(opt => (
                                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <select
                                                                    value={comp.disposition}
                                                                    onChange={(e) => handleUpdateComponent(comp.id, 'disposition', e.target.value)}
                                                                    className="select select-xs select-bordered rounded-lg"
                                                                >
                                                                    {dispositionOptions.map(opt => (
                                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="text-center">
                                                                <button
                                                                    onClick={() => handleRemoveComponent(comp.id)}
                                                                    className="btn btn-xs btn-error text-white"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
                                    <p className="text-gray-600 font-medium">No components added yet. Add at least one component above.</p>
                                </div>
                            )}

                            {/* Technical Notes */}
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-2">
                                    General Technical Notes
                                </label>
                                <textarea
                                    placeholder="Add overall technical observations, damage patterns, hazardous materials, etc..."
                                    value={technicalNotes}
                                    onChange={(e) => setTechnicalNotes(e.target.value)}
                                    className="textarea textarea-bordered w-full h-24 rounded-xl focus:ring-2 ring-green-300"
                                />
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="modal-action mt-8 gap-4 justify-end">
                            <button
                                onClick={() => {
                                    setShowBreakdown(false);
                                    resetForm();
                                }}
                                className="btn btn-ghost px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBreakdownSubmit}
                                className="btn btn-success text-white px-8 rounded-xl shadow-lg shadow-green-200 font-bold"
                            >
                                Submit Breakdown & Dispositions
                            </button>
                        </div>
                    </div>
                    <div
                        className="modal-backdrop bg-black/40 backdrop-blur-sm"
                        onClick={() => {
                            setShowBreakdown(false);
                            resetForm();
                        }}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default ElectricianDashboard;
