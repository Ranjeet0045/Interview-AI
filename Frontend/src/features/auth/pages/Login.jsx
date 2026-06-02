import { useState } from "react";
import "../auth.form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

const AUTH_FEATURES = [
  { icon: "🎯", text: "AI-powered job match scoring" },
  { icon: "📋", text: "Custom technical & behavioral questions" },
  { icon: "🗺️", text: "Personalized preparation roadmap" },
];

const Login = () => {
  const { handleLogin, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin({ email, password });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" aria-hidden />
        <p>Signing you in…</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <aside className="auth-brand-panel" aria-hidden={false}>
        <div className="auth-brand-content">
          <div className="auth-logo">
            <span className="auth-logo-icon">✨</span>
            Interview AI
          </div>
          <h1>Prepare smarter. Interview with confidence.</h1>
          <p>
            Turn any job posting into a tailored interview plan — questions,
            answers, and a day-by-day roadmap built for you.
          </p>
          <ul className="auth-features">
            {AUTH_FEATURES.map((f) => (
              <li key={f.text}>
                <span className="feature-icon">{f.icon}</span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-mobile-brand">
            <span className="auth-logo-icon">✨</span>
            Interview AI
          </div>
          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue to your interview plans</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
            <button
              className="button button-primary auth-submit"
              type="submit"
            >
              Sign in
            </button>
          </form>
          <p className="auth-footer-text">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
