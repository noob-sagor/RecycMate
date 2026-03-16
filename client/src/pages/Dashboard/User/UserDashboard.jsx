import React from 'react';
import { FaUserShield } from 'react-icons/fa';

const UserDashboard = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-green-700 mb-8">User Dashboard</h1>
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-4">
                    <FaUserShield className="text-3xl text-green-600" />
                    <div>
                        <p className="text-sm text-gray-600 font-medium">Your Role</p>
                        <h3 className="text-2xl font-bold capitalize">User</h3>
                    </div>
                </div>
            </div>
            
            <div className="mt-12 bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4">Your Activity</h2>
                <p className="text-gray-600">This area will display your recent pickup requests and history.</p>
            </div>
        </div>
    );
};

export default UserDashboard;
