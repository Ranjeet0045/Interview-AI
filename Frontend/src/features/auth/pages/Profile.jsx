import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "../auth.profile.scss";

const Profile = () => {
  const navigate = useNavigate();
  const { user, handleUpdateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await handleUpdateProfile({ username, email });
      showToast("Study card updated.", "success");
      setIsEditing(false);
    } catch {
      showToast("Could not save changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setUsername(user?.username || "");
    setEmail(user?.email || "");
    setIsEditing(false);
  };

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : "?";

  return (
    <div className="profile-page">
      <div className="profile-head">
        <button
          type="button"
          className="back"
          onClick={() => navigate("/")}
          data-testid="profile-back-btn"
        >
          <ChevronLeft size={16} strokeWidth={1.75} /> The Desk
        </button>
        <div>
          <div className="kicker-text">— Study Card</div>
          <h1>
            Your <em>reader profile</em>
          </h1>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar" aria-hidden>
          {initial}
        </div>

        {!isEditing ? (
          <>
            <h2 className="profile-name" data-testid="profile-username">{user?.username}</h2>
            <p className="profile-email" data-testid="profile-email">{user?.email}</p>
          </>
        ) : (
          <div className="profile-edit-fields">
            <div className={`field ${username ? "has-value" : ""}`}>
              <input
                type="text"
                id="p-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="profile-edit-username"
              />
              <label htmlFor="p-username">Username</label>
            </div>
            <div className={`field ${email ? "has-value" : ""}`}>
              <input
                type="email"
                id="p-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="profile-edit-email"
              />
              <label htmlFor="p-email">Email</label>
            </div>
          </div>
        )}

        <div className="profile-actions">
          {!isEditing ? (
            <button
              type="button"
              className="sanctum-btn primary"
              onClick={() => {
                setUsername(user?.username || "");
                setEmail(user?.email || "");
                setIsEditing(true);
              }}
              data-testid="profile-edit-btn"
            >
              Edit Study Card
            </button>
          ) : (
            <>
              <button
                type="button"
                className="sanctum-btn primary"
                onClick={handleSave}
                disabled={saving}
                data-testid="profile-save-btn"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                className="sanctum-btn ghost"
                onClick={handleCancel}
                data-testid="profile-cancel-btn"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <div className="profile-info">
          <h3>Account Details</h3>
          <div className="profile-row">
            <span className="k">Username</span>
            <span className="v">{user?.username}</span>
          </div>
          <div className="profile-row">
            <span className="k">Email</span>
            <span className="v">{user?.email}</span>
          </div>
        </div>
      </div>

      <div
        className={`profile-toast ${toast.type} ${toast.show ? "show" : ""}`}
        role="status"
        data-testid="profile-toast"
      >
        {toast.message}
      </div>
    </div>
  );
};

export default Profile;
