import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [mode, setMode] = useState("password"); // "password" | "otp"
    const [otpStep, setOtpStep] = useState("email"); // "email" | "verify"
    const [input, setInput] = useState({ email: "", password: "", role: "Student" });
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const changeInputHandler = (e) => setInput({ ...input, [e.target.name]: e.target.value });

    const saveAndRedirect = (user) => {
        const userToSave = { ...user };
        if (userToSave.profile_photo && !userToSave.profile_photo.startsWith("http")) {
            userToSave.profile_photo = `http://localhost:5000${userToSave.profile_photo}`;
        }
        login(userToSave);
        navigate("/");
    };

    // ── Password login ──────────────────────────────────────────────────────
    const submitHandler = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            });
            const data = await res.json();
            if (res.ok && data.success) saveAndRedirect(data.user);
            else setError(data.message || "Invalid login credentials");
        } catch {
            setError("Server error, try again later.");
        } finally {
            setLoading(false);
        }
    };

    // ── OTP login: send ─────────────────────────────────────────────────────
    const sendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/login-otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: input.email, role: input.role }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setOtpStep("verify");
                startCooldown();
            } else {
                setError(data.message || "Failed to send OTP");
            }
        } catch {
            setError("Server error, try again later.");
        } finally {
            setLoading(false);
        }
    };

    // ── OTP login: verify ───────────────────────────────────────────────────
    const verifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/login-otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: input.email, otp }),
            });
            const data = await res.json();
            if (res.ok && data.success) saveAndRedirect(data.user);
            else setError(data.message || "Invalid OTP");
        } catch {
            setError("Server error, try again later.");
        } finally {
            setLoading(false);
        }
    };

    const startCooldown = () => {
        setCooldown(60);
        const t = setInterval(() => {
            setCooldown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
        }, 1000);
    };

    const switchMode = (m) => { setMode(m); setError(""); setOtpStep("email"); setOtp(""); };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* LEFT */}
            <div className="w-1/2 bg-blue-800 text-white flex flex-col justify-center items-center p-10">
                <img src="/bridge-logo.jpg" alt="Logo" className="w-32 mb-6" />
                <h1 className="text-3xl font-bold mb-3">Welcome Back!</h1>
                <p className="text-sm text-blue-200">Login to continue to CampusBridge.</p>
            </div>

            {/* RIGHT */}
            <div className="w-1/2 flex flex-col justify-center items-center">
                <div className="w-full max-w-sm bg-white shadow-2xl rounded-xl p-8 border border-gray-200">
                    <div className="flex flex-col items-center mb-5">
                        <img src="/rmcetlogo1.jpg" alt="RMCET Logo" className="w-16 h-16 mb-2" />
                        <h1 className="text-xl font-bold text-gray-800 tracking-wide mt-1">Student Placement Portal</h1>
                    </div>

                    {/* Tabs */}
                    <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-5 text-sm font-medium">
                        <button
                            onClick={() => switchMode("password")}
                            className={`flex-1 py-2 transition ${mode === "password" ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                        >
                            Password
                        </button>
                        <button
                            onClick={() => switchMode("otp")}
                            className={`flex-1 py-2 transition ${mode === "otp" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                        >
                            Login with OTP
                        </button>
                    </div>

                    {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}

                    {/* Role selector (shared) */}
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700">Role</label>
                        <div className="flex gap-6 mt-2 text-sm">
                            {["Student", "Alumni", "Admin"].map((role) => (
                                <label key={role} className="flex items-center gap-1 text-gray-700">
                                    <input type="radio" name="role" value={role} checked={input.role === role} onChange={changeInputHandler} className="form-radio text-blue-600" />
                                    {role}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ── Password mode ── */}
                    {mode === "password" && (
                        <form onSubmit={submitHandler} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <input type="text" name="email" value={input.email} onChange={changeInputHandler} placeholder="Enter email" required className="w-full mt-1 p-2 border rounded-md text-sm bg-blue-50/70 border-blue-200 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <input type="password" name="password" value={input.password} onChange={changeInputHandler} placeholder="********" required className="w-full mt-1 p-2 border rounded-md text-sm bg-blue-50/70 border-blue-200 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-3 bg-gray-800 text-white rounded-md font-semibold hover:bg-gray-900 transition shadow-md mt-2 disabled:opacity-60">
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>
                    )}

                    {/* ── OTP mode: email step ── */}
                    {mode === "otp" && otpStep === "email" && (
                        <form onSubmit={sendOtp} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" value={input.email} onChange={changeInputHandler} placeholder="Enter your registered email" required className="w-full mt-1 p-2 border rounded-md text-sm bg-blue-50/70 border-blue-200 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-60">
                                {loading ? "Sending..." : "Send OTP"}
                            </button>
                        </form>
                    )}

                    {/* ── OTP mode: verify step ── */}
                    {mode === "otp" && otpStep === "verify" && (
                        <form onSubmit={verifyOtp} className="space-y-4">
                            <p className="text-sm text-gray-500 text-center">OTP sent to <span className="font-medium text-gray-700">{input.email}</span></p>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Enter OTP</label>
                                <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="6-digit OTP" required className="w-full mt-1 p-2 border rounded-md text-sm bg-blue-50/70 border-blue-200 focus:ring-blue-500 focus:border-blue-500 tracking-widest text-center text-lg" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-60">
                                {loading ? "Verifying..." : "Verify & Login"}
                            </button>
                            <button type="button" disabled={cooldown > 0} onClick={(e) => { setOtp(""); sendOtp(e); }} className="w-full py-2 text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline">
                                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                            </button>
                        </form>
                    )}

                    <div className="text-center mt-4">
                        <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-gray-700">Forgot password?</Link>
                    </div>
                    <p className="text-center text-sm mt-3">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-blue-700 hover:underline">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
