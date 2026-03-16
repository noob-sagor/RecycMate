import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import DashboardLayout from "../layout/DashboardLayout/DashboardLayout";
import DashboardHome from "../pages/Dashboard/DashboardHome";
import ManageUsers from "../pages/Dashboard/Admin/ManageUsers";
import UserDashboard from "../pages/Dashboard/User/UserDashboard";
import AgentDashboard from "../pages/Dashboard/Agent/AgentDashboard";
import StaffDashboard from "../pages/Dashboard/Staff/StaffDashboard";
import PrivateRoute from "../routes/PrivateRoute";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/signup",
                element: <SignUp />,
            },
            {
                path: "/dashboard",
                element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
                children: [
                    {
                        path: "",
                        element: <DashboardHome />,
                    },
                    {
                        path: "manage-users",
                        element: <ManageUsers />,
                    },
                    {
                        path: "user-dashboard",
                        element: <UserDashboard />,
                    },
                    {
                        path: "assigned-pickups",
                        element: <AgentDashboard />,
                    },
                    {
                        path: "center-inventory",
                        element: <StaffDashboard />,
                    },
                ],
            },
        ],
    },
]);

export default router;
