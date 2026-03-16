import React from "react";
import useAuth from "../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import Loading from "../components/Loading";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <Navigate state={{ from: location.pathname }} to="/login"></Navigate>
    );
  }
  return <div>{children} </div>;
};

export default PrivateRoute;