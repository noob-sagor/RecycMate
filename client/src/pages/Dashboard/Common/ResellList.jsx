import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from "../../../providers/AuthProvider";
import { FaPlus, FaCheckCircle, FaTag, FaClipboardList, FaSpinner } from 'react-icons/fa';

const ResellList = () => {
    const { dbUser } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        componentName: '',
        condition: 'Used',
        price: ''
    });

    const isAdmin = dbUser?.role === 'admin';
    const isSales = dbUser?.role === 'sales';

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/resell`);
            setItems(res.data);
        } catch (error) {
            toast.error("Failed to fetch resell items.");
            console.error("Error fetching items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newItem = {
                ...formData,
                price: parseFloat(formData.price),
                status: 'listed',
                addedBy: dbUser?.email,
                addedByName: dbUser?.name
            };
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/resell`, newItem);
            if (res.data.insertedId) {
                toast.success("Component listed successfully!");
                setFormData({ componentName: '', condition: 'Used', price: '' });
                setShowForm(false);
                fetchItems();
            }
        } catch (error) {
            toast.error("Failed to add component.");
            console.error("Error adding item:", error);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/resell/${id}`, { status: newStatus });
            if (res.data.modifiedCount > 0) {
                toast.success(`Item marked as ${newStatus}.`);
                setItems(items.map(item => item._id === id ? { ...item, status: newStatus } : item));
            }
        } catch (error) {
            toast.error("Failed to update status.");
            console.error("Error updating status:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <FaSpinner className="animate-spin text-green-600 text-4xl" />
                <p className="text-gray-500 font-medium">Loading resell list...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Micro-Component Resell List</h1>
                    <p className="text-gray-500 text-sm mt-1">Track and manage resellable electronic components.</p>
                </div>
                {(isSales || isAdmin) && (
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className={`btn ${showForm ? 'btn-ghost' : 'btn-primary bg-green-600 hover:bg-green-700 border-none'} rounded-xl px-6`}
                    >
                        {showForm ? 'Cancel' : <><FaPlus className="mr-2" /> Add Component</>}
                    </button>
                )}
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-bold text-gray-600">Component Name</span></label>
                            <input 
                                type="text" 
                                name="componentName"
                                placeholder="e.g. 10uF Capacitor" 
                                className="input input-bordered rounded-xl focus:border-green-500" 
                                value={formData.componentName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-bold text-gray-600">Condition</span></label>
                            <select 
                                name="condition"
                                className="select select-bordered rounded-xl focus:border-green-500"
                                value={formData.condition}
                                onChange={handleInputChange}
                            >
                                <option>New</option>
                                <option>Used</option>
                                <option>Refurbished</option>
                                <option>Salvaged</option>
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-bold text-gray-600">Price (BDT)</span></label>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    name="price"
                                    placeholder="0.00" 
                                    className="input input-bordered rounded-xl focus:border-green-500 flex-1" 
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                />
                                <button type="submit" className="btn btn-success bg-green-600 hover:bg-green-700 border-none text-white rounded-xl px-8">
                                    List
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Listing Table */}
            <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
                <table className="table w-full">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Component</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Condition</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {items.length > 0 ? items.map((item) => (
                            <tr key={item._id} className="hover:bg-green-50/30 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                            <FaTag size={14} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{item.componentName}</div>
                                            <div className="text-[11px] text-gray-400">Listed by {item.addedByName || item.addedBy}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold ring-1 ring-blue-100">
                                        {item.condition}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm font-black text-gray-800">৳ {item.price ? item.price.toFixed(2) : '0.00'}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        item.status === 'sold' 
                                        ? 'bg-red-50 text-red-600 ring-1 ring-red-100' 
                                        : 'bg-green-50 text-green-600 ring-1 ring-green-100'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        {item.status === 'listed' ? (
                                            <button 
                                                onClick={() => handleStatusChange(item._id, 'sold')}
                                                className="btn btn-xs btn-outline btn-success rounded-lg hover:text-white"
                                                title="Mark as Sold"
                                            >
                                                Mark Sold
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleStatusChange(item._id, 'listed')}
                                                className="btn btn-xs btn-outline btn-info rounded-lg hover:text-white"
                                                title="Re-list Component"
                                            >
                                                Re-list
                                            </button>
                                        )}
                                        {isAdmin && (
                                            <div className="text-[10px] text-gray-400 ml-2 italic">Admin Oversight</div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="text-center py-20 text-gray-400">
                                    <FaClipboardList className="mx-auto text-4xl mb-4 opacity-20" />
                                    <p className="font-bold uppercase tracking-widest text-xs">No components listed yet</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResellList;
