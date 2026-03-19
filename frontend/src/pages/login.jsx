import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ name: "", password: "", general: "" });

    const login = async () => {
        setErrors({ name: "", password: "", general: "" });
        
        let hasError = false;
        const newErrors = { name: "", password: "", general: "" };

        if (!name.trim()) {
            newErrors.name = "Name is required.";
            hasError = true;
        }

        if (!password) {
            newErrors.password = "Password is required.";
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        try {

            const res = await api.post("/auth/login", {
                name,
                password
            });

            localStorage.setItem("token", res.data.access_token);

            const token = res.data.access_token;
            const payload = JSON.parse(atob(token.split('.')[1]));
            localStorage.setItem("role", payload.role);
            localStorage.setItem("userName", payload.name || name);

            navigate("/dashboard");

        } catch (err) {
            console.error("Login failed:", err);
            const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
            setErrors({ ...newErrors, general: msg });
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
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Login to access your dashboard</p>
                </div>

                <div className="auth-input-group">
                    <input 
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={errors.name ? "input-error" : ""}
                    />
                    {errors.name && <span className="auth-error-text">⚠ {errors.name}</span>}
                </div>

                <div className="auth-input-group">
                    <input 
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={errors.password ? "input-error" : ""}
                    />
                    {errors.password && <span className="auth-error-text">⚠ {errors.password}</span>}
                </div>

                {errors.general && <div className="auth-general-error">{errors.general}</div>}

                <button onClick={login} className="auth-btn-primary">Login</button>

                <div className="auth-footer">
                    <small>Don't have an account?</small>
                    <button onClick={() => navigate("/register")} className="auth-link-btn">Register</button>
                </div>
            </div>
        </div>
    );
}

export default Login;