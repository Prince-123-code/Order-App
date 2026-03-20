import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false, userOnly = false }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    // If there is no token, redirect to the login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Role-based restrictions
    if (adminOnly && role !== "ADMIN") {
        return <Navigate to="/dashboard" replace />;
    }

    if (userOnly && role === "ADMIN") {
        return <Navigate to="/dashboard" replace />;
    }

    // Otherwise, allow access to the route
    return children;
}

export default ProtectedRoute;
