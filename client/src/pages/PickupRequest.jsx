import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
    FaMapMarkerAlt, 
    FaCalendarAlt, 
    FaClock, 
    FaListUl, 
    FaUser, 
    FaEnvelope,
    FaInfoCircle,
    FaArrowRight,
    FaPlus,
    FaTrashAlt
} from 'react-icons/fa';

const categories = [
    'Computer/Laptop',
    'Smartphone/Tablet',
    'Battery',
    'Cable/Charger',
    'Monitor/TV',
    'Printer/Scanner',
    'Home Appliances',
    'Other'
];

const PickupRequest = () => {
    const { user, dbUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Dynamic items state
    const [items, setItems] = useState([{ category: '', quantity: 1 }]);

    const addItem = () => setItems([...items, { category: '', quantity: 1 }]);
    
    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        } else {
            toast.error("You must include at least one item.");
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const isInvalid = items.some(item => !item.category || item.quantity < 1);
        if (isInvalid) {
            return toast.error("Please select a category and valid quantity for all items.");
        }

        setLoading(true);

        const form = e.target;
        const address = form.address.value;
        const date = form.date.value;
        const time = form.time.value;

        const pickupData = {
            userName: user?.displayName || dbUser?.name,
            userEmail: user?.email,
            address,
            preferredDate: date,
            preferredTime: time,
            items: items, // Structured list
            status: 'pending',
            createdAt: new Date()
        };

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/pickups`, pickupData);
            if (res.data.insertedId) {
                toast.success('Pickup request submitted successfully!');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Error submitting pickup request:", error);
            toast.error('Failed to submit pickup request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        Schedule a <span className="text-green-600">Pickup</span>
                    </h1>
                    <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
                        Select your waste categories and quantities. Our agents will ensure they are processed safely.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Guidelines/Tips */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaInfoCircle className="text-blue-500" /> Quick Guidelines
                            </h3>
                            <ul className="space-y-4 text-sm text-gray-600">
                                <li className="flex gap-3">
                                    <div className="shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
                                    <p>Ensure all items are packed or grouped together at the pickup location.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px] font-bold">2</div>
                                    <p>Remove batteries from devices where possible before disposal.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px] font-bold">3</div>
                                    <p>Clear all personal data from hard drives and memory cards.</p>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-green-600 p-6 rounded-2xl shadow-lg text-white">
                            <h3 className="font-bold text-xl mb-2">Did you know?</h3>
                            <p className="text-green-50 text-sm leading-relaxed">
                                Recycling one million laptops saves the energy equivalent to the electricity used by 3,500 homes in a year.
                            </p>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
                                {/* 01. Contact Info */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                        <div className="h-[1px] w-6 bg-gray-300"></div> 01. Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="relative">
                                            <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Full Name</label>
                                            <div className="relative group">
                                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                                <input 
                                                    type="text" 
                                                    defaultValue={user?.displayName || dbUser?.name} 
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed text-gray-500" 
                                                    readOnly 
                                                />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Email</label>
                                            <div className="relative group">
                                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                                <input 
                                                    type="email" 
                                                    defaultValue={user?.email} 
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed text-gray-500" 
                                                    readOnly 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 02. Items Selection (NEW STRUCTURED PART) */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                        <div className="h-[1px] w-6 bg-gray-300"></div> 02. Waste Type & Quantity
                                    </h3>
                                    <div className="space-y-4">
                                        {items.map((item, index) => (
                                            <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-100 relative group transition-all hover:border-green-200">
                                                <div className="flex-1 w-full">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Category</label>
                                                    <select 
                                                        value={item.category}
                                                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                                                        required
                                                    >
                                                        <option value="" disabled>Select Category</option>
                                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                    </select>
                                                </div>
                                                <div className="w-full md:w-32">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Quantity</label>
                                                    <input 
                                                        type="number" 
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                                                        required
                                                    />
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-3.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                        ))}
                                        <button 
                                            type="button"
                                            onClick={addItem}
                                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-green-600 hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                                        >
                                            <FaPlus /> Add Another Item
                                        </button>
                                    </div>
                                </div>

                                {/* 03. Logistics */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                        <div className="h-[1px] w-6 bg-gray-300"></div> 03. Pickup Logistics
                                    </h3>
                                    <div className="space-y-5">
                                        <div className="relative">
                                            <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Detailed Address</label>
                                            <div className="relative group">
                                                <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                                <textarea 
                                                    name="address" 
                                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all min-h-[100px]" 
                                                    placeholder="Street, Building, Flat No..." 
                                                    required
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="relative group">
                                                <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Preferred Date</label>
                                                <div className="relative">
                                                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500" />
                                                    <input 
                                                        name="date" 
                                                        type="date" 
                                                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" 
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                            <div className="relative group">
                                                <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Preferred Time</label>
                                                <div className="relative">
                                                    <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500" />
                                                    <input 
                                                        name="time" 
                                                        type="time" 
                                                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" 
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:transform-none"
                                    >
                                        {loading ? <span className="loading loading-spinner"></span> : <>Submit Request <FaArrowRight /></>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PickupRequest;
