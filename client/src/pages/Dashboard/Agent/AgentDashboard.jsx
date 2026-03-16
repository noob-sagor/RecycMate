import React from 'react';
import { FaTruck, FaMapMarkerAlt } from 'react-icons/fa';

const AgentDashboard = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-blue-700 mb-8">Agent Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-4">
                        <FaTruck className="text-3xl text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Assigned Pickups</p>
                            <h3 className="text-2xl font-bold">5 Pending</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center gap-4">
                        <FaMapMarkerAlt className="text-3xl text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Route Efficiency</p>
                            <h3 className="text-2xl font-bold">94%</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-12 bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4">Today's Schedule</h2>
                <p className="text-gray-600">This area will list the scheduled collection requests for today.</p>
            </div>
        </div>
    );
};

export default AgentDashboard;
