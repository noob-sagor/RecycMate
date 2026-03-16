import React, { createContext, useEffect, useState } from 'react';
import { 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    signOut, 
    updateProfile 
} from "firebase/auth";
import { auth } from '../firebase/firebase.config';
import axios from 'axios';

export const AuthContext = createContext(null);

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [dbUser, setDbUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signInWithGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    };

    const logOut = () => {
        setLoading(true);
        setDbUser(null);
        return signOut(auth);
    };

    const updateUserProfile = (name, photo) => {
        return updateProfile(auth.currentUser, {
            displayName: name, 
            photoURL: photo
        });
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            
            if (currentUser?.email) {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/email/${currentUser.email}`);
                    setDbUser(res.data);
                } catch (error) {
                    console.error("Error fetching db user", error);
                }
            } else {
                setDbUser(null);
            }
            
            setLoading(false);
        });
        return () => {
            return unsubscribe();
        };
    }, []);

    const authInfo = {
        user,
        dbUser,
        setUser,
        setDbUser,
        loading,
        createUser,
        signIn,
        signInWithGoogle,
        logOut,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
