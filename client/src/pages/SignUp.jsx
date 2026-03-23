import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import toast from 'react-hot-toast';
import axios from 'axios';
import { imageUpload } from '../utils';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SignUp = () => {
    const { createUser, updateUserProfile, signInWithGoogle, logOut, setUser } = useContext(AuthContext);
    const [profilePic, setProfilePic] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [tempUserData, setTempUserData] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleImageUpload = async (e) => {
        const image = e.target.files[0];
        if (!image) return;

        try {
            setUploading(true);
            const imageUrl = await imageUpload(image);
            if (imageUrl) {
                setProfilePic(imageUrl);
                toast.success('Image uploaded successfully!');
            }
        } catch (error) {
            toast.error(error.message || "Image upload failed.");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleSignUpInit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value;
        const email = form.email.value;
        const password = form.password.value;

        if (!profilePic) {
            return toast.error('Please upload a profile picture first!');
        }

        setTempUserData({ name, email, password, photo: profilePic });

        try {
            setVerifying(true);
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/otp/generate`, { email });
            if (res.data.success) {
                toast.success('Verification OTP sent to your email!');
                setShowOtpModal(true);
                setCountdown(60); // 60 seconds for resend
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP.");
            console.error(error);
        } finally {
            setVerifying(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            return toast.error("Please enter a valid 6-digit OTP.");
        }

        try {
            setVerifying(true);
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/otp/verify`, { 
                email: tempUserData.email, 
                otp 
            });

            if (res.data.success) {

                await completeRegistration();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "OTP verification failed.");
            console.error(error);
        } finally {
            setVerifying(false);
        }
    };

    const completeRegistration = async () => {
        const { name, email, password, photo } = tempUserData;
        const newUser = { name, email, photo, role: 'user' };

        try {
            const result = await createUser(email, password);
            await updateUserProfile(name, photo);
            
            // Save user details to MongoDB via backend
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/users`, newUser);
            if (res.data.insertedId || res.data.message === 'user already exists') {
                toast.success('Account Created Successfully!');
                setShowOtpModal(false);
                logOut().then(() => {
                    navigate('/login');
                });
            }
        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;
        try {
            setVerifying(true);
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/otp/generate`, { email: tempUserData.email });
            if (res.data.success) {
                toast.success('New OTP sent!');
                setCountdown(60);
            }
        } catch (error) {
            toast.error("Failed to resend OTP.");
        } finally {
            setVerifying(false);
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
                    toast.error("Failed to save user in database.");
                }
            })
            .catch(error => {
                toast.error(error.message);
            });
    };

    return (
        <div className="hero min-h-screen bg-base-200 py-10">
            <div className="hero-content flex-col">
                <div className="text-center flex flex-col items-center">
                    <img src="/logo.png" alt="RecycMate" className="w-32 h-32 mb-2 object-contain drop-shadow-md scale-[1.2]" />
                    <h1 className="text-5xl font-bold mb-6">Create your RecycMate Account</h1>
                </div>
                <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <form onSubmit={handleSignUpInit} className="card-body pb-0">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Full Name</span>
                            </label>
                            <input name="name" type="text" placeholder="Your Name" className="input input-bordered" required />
                        </div>
                        
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Profile Picture</span>
                            </label>
                            <input 
                                onChange={handleImageUpload}
                                type="file" 
                                accept="image/*"
                                className="file-input file-input-bordered file-input-success w-full max-w-xs" 
                                required
                            />
                            {uploading && <p className="text-xs text-green-600 mt-1 italic text-center">Uploading image...</p>}
                            {profilePic && (
                                <div className="mt-2 flex justify-center">
                                    <img src={profilePic} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-green-500" />
                                </div>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Email</span>
                            </label>
                            <input name="email" type="email" placeholder="email@example.com" className="input input-bordered" required />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Password</span>
                            </label>
                            <div className="relative">
                                <input 
                                    name="password" 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
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
                        </div>
                        <div className="form-control mt-6">
                            <button 
                                disabled={uploading || verifying} 
                                className="btn btn-success text-white"
                            >
                                {verifying ? <span className="loading loading-spinner"></span> : "Sign Up"}
                            </button>
                        </div>
                    </form>
                    <div className="divider px-8">OR</div>
                    <div className="px-8 pb-8 text-center">
                        <button onClick={handleGoogleSignIn} className="btn btn-outline btn-success w-full">
                            Sign Up with Google
                        </button>
                        <p className='mt-4'>
                            Already have an account? <Link to="/login" className='text-green-600 font-bold'>Login</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="modal modal-open">
                    <div className="modal-box rounded-3xl p-8 bg-white max-w-sm">
                        <h3 className="text-2xl font-black text-gray-800 mb-2 text-center">Verify Email</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            We've sent a 6-digit OTP to <br />
                            <span className="font-bold text-gray-700">{tempUserData?.email}</span>
                        </p>
                        <div className="form-control">
                            <input 
                                type="text" 
                                maxLength="6"
                                placeholder="000000" 
                                className="input input-bordered text-center text-2xl tracking-[0.5em] font-bold h-16 rounded-2xl focus:border-green-500"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                        <div className="mt-4 text-center">
                            <button 
                                onClick={handleResendOtp}
                                disabled={countdown > 0 || verifying}
                                className={`text-sm font-bold ${countdown > 0 ? 'text-gray-400' : 'text-green-600 hover:underline'}`}
                            >
                                {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                            </button>
                        </div>
                        <div className="modal-action mt-8 flex-col gap-3">
                            <button 
                                onClick={handleVerifyOtp} 
                                disabled={verifying || otp.length !== 6}
                                className="btn btn-success text-white w-full rounded-2xl h-14"
                            >
                                {verifying ? <span className="loading loading-spinner"></span> : "Verify & Register"}
                            </button>
                            <button 
                                onClick={() => setShowOtpModal(false)} 
                                className="btn btn-ghost w-full rounded-2xl"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/60 backdrop-blur-sm"></div>
                </div>
            )}
        </div>
    );
};

export default SignUp;
