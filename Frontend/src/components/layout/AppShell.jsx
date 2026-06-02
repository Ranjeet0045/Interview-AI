import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../features/auth/hooks/useAuth";
import "./appShell.scss";

const NAV_LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
];

export default function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const isAuthPage = useMemo(
    () => pathname === "/login" || pathname === "/register",
    [pathname],
  );

  useEffect(() => {
    const onDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [profileOpen]);

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  if (isAuthPage) return <Outlet />;

  return (
    <div className="app-shell">
      <header className="app-nav">
        <div className="app-nav-inner">
          <Link className="app-brand" to="/">
            <span className="app-brand-mark" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </span>
            <span className="app-brand-text">Interview AI</span>
          </Link>

          <nav className={`app-nav-links ${mobileOpen ? "open" : ""}`}>
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                className={({ isActive }) =>
                  `app-nav-link ${isActive ? "active" : ""}`
                }
                to={l.to}
                end={l.to === "/"}
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="app-nav-actions">
            <div className="app-lang" aria-label="Language selector">
              <span className="app-lang-label">EN</span>
              <span className="app-lang-caret" aria-hidden>
                ▾
              </span>
            </div>

            {!user ? (
              <div className="app-auth-actions">
                <Link className="app-btn app-btn-ghost" to="/login">
                  Login
                </Link>
                <Link className="app-btn app-btn-primary" to="/register">
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="app-profile" ref={profileRef}>
                <button
                  type="button"
                  className="app-profile-btn"
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                  title={user.username}
                >
                  <span className="app-profile-avatar" aria-hidden>
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                  <span className="app-profile-name">{user.username}</span>
                </button>

                {profileOpen && (
                  <div className="app-profile-menu" role="menu">
                    <div className="app-profile-meta">
                      <div className="app-profile-title">{user.username}</div>
                      <div className="app-profile-sub">{user.email}</div>
                    </div>
                    <div className="app-profile-divider" />
                    <button
                      type="button"
                      className="app-menu-item"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/profile");
                      }}
                    >
                      My Profile
                    </button>
                    <button
                      type="button"
                      className="app-menu-item danger"
                      onClick={onLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="app-nav-burger"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="app-footer-inner">
          <div className="app-footer-left">
            <span className="app-footer-brand">Interview AI</span>
            <span className="app-footer-dot" aria-hidden>
              •
            </span>
            <span className="app-footer-note">AI-powered interview planning</span>
          </div>
          <div className="app-footer-right">
            <span>Built for fast iteration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

