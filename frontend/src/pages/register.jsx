import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Register() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ name: "", email: "", password: "", general: "" });
    const [success, setSuccess] = useState(false);

    const register = async () => {
        // Reset errors
        setErrors({ name: "", email: "", password: "", general: "" });

        let hasError = false;
        const newErrors = { name: "", email: "", password: "", general: "" };

        if (!name.trim()) {
            newErrors.name = "Name is required.";
            hasError = true;
        }

        if (!email.trim()) {
            newErrors.email = "Email is required.";
            hasError = true;
        } else if (!email.toLowerCase().endsWith("@gmail.com")) {
            newErrors.email = "Please use a @gmail.com email address.";
            hasError = true;
        }

        if (!password) {
            newErrors.password = "Password is required.";
            hasError = true;
        } else if (password.length < 6) {
            newErrors.password = "Password must be more than 5 characters long.";
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        try {
            await api.post("/auth/register", {
                name,
                email,
                password
            });

            setSuccess(true);
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error("Registration error:", error);
            const msg = error.response?.data?.message || "Registration failed. Please check your details.";
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
                    <h2 className="auth-title">Create an Account</h2>
                    <p className="auth-subtitle">Join us to start ordering products</p>
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
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={errors.email ? "input-error" : ""}
                    />
                    {errors.email && <span className="auth-error-text">⚠ {errors.email}</span>}
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

                <button onClick={register} className="auth-btn-primary" disabled={success}>
                    {success ? "Success!" : "Create Account"}
                </button>

                <div className="auth-footer">
                    <small>Already have an account?</small>
                    <button onClick={() => navigate("/login")} className="auth-link-btn">Login</button>
                </div>
            </div>

            {success && (
                <div className="auth-success-backdrop">
                    <div className="auth-success-popup">
                        <div className="auth-success-icon">✓</div>
                        <div className="auth-success-text">Registered successfully</div>
                        <div className="auth-success-subtext">Redirecting to login...</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Register;