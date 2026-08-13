import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import PatientDashboard from "../pages/Patient/PatientDashboard";
import DoctorDashboard from "../pages/Doctor/DoctorDashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";

import NotFound from "../pages/NotFound/NotFound";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Routes */}

                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                {/* Patient */}

                <Route
                    path="/patient"
                    element={
                        <ProtectedRoute role="patient">
                            <PatientDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Doctor */}

                <Route
                    path="/doctor"
                    element={
                        <ProtectedRoute role="doctor">
                            <DoctorDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Admin */}

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* 404 */}

                <Route path="*" element={<NotFound />} />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;