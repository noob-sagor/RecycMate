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
    FaArrowRight
} from 'react-icons/fa';

const PickupRequest = () => {
    const { user, dbUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const form = e.target;
        const address = form.address.value;
        const date = form.date.value;
        const time = form.time.value;
        const items = form.items.value;

        const pickupData = {
            userName: user?.displayName || dbUser?.name,
            userEmail: user?.email,
            address,
            preferredDate: date,
            preferredTime: time,
            itemsList: items,
            status: 'pending',
            createdAt: new Date()
        };

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/pickups`, pickupData);
            if (res.data.insertedId) {
                toast.success('Pickup request submitted successfully!');
                form.reset();
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Error submitting pickup request:", error);
            toast.error('Failed to submit pickup request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        Schedule a <span className="text-green-600">Pickup</span>
                    </h1>
                    <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
                        Tell us where and when to collect your e-waste. Our agents will handle the rest responsibly.
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
                                {/* Section: Personal Info */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                        <div className="h-px w-6 bg-gray-300"></div> 01. Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="relative group">
                                            <FaUser className="absolute left-4 top-[38px] text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                            <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Full Name</label>
                                            <input 
                                                type="text" 
                                                defaultValue={user?.displayName || dbUser?.name} 
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all cursor-not-allowed text-gray-500" 
                                                readOnly 
                                            />
                                        </div>
                                        <div className="relative group">
                                            <FaEnvelope className="absolute left-4 top-[38px] text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                            <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Email Address</label>
                                            <input 
                                                type="email" 
                                                defaultValue={user?.email} 
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all cursor-not-allowed text-gray-500" 
                                                readOnly 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Logistics */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                        <div className="h-[1px] w-6 bg-gray-300"></div> 02. Pickup Logistics
                                    </h3>
                                    <div className="space-y-5">
                                        <div className="relative group">
                                            <FaMapMarkerAlt className="absolute left-4 top-[38px] text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                            <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Detailed Address</label>
                                            <textarea 
                                                name="address" 
                                                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all min-h-[100px]" 
                                                placeholder="Street, Building, Flat No., Landmarks..." 
                                                required
                                            ></textarea>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="relative group">
                                                <FaCalendarAlt className="absolute left-4 top-[38px] text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                                <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Preferred Date</label>
                                                <input 
                                                    name="date" 
                                                    type="date" 
                                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" 
                                                    required 
                                                />
                                            </div>
                                            <div className="relative group">
                                                <FaClock className="absolute left-4 top-[38px] text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                                <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Preferred Time</label>
                                                <input 
                                                    name="time" 
                                                    type="time" 
                                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Item Details */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                        <div className="h-[1px] w-6 bg-gray-300"></div> 03. Material Details
                                    </h3>
                                    <div className="relative group">
                                        <FaListUl className="absolute left-4 top-[38px] text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                        <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block uppercase">Itemized List</label>
                                        <textarea 
                                            name="items" 
                                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all min-h-[100px]" 
                                            placeholder="Example: 2 Desktop CPUs, 1 Monitor, Miscellaneous cables..." 
                                            required
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:transform-none"
                                    >
                                        {loading ? (
                                            <span className="loading loading-spinner"></span>
                                        ) : (
                                            <>Submit Request <FaArrowRight className="text-sm" /></>
                                        )}
                                    </button>
                                    <p className="text-center text-xs text-gray-400 mt-4 italic">
                                        By submitting, you agree to our disposal and data privacy terms.
                                    </p>
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
