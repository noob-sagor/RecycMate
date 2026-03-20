import React from 'react';
import { FaCheckCircle, FaCircle, FaClock, FaTruck, FaSearch, FaCheckDouble, FaFlagCheckered } from 'react-icons/fa';

const statusSteps = [
    { status: 'pending', label: 'Requested', icon: FaClock },
    { status: 'assigned', label: 'Assigned', icon: FaSearch },
    { status: 'collector-arrived', label: 'Arrived', icon: FaTruck },
    { status: 'inspected', label: 'Inspected', icon: FaCheckDouble },
    { status: 'completed', label: 'Completed', icon: FaFlagCheckered }
];

const StatusTracker = ({ currentStatus, statusHistory = [] }) => {
    // If status is cancelled, show a different UI or handle it
    if (currentStatus === 'cancelled') {
        return (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                <p className="text-red-600 font-bold flex items-center justify-center gap-2">
                    <FaFlagCheckered /> This request has been cancelled.
                </p>
            </div>
        );
    }

    const currentIdx = statusSteps.findIndex(step => step.status === currentStatus);
    
    return (
        <div className="w-full py-6">
            <div className="relative flex justify-between items-center w-full">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
                <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-green-500 -translate-y-1/2 z-0 transition-all duration-500" 
                    style={{ width: `${(Math.max(0, currentIdx) / (statusSteps.length - 1)) * 100}%` }}
                ></div>

                {statusSteps.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = statusHistory.some(h => h.status === step.status) || idx <= currentIdx;
                    const isCurrent = step.status === currentStatus;

                    return (
                        <div key={step.status} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                isCompleted ? 'bg-green-500 border-white text-white shadow-lg shadow-green-200' : 
                                'bg-white border-gray-200 text-gray-400'
                            } ${isCurrent ? 'scale-125 ring-4 ring-green-100' : ''}`}>
                                {isCompleted ? <FaCheckCircle size={14} /> : <Icon size={14} />}
                            </div>
                            <div className="absolute top-12 whitespace-nowrap text-center">
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${
                                    isCompleted ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                    {step.label}
                                </p>
                                {isCompleted && (
                                    <p className="text-[8px] text-gray-400 mt-0.5 italic">
                                        {statusHistory.find(h => h.status === step.status) ? 
                                            new Date(statusHistory.find(h => h.status === step.status).timestamp).toLocaleDateString() : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusTracker;
