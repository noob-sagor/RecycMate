import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="footer footer-center p-4 bg-base-300 text-base-content">
                <aside>
                    <p>© 2026 RecycMate - All Rights Reserved</p>
                </aside>
            </footer>
        </div>
    );
};

export default MainLayout;
