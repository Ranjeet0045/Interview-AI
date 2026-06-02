import { useState } from "react";
import "../auth.form.scss";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

const AUTH_FEATURES = [
  { icon: "📄", text: "Upload resume or describe yourself" },
  { icon: "⚡", text: "Reports ready in about 30 seconds" },
  { icon: "💾", text: "Save and revisit all your plans" },
];

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { loading, handleRegister } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const success = await handleRegister({ username, email, password });
    if (success) {
      navigate("/");
    } else {
      setErrorMsg("Failed to create account. Username or email might already be taken.");
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" aria-hidden />
        <p>Creating your account…</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <aside className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-logo">
            <span className="auth-logo-icon">✨</span>
            Interview AI
          </div>
          <h1>Start your interview prep journey</h1>
          <p>
            Join thousands preparing with AI-generated strategies tailored to
            each role you apply for.
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
            <h2>Create account</h2>
            <p>Free to sign up — start analyzing jobs in minutes</p>
          </div>
          {errorMsg && (
            <div style={{
              color: "#ef4444",
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "0.375s",
              padding: "0.75rem",
              marginBottom: "1rem",
              textAlign: "center",
              fontSize: "0.875rem"
            }}>
              {errorMsg}
            </div>
          )}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                id="username"
                name="username"
                placeholder="Choose a username"
                autoComplete="username"
                required
              />
            </div>
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
                placeholder="Create a strong password"
                autoComplete="new-password"
                required
              />
            </div>
            <button
              className="button button-primary auth-submit"
              type="submit"
            >
              Create account
            </button>
          </form>
          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
