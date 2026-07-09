import { useState } from "react";
import "../auth.form.scss";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

const HIGHLIGHTS = [
  { text: <>Enroll once — <strong>every plan you draft</strong> stays on your desk.</> },
  { text: <>Import a résumé <strong>or</strong> write a short bio; both work.</> },
  { text: <>Plans arrive in about <strong>thirty seconds</strong>.</> },
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
    if (success) navigate("/");
    else setErrorMsg("That username or email is already claimed. Try another.");
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" aria-hidden />
        <p>Preparing your study desk…</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <aside className="auth-brand-panel">
        <div className="auth-brand-top">
          <span className="brand-mark">i</span>
          <span>
            <div className="brand-name">Interview AI</div>
            <div className="brand-tag">Your Study Desk</div>
          </span>
        </div>

        <div className="auth-brand-body">
          <div className="auth-kicker">Chapter 00 · Enroll</div>
          <h1>
            Open a <em>study desk</em><br />
            of your own.
          </h1>
          <p className="lede">
            One account. Every job you apply for becomes a small,
            structured curriculum you can actually follow.
          </p>

          <ol className="auth-brand-list">
            {HIGHLIGHTS.map((h, i) => (
              <li key={i}>
                <span className="list-num">{String(i + 1).padStart(2, "0")}.</span>
                <span className="list-text">{h.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <blockquote className="auth-brand-quote">
          &ldquo;The best interviews are read, not improvised.&rdquo;
        </blockquote>
      </aside>

      <div className="auth-form-panel">
        <div className="auth-card page-in">
          <div className="auth-mobile-brand">
            <span className="m-mark">i</span> Interview AI
          </div>
          <div className="auth-card-header">
            <span className="card-kicker">— Enroll</span>
            <h2>
              Open your <em>study desk</em>
            </h2>
            <p>Free to enroll — start reading your first job in minutes.</p>
          </div>

          {errorMsg && <div className="auth-error" data-testid="register-error">{errorMsg}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className={`field ${username ? "has-value" : ""}`}>
              <input
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                id="username"
                name="username"
                autoComplete="username"
                required
                value={username}
                data-testid="username-input"
              />
              <label htmlFor="username">Username</label>
            </div>

            <div className={`field ${email ? "has-value" : ""}`}>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                data-testid="email-input"
              />
              <label htmlFor="email">Email address</label>
            </div>

            <div className={`field ${password ? "has-value" : ""}`}>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="password"
                name="password"
                autoComplete="new-password"
                required
                value={password}
                data-testid="password-input"
              />
              <label htmlFor="password">Choose a password</label>
            </div>

            <button
              className="sanctum-btn primary auth-submit"
              type="submit"
              data-testid="register-submit"
            >
              Open my study desk
            </button>
          </form>

          <p className="auth-alt">
            Already enrolled? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
