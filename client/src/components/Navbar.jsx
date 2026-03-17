import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import toast from 'react-hot-toast';

const Navbar = () => {
    const { user, dbUser, logOut } = useContext(AuthContext);

    const handleLogOut = () => {
        logOut()
            .then(() => {
                toast.success('Logged Out!');
            })
            .catch(error => {
                toast.error(error.message);
            });
    };

    const navLinks = (
        <>
            <li><NavLink to="/" className={({ isActive }) => isActive ? "text-green-600 font-bold" : ""}>Home</NavLink></li>
            {user && <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-green-600 font-bold" : ""}>Dashboard</NavLink></li>}
            <li><NavLink to="/pickup-request" className={({ isActive }) => isActive ? "text-green-600 font-bold" : ""}>Pickup Request</NavLink></li>
            <li><NavLink to="/history" className={({ isActive }) => isActive ? "text-green-600 font-bold" : ""}>History</NavLink></li>
            <li><NavLink to="/rewards" className={({ isActive }) => isActive ? "text-green-600 font-bold" : ""}>Rewards</NavLink></li>
        </>
    );

    return (
        <div className="navbar bg-base-100 shadow-lg px-4 lg:px-12 sticky top-0 z-50">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        {navLinks}
                    </ul>
                </div>
                <Link to="/" className="btn btn-ghost text-2xl font-bold text-green-600 flex items-center gap-1">
                    <img src="/logo.png" alt="RecycMate Logo" className="w-14 h-14 object-contain scale-[1.3]" />
                    RecycMate
                </Link>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 font-medium">
                    {navLinks}
                </ul>
            </div>
            <div className="navbar-end gap-2">
                {
                    user ? (
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <h2 className="font-bold text-gray-800 text-sm leading-tight">{dbUser?.name || user?.displayName || 'User'}</h2>
                                {dbUser?.role && <p className="text-[10px] font-black tracking-widest text-green-600 uppercase mt-0.5">{dbUser?.role}</p>}
                            </div>
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border-2 border-green-100 hover:ring-2 ring-green-500/30 transition-all">
                                    <div className="w-10 rounded-full">
                                        <img alt="User Avatar" src={dbUser?.photo || user?.photoURL || "https://i.ibb.co/mJR9nxM/user.png"} className="object-cover" />
                                    </div>
                                </div>
                                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 rounded-box w-52">
                                    <li><button onClick={handleLogOut} className="text-red-500 font-bold hover:bg-red-50">Logout</button></li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline btn-success">Login</Link>
                            <Link to="/signup" className="btn btn-success text-white">Register</Link>
                        </>
                    )
                }
            </div>
        </div>
    );
};

export default Navbar;
