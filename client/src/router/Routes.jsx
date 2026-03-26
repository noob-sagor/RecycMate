import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import DashboardLayout from "../layout/DashboardLayout/DashboardLayout";
import DashboardHome from "../pages/Dashboard/DashboardHome";
import ManageUsers from "../pages/Dashboard/Admin/ManageUsers";
import AllPickups from "../pages/Dashboard/Admin/AllPickups";
import PickupHistory from "../pages/Dashboard/Admin/PickupHistory";
import UserDashboard from "../pages/Dashboard/User/UserDashboard";
import AgentDashboard from "../pages/Dashboard/Agent/AgentDashboard";
import StaffDashboard from "../pages/Dashboard/Staff/StaffDashboard";
import ElectricianDashboard from "../pages/Dashboard/Electrician/ElectricianDashboard";
import PrivateRoute from "../routes/PrivateRoute";
import PickupRequest from "../pages/PickupRequest";
import CollectionCenters from "../pages/CollectionCenters";

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
                path: "/centers",
                element: <CollectionCenters />,
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
                path: "/pickup-request",
                element: <PrivateRoute><PickupRequest /></PrivateRoute>,
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
                        path: "all-pickups",
                        element: <AllPickups />,
                    },
                    {
                        path: "pickup-history",
                        element: <PickupHistory />,
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
                        path: "assigned-tasks",
                        element: <ElectricianDashboard />,
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
