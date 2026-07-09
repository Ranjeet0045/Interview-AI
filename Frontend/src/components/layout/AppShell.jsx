import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { BookOpen, User, LogOut } from "lucide-react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import "./appShell.scss";

const NAV_LINKS = [
  { to: "/", label: "Desk" },
  { to: "/profile", label: "Study Card" },
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
    [pathname]
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
      <header className="app-nav" data-testid="app-nav">
        <div className="app-nav-inner">
          <Link className="app-brand" to="/" data-testid="brand-link">
            <span className="brand-mark" aria-hidden>i</span>
            <span>
              <span className="brand-text">Interview AI</span>
              <span className="brand-sub">Your Study Desk</span>
            </span>
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
                data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="app-nav-actions">
            {!user ? (
              <div className="app-auth-actions">
                <Link className="sanctum-btn ghost" to="/login" data-testid="login-link">
                  Sign in
                </Link>
                <Link className="sanctum-btn primary" to="/register" data-testid="register-link">
                  Enroll
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
                  data-testid="profile-btn"
                >
                  <span className="app-profile-avatar" aria-hidden>
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                  <span className="app-profile-name">{user.username}</span>
                </button>

                {profileOpen && (
                  <div className="app-profile-menu" role="menu" data-testid="profile-menu">
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
                        navigate("/");
                      }}
                      data-testid="menu-desk"
                    >
                      <BookOpen size={16} strokeWidth={1.75} /> The Desk
                    </button>
                    <button
                      type="button"
                      className="app-menu-item"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/profile");
                      }}
                      data-testid="menu-profile"
                    >
                      <User size={16} strokeWidth={1.75} /> Study Card
                    </button>
                    <button
                      type="button"
                      className="app-menu-item danger"
                      onClick={onLogout}
                      data-testid="menu-logout"
                    >
                      <LogOut size={16} strokeWidth={1.75} /> Sign out
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
              data-testid="mobile-menu-btn"
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
          <span className="app-footer-brand">Interview AI</span>
          <span className="app-footer-motto">
            &ldquo;Read. Practise. Interview with quiet confidence.&rdquo;
          </span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
