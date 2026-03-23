import React, { useContext, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const { signIn, signInWithGoogle, setUser, resetPassword } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState(false);
    const emailRef = useRef(null);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        signIn(email, password)
            .then(result => {
                setUser(result.user);
                toast.success('Successfully Logged In!');
                navigate('/');
            })
            .catch(error => {
                toast.error(error.message);
            });
    };

    const handleForgotPassword = async () => {
        if (!emailRef.current) return;
        
        const email = emailRef.current.value;
        if (!email) {
            return toast.error("Please provide your email address first!");
        }

        const id = toast.loading('Sending reset email...');
        try {
            await resetPassword(email);
            toast.success('Password reset email sent! Check your inbox.', { id });
        } catch (error) {
            toast.error(error.message, { id });
        }
    };

    const handleGoogleSignIn = () => {
        signInWithGoogle()
            .then(async (result) => {
                const loggedUser = result.user;
                const newUser = { 
                    name: loggedUser.displayName, 
                    email: loggedUser.email, 
                    photo: loggedUser.photoURL,
                    role: 'user' 
                };

                try {
                    const res = await axios.post(`${import.meta.env.VITE_API_URL}/users`, newUser);
                    if (res.data.insertedId || res.data.message === 'user already exists') {
                        setUser({ ...loggedUser });
                        toast.success('Successfully Logged In with Google!');
                        navigate('/');
                    }
                } catch (saveError) {
                    console.error(saveError);
                    toast.error("Failed to sync user with database.");
                }
            })
            .catch(error => {
                toast.error(error.message);
            });
    };

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col">
                <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
                    <img src="/logo.png" alt="RecycMate" className="w-32 h-32 mb-2 object-contain drop-shadow-md scale-[1.2]" />
                    <h1 className="text-5xl font-bold mb-6">Login to RecycMate</h1>
                </div>
                <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <form onSubmit={handleLogin} className="card-body">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input name="email" type="email" ref={emailRef} placeholder="email" className="input input-bordered" required />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <div className="relative">
                                <input 
                                    name="password" 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="password" 
                                    className="input input-bordered w-full pr-10" 
                                    required 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 focus:outline-none"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            <label className="label">
                                <button type="button" onClick={handleForgotPassword} className="label-text-alt link link-hover">Forgot password?</button>
                            </label>
                        </div>
                        <div className="form-control mt-6">
                            <button className="btn btn-success text-white">Login</button>
                        </div>
                    </form>
                    <div className="divider px-8">OR</div>
                    <div className="px-8 pb-8">
                        <button onClick={handleGoogleSignIn} className="btn btn-outline btn-success w-full">
                            Login with Google
                        </button>
                        <p className='text-center mt-4'>
                            New to RecycMate? <Link to="/signup" className='text-green-600 font-bold'>Sign Up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
