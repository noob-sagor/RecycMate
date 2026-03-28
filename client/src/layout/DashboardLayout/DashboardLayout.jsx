import React, { useContext } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../providers/AuthProvider';
import { FaHome, FaUsers, FaTrashAlt, FaClipboardList, FaChartLine, FaTruck, FaSignOutAlt } from 'react-icons/fa';

const DashboardLayout = () => {
    const { dbUser, logOut } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogOut = () => {
        logOut().then(() => navigate('/login'));
    };

    const isAdmin = dbUser?.role === 'admin';
    const isAgent = dbUser?.role === 'agent';
    const isStaff = dbUser?.role === 'staff';
    const isUser = dbUser?.role === 'user';
    const isElectrician = dbUser?.role === 'electrician';
    const isSales = dbUser?.role === 'sales';

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-full lg:w-64 bg-green-700 text-white p-6 shadow-xl">
                <ul className="menu p-0 space-y-2 mt-4">
                    {/* Common for all users */}
                    <li><NavLink to="/dashboard" end className={({ isActive }) => isActive ? "bg-green-800" : "hover:bg-green-600"}>
                        <FaChartLine /> Dashboard Home
                    </NavLink></li>

                    {/* Admin Specific */}
                    {isAdmin && (
                        <>
                            <li><NavLink to="/dashboard/manage-users" className={({ isActive }) => isActive ? "bg-green-800" : "hover:bg-green-600"}>
                                <FaUsers /> Manage Users
                            </NavLink></li>
                            <li><NavLink to="/dashboard/all-pickups" className={({ isActive }) => isActive ? "bg-green-800" : "hover:bg-green-600"}>
                                <FaTruck /> Manage Pickups
                            </NavLink></li>
                            <li><NavLink to="/dashboard/pickup-history" className={({ isActive }) => isActive ? "bg-green-800" : "hover:bg-green-600"}>
                                <FaClipboardList /> Pickup History
                            </NavLink></li>
                            <li><NavLink to="/dashboard/reports" className={({ isActive }) => isActive ? "bg-green-800" : "hover:bg-green-600"}>
                                <FaChartLine /> Impact Reports
                            </NavLink></li>
                        </>
                    )}

                    {/* Agent Specific */}
                    {isAgent && (
                        <>
                            <li><NavLink to="/dashboard/assigned-pickups" className={({ isActive }) => isActive ? "bg-green-800" : "hover:bg-green-600"}>
                                <FaTruck /> My Pickups
                            </NavLink></li>
                        </>
                    )}

                    {/* Staff Specific */}
                    {isStaff && (
                        <>
                            <li><NavLink to="/dashboard/center-inventory" className={({ isActive }) => isActive ? "bg-green-800" : "hover:bg-green-600"}>
                                <FaTrashAlt /> Center Inventory
                            </NavLink></li>
                        </>
                    )}

                    {/* Electrician Specific */}
                    {isElectrician && (
                        <>
                            <li><NavLink to="/dashboard/assigned-tasks" className={({ isActive }) => isActive ? "bg-green-800" : "hover:bg-green-600"}>
                                <FaClipboardList /> Assigned Tasks
                            </NavLink></li>
                        </>
                    )}

                    {/* Sales Specific */}
                    {isSales && (
                        <>
                            <li><NavLink to="/dashboard/resell-list" className={({ isActive }) => isActive ? "bg-green-800" : "hover:bg-green-600"}>
                                <FaClipboardList /> Resell List
                            </NavLink></li>
                        </>
                    )}

                    {/* Admin Specific Additional (Oversight) */}
                    {isAdmin && (
                        <li><NavLink to="/dashboard/resell-list" className={({ isActive }) => isActive ? "bg-green-800" : "hover:bg-green-600"}>
                            <FaClipboardList /> Resell Oversight
                        </NavLink></li>
                    )}

                    {/* Standard User Specific */}
                    {isUser && (
                        <>
                            <li><NavLink to="/dashboard/my-requests" className={({ isActive }) => isActive ? "bg-green-800" : "hover:bg-green-600"}>
                                <FaClipboardList /> My Requests
                            </NavLink></li>
                        </>
                    )}

                    <div className="divider bg-green-600 h-[1px]"></div>

                    <li><Link to="/" className="hover:bg-green-600"><FaHome /> Home</Link></li>
                    <li><button onClick={handleLogOut} className="hover:bg-red-600 mt-10"><FaSignOutAlt /> Logout</button></li>
                </ul>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 lg:p-12">
                <div className="bg-white rounded-2xl shadow-sm p-8 min-h-[80vh]">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
