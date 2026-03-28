import React, { useEffect, useState } from 'react';
import { FaTruck, FaCalendarAlt, FaMapMarkerAlt, FaHistory, FaFilePdf, FaEye, FaDownload } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { openReceiptInNewTab, downloadReceiptAsHTML } from '../../../utils/index';
import StatusTracker from '../../../components/StatusTracker';

const RequestHistory = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.email) return;
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/pickups/my/${user.email}`);
                // Sort by newest first
                setRequests(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (error) {
                console.error("Error fetching history:", error);
                toast.error("Failed to load request history");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user?.email]);

    const getStatusBadge = (status) => {
        const badges = {
            'pending': 'badge-warning',
            'assigned': 'badge-info',
            'in-progress': 'badge-info',
            'collector-arrived': 'badge-info',
            'inspected': 'badge-info',
            'component-breakdown': 'badge-info',
            'disposition-assigned': 'badge-info',
            'disposal-finalized': 'badge-success',
            'completed': 'badge-success',
            'approved': 'badge-success',
            'rejected': 'badge-error',
            'cancelled': 'badge-ghost',
            'rescheduled': 'badge-warning'
        };
        return badges[status] || 'badge-ghost';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'pending': 'Pending',
            'assigned': 'Assigned',
            'in-progress': 'In Progress',
            'collector-arrived': 'Collector Arrived',
            'inspected': 'Inspected',
            'component-breakdown': 'Breakdown',
            'disposition-assigned': 'Disposition Set',
            'disposal-finalized': 'Disposal Done',
            'completed': 'Completed',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'cancelled': 'Cancelled',
            'rescheduled': 'Rescheduled'
        };
        return labels[status] || status;
    };

    if (loading) {
        return <div className="flex justify-center items-center h-40">Loading request history...</div>;
    }

    // Pagination
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginatedRequests = requests.slice(startIdx, endIdx);
    const totalPages = Math.ceil(requests.length / itemsPerPage);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-green-700 mb-2 flex items-center gap-3">
                    <FaHistory /> Request History & Receipts
                </h1>
                <p className="text-gray-600">View all your past pickup requests and download receipts</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Total Requests</p>
                    <p className="text-3xl font-bold text-blue-700">{requests.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Completed</p>
                    <p className="text-3xl font-bold text-green-700">{requests.filter(r => r.status === 'completed' || r.status === 'disposal-finalized').length}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                    <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">Pending</p>
                    <p className="text-3xl font-bold text-yellow-700">{requests.filter(r => r.status === 'pending').length}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Rejected/Cancelled</p>
                    <p className="text-3xl font-bold text-red-700">{requests.filter(r => r.status === 'rejected' || r.status === 'cancelled').length}</p>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                {requests.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <FaTruck className="text-5xl mx-auto mb-4 text-gray-300" />
                        <p className="font-bold text-lg">No requests yet</p>
                        <p className="text-sm">Create your first pickup request to get started</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Request ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedRequests.map(request => (
                                        <tr key={request._id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-4 py-4 font-mono text-xs text-gray-600">{request._id.slice(-8)}</td>
                                            <td className="px-4 py-4 text-sm text-gray-800">
                                                {new Date(request.createdAt).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={request.address}>
                                                {request.address}
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                <span className="font-bold text-green-600">{request.items?.length || 0}</span> items
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider badge ${getStatusBadge(request.status)}`}>
                                                    {getStatusLabel(request.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setSelectedRequest(request)}
                                                        className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        title="View Details"
                                                    >
                                                        <FaEye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => openReceiptInNewTab(request)}
                                                        className="btn btn-sm btn-ghost text-green-600 hover:bg-green-50 rounded-lg"
                                                        title="View Receipt"
                                                    >
                                                        <FaFilePdf size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => downloadReceiptAsHTML(request)}
                                                        className="btn btn-sm btn-ghost text-purple-600 hover:bg-purple-50 rounded-lg"
                                                        title="Download Receipt"
                                                    >
                                                        <FaDownload size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex gap-2 justify-center mt-8">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="btn btn-sm btn-outline rounded-lg"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`btn btn-sm rounded-lg ${currentPage === i + 1 ? 'btn-success text-white' : 'btn-outline'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="btn btn-sm btn-outline rounded-lg"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Details Modal */}
            {selectedRequest && (
                <div className="modal modal-open z-[50]">
                    <div className="modal-box max-w-3xl p-0 rounded-3xl shadow-2xl bg-white max-h-[90vh] overflow-y-auto relative">
                        <div className="bg-green-600 p-8 text-white sticky top-0 z-20">
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="btn btn-sm btn-circle absolute right-6 top-6 bg-green-500 border-none text-white hover:bg-green-700"
                            >
                                ✕
                            </button>
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <FaTruck size={24} /> Pickup Request Details
                            </h3>
                            <p className="text-green-50 mt-1 opacity-90 text-sm font-medium tracking-wide">
                                ID: {selectedRequest._id}
                            </p>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Status Tracker */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Real-time Status</h4>
                                <StatusTracker currentStatus={selectedRequest.status} statusHistory={selectedRequest.statusHistory} />
                            </div>

                            {/* Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                    <div className="mt-1">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider badge ${getStatusBadge(selectedRequest.status)}`}>
                                            {getStatusLabel(selectedRequest.status)}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Requested</p>
                                    <p className="font-bold text-gray-800 mt-1">
                                        {new Date(selectedRequest.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Items</p>
                                    <p className="font-bold text-gray-800 mt-1">{selectedRequest.items?.length || 0} items</p>
                                </div>
                            </div>

                            {/* Address & Date */}
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <FaMapMarkerAlt className="text-green-600 mt-1 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Pickup Location</p>
                                        <p className="font-bold text-gray-800">{selectedRequest.address}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <FaCalendarAlt className="text-green-600 mt-1 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Preferred Date & Time</p>
                                        <p className="font-bold text-gray-800">{selectedRequest.preferredDate} at {selectedRequest.preferredTime}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Items for Pickup</p>
                                <div className="space-y-2">
                                    {selectedRequest.items?.map((item, idx) => (
                                        <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex gap-4 items-center">
                                            <img src={item.image} alt={item.category} className="w-20 h-20 object-cover rounded-lg" />
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800">{item.category}</p>
                                                <p className="text-sm text-gray-600">Quantity: <span className="font-bold text-green-600">{item.quantity}</span></p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-4 pt-2">
                                <button
                                    onClick={() => openReceiptInNewTab(selectedRequest)}
                                    className="btn btn-outline btn-success rounded-xl gap-2 flex-1"
                                >
                                    <FaFilePdf /> View Receipt
                                </button>
                                <button
                                    onClick={() => downloadReceiptAsHTML(selectedRequest)}
                                    className="btn btn-outline btn-info rounded-xl gap-2 flex-1"
                                >
                                    <FaDownload /> Download
                                </button>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="btn btn-ghost rounded-xl float-right"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}></div>
                </div>
            )}
        </div>
    );
};

export default RequestHistory;
