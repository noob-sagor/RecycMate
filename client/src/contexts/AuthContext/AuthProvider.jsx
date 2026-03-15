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

  const updateUserProfile = (profileInfo) => {
    return updateProfile(auth.currentUser, profileInfo);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      queryClient.clear();
    } catch (error) {
      toast.error("Failed to log out.");
      console.error(error);
    }
  };

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unSubscribe();
    };
  }, []);


  const authInfo = {
    createUser,
    signIn,
    user,
    setUser,
    role,
    loading: loading || roleLoading,
    logout,
    signInWithGoogle,
    updateUserProfile,
  };
  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );


export default AuthProvider;