import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
    FaMapMarkerAlt, 
    FaCalendarAlt, 
    FaClock, 
    FaUser, 
    FaEnvelope,
    FaInfoCircle,
    FaArrowRight,
    FaPlus,
    FaTrashAlt,
    FaCamera,
    FaTimes
} from 'react-icons/fa';
import { imageUpload } from '../utils/index';

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
    const [warningModal, setWarningModal] = useState({ isOpen: false, message: '' });
    
    // Dynamic items state with image property
    const [items, setItems] = useState([{ category: '', quantity: 1, image: null }]);

    const addItem = () => setItems([...items, { category: '', quantity: 1, image: null }]);
    
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

    const handleItemImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
                return toast.error("Only JPEG and PNG images are allowed.");
            }
            updateItem(index, 'image', file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const address = form.address.value;
        const date = form.date.value;
        const time = form.time.value;

        // Validation checks mapped to the custom dialog
        const missingErrors = [];

        items.forEach((item, idx) => {
            const itemNumber = items.length > 1 ? ` (Item #${idx + 1})` : '';
            if (!item.category) missingErrors.push(`Category is missing${itemNumber}`);
            if (item.quantity < 1) missingErrors.push(`Quantity must be at least 1${itemNumber}`);
            if (!item.image) missingErrors.push(`Item Image is missing${itemNumber}`);
        });

        if (!address) {
            missingErrors.push("Detailed Location Address");
        }

        if (!date) {
            missingErrors.push("Preferred Pickup Date");
        }

        if (!time) {
            missingErrors.push("Preferred Pickup Time");
        }

        if (missingErrors.length > 0) {
            setWarningModal({ 
                isOpen: true, 
                message: missingErrors 
            });
            return;
        }

        setLoading(true);

        try {
            // Upload images for each item
            const itemsWithUrls = await Promise.all(items.map(async (item) => {
                const imageUrl = await imageUpload(item.image);
                return {
                    category: item.category,
                    quantity: item.quantity,
                    image: imageUrl
                };
            }));

            const pickupData = {
                userName: user?.displayName || dbUser?.name,
                userEmail: user?.email,
                address,
                preferredDate: date,
                preferredTime: time,
                items: itemsWithUrls, 
                status: 'pending',
                createdAt: new Date()
            };

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/pickups`, pickupData);
            if (res.data.insertedId) {
                toast.success('Pickup request submitted successfully!');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Error submitting pickup request:", error);
            toast.error(error.message || 'Failed to submit pickup request.');
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

                                {/* 02. Items Selection */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                        <div className="h-[1px] w-6 bg-gray-300"></div> 02. Waste Type, Quantity & Image
                                    </h3>
                                    <div className="space-y-6">
                                        {items.map((item, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group transition-all hover:border-green-200 space-y-4">
                                                <div className="flex flex-col md:flex-row gap-3 items-end">
                                                    <div className="flex-1 w-full">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Category <span className="text-red-500">*</span></label>
                                                        <select 
                                                            value={item.category}
                                                            onChange={(e) => updateItem(index, 'category', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                                                        >
                                                            <option value="" disabled>Select Category</option>
                                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="w-full md:w-32">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Quantity <span className="text-red-500">*</span></label>
                                                        <input 
                                                            type="number" 
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                                                        />
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="p-3.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Remove item"
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                </div>
                                                
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-20 h-20 bg-white border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 group/img">
                                                        {item.image ? (
                                                            <>
                                                                <img src={URL.createObjectURL(item.image)} alt="preview" className="w-full h-full object-cover" />
                                                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer">
                                                                    <FaCamera className="text-white" />
                                                                    <input type="file" className="hidden" onChange={(e) => handleItemImageChange(index, e)} accept="image/jpeg, image/png" />
                                                                </label>
                                                            </>
                                                        ) : (
                                                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-gray-400 hover:text-green-500 transition-colors">
                                                                <FaCamera size={20} />
                                                                <span className="text-[8px] font-bold uppercase mt-1">Add Image</span>
                                                                <input type="file" className="hidden" onChange={(e) => handleItemImageChange(index, e)} accept="image/jpeg, image/png" />
                                                            </label>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        <p className="font-bold uppercase text-gray-500">Item Image <span className="text-red-500">*</span></p>
                                                        <p>Required: 1 photo (JPEG/PNG)</p>
                                                    </div>
                                                </div>
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

            {/* Warning Modal */}
            {warningModal.isOpen && (
                <div className="modal modal-open">
                    <div className="modal-box bg-white rounded-3xl overflow-hidden p-0 max-w-sm w-full mx-auto shadow-2xl">
                        <div className="p-8 text-center bg-white relative">
                            <button 
                                onClick={() => setWarningModal({ isOpen: false, message: '' })}
                                className="btn btn-sm btn-circle absolute right-4 top-4 bg-gray-100 border-none text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                            >
                                ✕
                            </button>
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-red-50/50">
                                <FaInfoCircle className="text-4xl text-red-500" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">Wait a sec!</h3>
                            <div className="text-gray-500 text-sm font-medium leading-relaxed px-4 text-left">
                                <p className="mb-2 text-center">Please provide the following missing information:</p>
                                <ul className="list-disc pl-5 space-y-1 text-red-500">
                                    {(Array.isArray(warningModal.message) ? warningModal.message : [warningModal.message]).map((msg, idx) => (
                                        <li key={idx}>
                                            <span className="text-gray-600">{msg}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="bg-gray-50/50 p-6 border-t border-gray-100 flex justify-center">
                            <button 
                                onClick={() => setWarningModal({ isOpen: false, message: '' })} 
                                className="btn bg-red-500 hover:bg-red-600 border-none text-white w-full rounded-xl shadow-lg shadow-red-500/30 normal-case text-sm font-bold tracking-wide"
                            >
                                Got it, let me fix
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={() => setWarningModal({ isOpen: false, message: '' })}></div>
                </div>
            )}
        </div>
    );
};

export default PickupRequest;
