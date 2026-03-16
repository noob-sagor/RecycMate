import React from 'react';
import { FaUsers, FaChartPie, FaClipboardList } from 'react-icons/fa';

const AdminDashboard = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-green-700 mb-8">Administrator Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center gap-4">
                        <FaUsers className="text-3xl text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Users</p>
                            <h3 className="text-2xl font-bold">Manage All</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-4">
                        <FaChartPie className="text-3xl text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Monthly Impact</p>
                            <h3 className="text-2xl font-bold">View Data</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                    <div className="flex items-center gap-4">
                        <FaClipboardList className="text-3xl text-yellow-600" />
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Pending Tasks</p>
                            <h3 className="text-2xl font-bold">Check Audit</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-12 bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4">System Activity Summary</h2>
                <p className="text-gray-600">This area will display overall system metrics and administrative alerts.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
