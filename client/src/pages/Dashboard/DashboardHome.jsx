import React, { useContext } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import AdminDashboard from './Admin/AdminDashboard';
import AgentDashboard from './Agent/AgentDashboard';
import StaffDashboard from './Staff/StaffDashboard';
import UserDashboard from './User/UserDashboard';
import ElectricianDashboard from './Electrician/ElectricianDashboard';
import SalesDashboard from './Sales/SalesDashboard';

const DashboardHome = () => {
    const { dbUser } = useContext(AuthContext);

    if (dbUser?.role === 'admin') return <AdminDashboard />;
    if (dbUser?.role === 'agent') return <AgentDashboard />;
    if (dbUser?.role === 'staff') return <StaffDashboard />;
    if (dbUser?.role === 'electrician') return <ElectricianDashboard />;
    if (dbUser?.role === 'sales') return <SalesDashboard />;
    
    return <UserDashboard />;
};

export default DashboardHome;
