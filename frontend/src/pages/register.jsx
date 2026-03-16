import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Register() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const register = async () => {
        try {
            await api.post("/auth/register", {
                name,
                email,
                password
            });

            alert("User Registered!");
            navigate("/login");
        } catch (error) {
            console.error("Registration error:", error);
            alert(error.response?.data?.message || "Registration failed. Please check your details.");
        }
    };

    return (
        <div className="page-container">
            <div className="form-container">
                <div className="auth-header">
                    <div className="auth-logo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        AppMart
                    </div>
                    <h2 className="auth-title">Create an Account</h2>
                    <p className="auth-subtitle">Join us to start ordering products</p>
                </div>

                <input placeholder="Name"
                    onChange={(e) => setName(e.target.value)} />

                <input placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)} />

                <input type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)} />

                <button onClick={register} className="auth-btn-primary">Create Account</button>

                <div className="auth-footer">
                    <small>Already have an account?</small>
                    <button onClick={() => navigate("/login")} className="auth-link-btn">Login</button>
                </div>
            </div>
        </div>
    );
}

export default Register;