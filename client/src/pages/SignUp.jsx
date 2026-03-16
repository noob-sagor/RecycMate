import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import toast from 'react-hot-toast';
import axios from 'axios';
import { imageUpload } from '../utils';

const SignUp = () => {
    const { createUser, updateUserProfile, signInWithGoogle, logOut, setUser } = useContext(AuthContext);
    const [profilePic, setProfilePic] = useState('');
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

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

    const handleSignUp = (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value;
        const email = form.email.value;
        const password = form.password.value;

        if (!profilePic) {
            return toast.error('Please upload a profile picture first!');
        }

        const newUser = { name, email, photo: profilePic, role: 'user' };

        createUser(email, password)
            .then(result => {
                updateUserProfile(name, profilePic)
                    .then(async () => {
                        // Save user details to MongoDB via backend
                        try {
                            const res = await axios.post(`${import.meta.env.VITE_API_URL}/users`, newUser);
                            if (res.data.insertedId || res.data.message === 'user already exists') {
                                toast.success('Account Created! Please login.');
                                logOut().then(() => {
                                    navigate('/login');
                                });
                            }
                        } catch (saveError) {
                            console.error(saveError);
                            toast.error("Failed to save user in database.");
                        }
                    })
                    .catch(error => {
                        toast.error(error.message);
                    });
            })
            .catch(error => {
                toast.error(error.message);
            });
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
                <div className="text-center">
                    <h1 className="text-5xl font-bold mb-6">Create your RecycMate Account</h1>
                </div>
                <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <form onSubmit={handleSignUp} className="card-body pb-0">
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
                            <input name="password" type="password" placeholder="••••••••" className="input input-bordered" required />
                        </div>
                        <div className="form-control mt-6">
                            <button 
                                disabled={uploading} 
                                className="btn btn-success text-white"
                            >
                                {uploading ? "Uploading..." : "Sign Up"}
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
        </div>
    );
};

export default SignUp;
