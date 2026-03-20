import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSearch, FaMapMarkerAlt, FaPhoneAlt, FaRecycle } from 'react-icons/fa';

const categories = [
    'All',
    'Computer/Laptop',
    'Smartphone/Tablet',
    'Battery',
    'Cable/Charger',
    'Monitor/TV',
    'Printer/Scanner',
    'Home Appliances',
    'Other'
];

const CollectionCenters = () => {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/centers`);
                setCenters(res.data);
            } catch (error) {
                console.error("Error fetching centers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCenters();
    }, []);

    const filteredCenters = centers.filter(center => {
        const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             center.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'All' || center.specialties.includes(selectedSpecialty);
        return matchesSearch && matchesSpecialty;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        Find <span className="text-green-600">Collection Centers</span>
                    </h1>
                    <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
                        Locate the nearest e-waste collection center or search by the specialty of waste they handle.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search by name or location..." 
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <FaRecycle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                            <select 
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all appearance-none"
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Center Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <span className="loading loading-spinner loading-lg text-green-600"></span>
                    </div>
                ) : filteredCenters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCenters.map(center => (
                            <div key={center._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group">
                                <div className="h-48 overflow-hidden relative">
                                    <img src={center.image} alt={center.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-4 right-4 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                        Open Now
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{center.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                                        <FaMapMarkerAlt className="text-red-400" />
                                        {center.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                        <FaPhoneAlt className="text-blue-400" />
                                        {center.contact}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specialties</p>
                                        <div className="flex flex-wrap gap-2">
                                            {center.specialties.map(spec => (
                                                <span key={spec} className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-green-100">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button className="w-full mt-6 bg-gray-900 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-green-500/30">
                                        Get Directions
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="flex justify-center mb-4 text-gray-300">
                            <FaRecycle size={60} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700">No centers found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectionCenters;
