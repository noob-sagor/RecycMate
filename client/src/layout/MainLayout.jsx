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
            <footer className="footer footer-center p-6 bg-base-300 text-base-content mt-auto">
                <aside className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                        <img src="/logo.png" alt="RecycMate" className="w-10 h-10 object-contain grayscale opacity-70 scale-[1.3]" />
                        <span className="font-bold text-lg opacity-80 tracking-tight">RecycMate</span>
                    </div>
                    <p className="text-sm opacity-60">© {new Date().getFullYear()} - All Rights Reserved</p>
                </aside>
            </footer>
        </div>
    );
};

export default MainLayout;
