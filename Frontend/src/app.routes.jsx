import { createBrowserRouter } from "react-router";
import Register from "./features/auth/pages/Register";
import Login from "./features/auth/pages/Login";
import Protected from "./features/auth/components/Protected.jsx";
import Home from "./features/interview/pages/Home.jsx";
import Interview from "./features/interview/pages/interview.jsx";
import Profile from "./features/auth/pages/Profile.jsx";
import AppShell from "./components/layout/AppShell.jsx";

export const router = createBrowserRouter([
    {
        element: <AppShell />,
        children: [
            {
                path: "/login",
                element: <Login/>
            },
            {
                path: "/register",
                element: <Register/>
            },
            {
                path:"/",
                element:<Protected><Home/></Protected>
            },
            {
                path:"/profile",
                element: <Protected><Profile/></Protected>
            },
            {
                path:"/interview/:interviewId",
                element: <Protected><Interview/></Protected>
            }
        ]
    }
])