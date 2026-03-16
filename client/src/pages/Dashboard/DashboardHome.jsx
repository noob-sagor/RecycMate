import React, { useContext } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import AdminDashboard from './Admin/AdminDashboard';
import AgentDashboard from './Agent/AgentDashboard';
import StaffDashboard from './Staff/StaffDashboard';
import UserDashboard from './User/UserDashboard';

const DashboardHome = () => {
    const { dbUser } = useContext(AuthContext);

    if (dbUser?.role === 'admin') return <AdminDashboard />;
    if (dbUser?.role === 'agent') return <AgentDashboard />;
    if (dbUser?.role === 'staff') return <StaffDashboard />;
    
    return <UserDashboard />;
};

export default DashboardHome;
