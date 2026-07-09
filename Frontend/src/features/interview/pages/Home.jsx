import { useState, useRef, useCallback } from "react";
import { Trash2, AlertTriangle, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import "../style/style.scss";
import { useInterview } from "../hooks/useInterview";
import { useAuth } from "../../auth/hooks/useAuth";
import JobDescriptionSection from "../components/UI/JobDescriptionSection";
import UserProfileSection from "../components/UI/UserProfileSection";
import { useNavigate } from "react-router";

function cleanReportTitle(raw) {
  if (!raw) return "Your study plan";
  let t = String(raw)
    .replace(/^Interview\s*Plan\s*[·\-–:]\s*/i, "")
    .replace(/^interview plan/i, "")
    .replace(/[…\-·:.\s]+$/g, "")
    .trim();
  if (!t) return "Your study plan";
  const firstFragment = t.split(/(?:[.!?\n]|\s+·\s+)/)[0] || t;
  if (firstFragment.length < t.length) t = firstFragment.trim();
  if (t.length > 48) {
    const trimmed = t.slice(0, 48);
    const lastSpace = trimmed.lastIndexOf(" ");
    t = (lastSpace > 20 ? trimmed.slice(0, lastSpace) : trimmed).trim() + "…";
  }
  return t;
}

const Home = () => {
  const { loading, generateReport, reports, deleteReport } = useInterview();
  const { user } = useAuth();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const resumeInputRef = useRef();

  const [deleteModal, setDeleteModal] = useState({ show: false, reportId: null, title: "" });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const navigate = useNavigate();

  const showToast = useCallback((message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3200);
  }, []);

  const handleGenerateReport = async () => {
    try {
      const resumeFile = resumeInputRef.current?.files?.[0];
      const data = await generateReport({ jobDescription, selfDescription, resumeFile });
      if (data && data._id) navigate(`/interview/${data._id}`);
      else showToast("The library was quiet — please try again.", "error");
    } catch (error) {
      showToast(
        error.response?.data?.message || error.message || "Could not draft plan.",
        "error"
      );
    }
  };

  const openDeleteModal = (reportId, title, e) => {
    e.stopPropagation();
    setDeleteModal({ show: true, reportId, title: cleanReportTitle(title) || "this plan" });
  };
  const closeDeleteModal = () => setDeleteModal({ show: false, reportId: null, title: "" });

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteReport(deleteModal.reportId);
      showToast("Plan removed from your desk.", "success");
      closeDeleteModal();
    } catch (error) {
      showToast("Could not remove plan: " + error.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" aria-hidden />
        <p>Bringing your desk to life…</p>
      </div>
    );
  }

  return (
    <div className="desk-page" data-testid="desk-page">
      {/* Hero */}
      <section className="desk-hero">
        <div>
          <span className="kicker">Chapter I · Your Study Desk</span>
          <h1 className="desk-hero-title">
            Read the role.<br />
            Prepare with <em>intent</em>.
          </h1>
          <p className="desk-hero-sub">
            Paste a job description on the left, hand us a résumé (or a short bio) on the
            right — Interview AI drafts the questions, the model answers, and a day-by-day
            reading list.
          </p>

          <div className="desk-hero-cta">
            <a href="#draft" className="sanctum-btn primary" data-testid="cta-draft">
              <Sparkles size={16} strokeWidth={1.75} /> Draft a plan
            </a>
            <button
              type="button"
              className="sanctum-btn ghost"
              onClick={() => {
                const el = document.getElementById("recent");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              data-testid="cta-recent"
            >
              Recent plans
            </button>
          </div>

          <div className="desk-steps">
            <span>01 · Paste role</span>
            <span className="dot">◆</span>
            <span>02 · Add résumé</span>
            <span className="dot">◆</span>
            <span>03 · Draft plan</span>
          </div>
        </div>

        <aside className="desk-hero-side stagger">
          <div className="metric-card">
            <div className="metric-label">On your desk</div>
            <div className="metric-value">
              {reports?.length || 0}
            </div>
            <div className="metric-sub">
              {reports?.length === 1 ? "plan saved" : "plans saved"}
            </div>
          </div>

          <div className="metric-card accent">
            <div className="metric-label">Reader</div>
            <div className="metric-value">
              {user?.username || "Guest"}
            </div>
            <div className="metric-sub">
              &ldquo;A quiet reader is a strong candidate.&rdquo;
            </div>
          </div>
        </aside>
      </section>

      {/* Workspace */}
      <section className="desk-workspace" id="draft">
        <JobDescriptionSection
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
        />
        <UserProfileSection
          jobDescription={jobDescription}
          selfDescription={selfDescription}
          setSelfDescription={setSelfDescription}
          resumeInputRef={resumeInputRef}
          handleGenerateReport={handleGenerateReport}
          loading={loading}
        />
      </section>

      {/* Recent plans */}
      {reports && reports.length > 0 && (
        <section className="recent-section" id="recent">
          <div className="recent-head">
            <div>
              <span className="kicker">The Shelves</span>
              <h2>Recent <em>plans</em></h2>
            </div>
            <p>Every plan you draft is saved here. Open any to continue where you left off.</p>
          </div>

          <div className="recent-grid">
            <ul className="report-list stagger" data-testid="report-list">
              {reports.map((r, i) => (
                <li
                  key={r._id}
                  className="report-item"
                  onClick={() => navigate(`/interview/${r._id}`)}
                  data-testid={`report-item-${i}`}
                >
                  <span className="r-num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="r-body">
                    <span className="r-title">{cleanReportTitle(r.title)}</span>
                    <span className="r-meta">
                      <span>{new Date(r.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span>·</span>
                      <span>Click to open</span>
                    </span>
                  </div>
                  <span className="r-score">
                    {r.matchScore || 0}
                    <span className="r-score-pct">/100</span>
                  </span>
                  <button
                    className="r-delete"
                    onClick={(e) => openDeleteModal(r._id, r.title, e)}
                    title="Remove plan"
                    aria-label="Remove plan"
                    data-testid={`report-delete-${i}`}
                  >
                    <Trash2 size={16} strokeWidth={1.75} />
                  </button>
                </li>
              ))}
            </ul>

            <aside className="recent-sidebar">
              <div className="side-card">
                <h3>Best match on desk</h3>
                <div className="big-num">
                  {reports?.[0]?.matchScore || 0}
                  <em>%</em>
                </div>
                <div className="note">Your strongest recent fit.</div>
              </div>
              <div className="side-card">
                <h3>Reading advice</h3>
                <ul>
                  <li>Read the job twice — once for words, once for signals.</li>
                  <li>Match verbs in your résumé to the role&apos;s language.</li>
                  <li>Practise the plan out loud, at desk pace.</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="delete-modal">
            <div className="modal-icon">
              <AlertTriangle size={26} strokeWidth={1.75} />
            </div>
            <h3>Remove this plan?</h3>
            <p>
              You&apos;re about to remove <strong>&ldquo;{deleteModal.title}&rdquo;</strong> from your desk.
              This cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="sanctum-btn ghost"
                onClick={closeDeleteModal}
                disabled={deleting}
                data-testid="delete-cancel"
              >
                Keep it
              </button>
              <button
                className="modal-confirm"
                onClick={confirmDelete}
                disabled={deleting}
                data-testid="delete-confirm"
              >
                {deleting ? "Removing…" : "Remove plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        className={`desk-toast ${toast.type} ${toast.show ? "show" : ""}`}
        role="status"
        data-testid="desk-toast"
      >
        {toast.type === "success" ? (
          <CheckCircle2 size={18} strokeWidth={1.75} style={{ color: "#5a7d3f" }} />
        ) : (
          <XCircle size={18} strokeWidth={1.75} style={{ color: "#a83e3e" }} />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

export default Home;
