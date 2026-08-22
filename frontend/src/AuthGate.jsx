import React, { useState } from 'react';
import { login, register } from './api/client';

export default function AuthGate({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onAuthenticated(email);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-indigo-600 text-white font-black px-2.5 py-1 rounded-lg text-lg tracking-wider">MM</div>
          <span className="font-bold text-lg tracking-tight text-white">ModelMint</span>
        </div>
        <h2 className="text-slate-200 font-semibold mb-1">{mode === "login" ? "Sign in" : "Create an account"}</h2>
        <p className="text-slate-500 text-xs mb-5">Secure access to the AI Trust Panel</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="At least 8 characters"
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition disabled:opacity-50 mt-2"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          className="w-full text-xs text-slate-500 hover:text-slate-300 mt-4 transition"
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
