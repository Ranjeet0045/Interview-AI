import { useState } from "react";
import "../auth.form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

const HIGHLIGHTS = [
  { text: <>An <strong>AI reading room</strong> that studies the job with you.</> },
  { text: <>Model answers, <strong>skill gaps</strong>, and a day-by-day roadmap.</> },
  { text: <>Every plan saved to your <strong>study desk</strong> — quietly.</> },
];

const Login = () => {
  const { handleLogin, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const success = await handleLogin({ email, password });
    if (success) navigate("/");
    else setErrorMsg("Those credentials didn't match. Try again.");
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" aria-hidden />
        <p>Opening your study desk…</p>
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
          <div className="auth-kicker">Chapter 01 · Welcome</div>
          <h1>
            A quiet place to <em>prepare</em>,<br />
            think, and interview well.
          </h1>
          <p className="lede">
            Paste a role, hand us your résumé — Interview AI drafts the questions,
            the model answers, and the reading plan.
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
          &ldquo;Prepare in silence — let the results speak.&rdquo;
        </blockquote>
      </aside>

      <div className="auth-form-panel">
        <div className="auth-card page-in">
          <div className="auth-mobile-brand">
            <span className="m-mark">i</span> Interview AI
          </div>
          <div className="auth-card-header">
            <span className="card-kicker">— Sign in</span>
            <h2>
              Return to your <em>desk</em>
            </h2>
            <p>Enter your credentials to continue your interview studies.</p>
          </div>

          {errorMsg && <div className="auth-error" data-testid="login-error">{errorMsg}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
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
                autoComplete="current-password"
                required
                value={password}
                data-testid="password-input"
              />
              <label htmlFor="password">Password</label>
            </div>

            <button
              className="sanctum-btn primary auth-submit"
              type="submit"
              data-testid="login-submit"
            >
              Sign in to Interview AI
            </button>
          </form>

          <p className="auth-alt">
            New to Interview AI? <Link to="/register">Enroll here →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
