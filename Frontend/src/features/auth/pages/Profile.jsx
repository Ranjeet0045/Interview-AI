import { useState } from "react";
import { useNavigate } from "react-router";
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
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 3000);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await handleUpdateProfile({ username, email });
            showToast("Profile updated successfully!", "success");
            setIsEditing(false);
        } catch {
            showToast("Failed to update profile. Please try again.", "error");
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
            <div className="profile-page-header">
                <button
                    type="button"
                    className="profile-back-btn"
                    onClick={() => navigate("/")}
                >
                    ← Back to Home
                </button>
                <h1>My Profile</h1>
            </div>

            <div className="profile-card">
                <div className="profile-avatar" aria-hidden>
                    {initial}
                </div>

                {!isEditing ? (
                    <>
                        <h2 className="profile-username">{user?.username}</h2>
                        <p className="profile-email">{user?.email}</p>
                    </>
                ) : (
                    <>
                        <input
                            className="profile-edit-input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            aria-label="Username"
                        />
                        <input
                            className="profile-edit-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            aria-label="Email"
                        />
                    </>
                )}

                <div className="profile-actions">
                    {!isEditing ? (
                        <button
                            type="button"
                            className="profile-edit-btn"
                            onClick={() => {
                                setUsername(user?.username || "");
                                setEmail(user?.email || "");
                                setIsEditing(true);
                            }}
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="profile-save-btn"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Saving…" : "Save Changes"}
                            </button>
                            <button
                                type="button"
                                className="profile-cancel-btn"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>

                <div className="profile-details">
                    <h3>Account Information</h3>
                    <div className="profile-detail-item">
                        <span className="profile-detail-label">Username</span>
                        <span className="profile-detail-value">
                            {user?.username}
                        </span>
                    </div>
                    <div className="profile-detail-item">
                        <span className="profile-detail-label">Email</span>
                        <span className="profile-detail-value">
                            {user?.email}
                        </span>
                    </div>
                </div>
            </div>

            <div
                className={`profile-toast ${toast.type} ${toast.show ? "show" : ""}`}
                role="status"
            >
                {toast.message}
            </div>
        </div>
    );
};

export default Profile;
