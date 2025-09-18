import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      nav("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-red-100 flex items-center justify-center">
      <div className="flex flex-col lg:grid lg:grid-cols-2 w-full max-w-6xl shadow-2xl rounded-2xl overflow-hidden animate-fall-down">
        
        {/* Left side */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-rose-700 text-white p-12 text-center animate-slide-left">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-28 h-28 mb-6 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-6xl font-extrabold tracking-tight drop-shadow-lg">
            LeaveFlow
          </h1>
          <p className="mt-6 text-lg max-w-md leading-relaxed">
            Streamline your leave management process with{" "}
            <span className="font-semibold">ease</span> and{" "}
            <span className="font-semibold">efficiency</span>.
          </p>
        </div>

        {/* Right side (form) */}
        <div className="flex items-center justify-center bg-white p-10 sm:p-16 lg:p-20 animate-slide-right">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:hidden">
              <h1 className="text-4xl font-extrabold text-red-600 animate-pulse">
                LeaveFlow
              </h1>
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold text-slate-800">
                Log in to your account
              </h2>
              <p className="text-slate-500 text-base">
                Welcome back! Please enter your details.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              {error && (
                <div
                  className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-md text-sm animate-fall-down"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500 transition-all duration-200"
                  placeholder="e.g., admin@example.com"
                  required
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-lg text-base font-semibold shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-wait"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
