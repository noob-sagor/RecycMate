import React from 'react';
import { FaBoxes, FaWeightHanging, FaChartBar } from 'react-icons/fa';

const StaffDashboard = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-indigo-700 mb-8">Center Staff Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                    <div className="flex items-center gap-4">
                        <FaBoxes className="text-3xl text-indigo-600" />
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Incoming Materials</p>
                            <h3 className="text-2xl font-bold">12 Bins</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center gap-4">
                        <FaWeightHanging className="text-3xl text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Weight Today</p>
                            <h3 className="text-2xl font-bold">452 kg</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                    <div className="flex items-center gap-4">
                        <FaChartBar className="text-3xl text-red-600" />
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Contamination Rate</p>
                            <h3 className="text-2xl font-bold">3.1%</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-12 bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4">Inventory Summary</h2>
                <p className="text-gray-600">This area will show current inventory levels and material processing data.</p>
            </div>
        </div>
    );
};

export default StaffDashboard;
