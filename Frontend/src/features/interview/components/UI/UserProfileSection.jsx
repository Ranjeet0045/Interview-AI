import { useState } from "react";
import { UserCircle2, FileText, Info, Sparkles } from "lucide-react";

const UserProfileSection = ({
  jobDescription,
  selfDescription,
  setSelfDescription,
  resumeInputRef,
  handleGenerateReport,
  loading,
}) => {
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const hasSelf = !!selfDescription;

  return (
    <section className="desk-panel" data-testid="user-profile-section">
      <div className="desk-panel-head">
        <div className="h-title">
          <span className="h-icon">
            <UserCircle2 size={18} strokeWidth={1.75} />
          </span>
          <h2>You — introduce yourself</h2>
        </div>
      </div>

      <div>
        <span className="desk-field-label">Résumé — <span style={{ color: "#c25b26" }}>strongly recommended</span></span>

        <label htmlFor="resume" className="upload-area" data-testid="resume-upload">
          {uploadedFileName ? (
            <>
              <div className="u-icon">
                <FileText size={22} strokeWidth={1.75} />
              </div>
              <div className="u-file">{uploadedFileName}</div>
              <div className="u-sub">Click to replace</div>
            </>
          ) : (
            <>
              <div className="u-icon">
                <FileText size={22} strokeWidth={1.75} />
              </div>
              <div className="u-title">Drop your résumé here</div>
              <div className="u-sub">PDF or DOCX — up to 2 MB</div>
            </>
          )}
          <input
            ref={resumeInputRef}
            hidden
            type="file"
            name="resume"
            id="resume"
            accept=".pdf,.docx"
            onChange={(e) => {
              if (e.target.files?.[0]) setUploadedFileName(e.target.files[0].name);
            }}
            data-testid="resume-file-input"
          />
        </label>
      </div>

      <div className="upload-divider">
        <span>or in a few sentences</span>
      </div>

      <div>
        <span className="desk-field-label">A short self-description</span>
        <textarea
          onChange={(e) => setSelfDescription(e.target.value)}
          name="selfDescription"
          id="selfDescription"
          className="self-textarea"
          value={selfDescription}
          aria-label="Self description"
          data-testid="self-description-textarea"
        />
      </div>

      <div className="desk-notice">
        <Info size={18} strokeWidth={1.75} style={{ flexShrink: 0, color: "#c99146" }} />
        <p style={{ margin: 0 }}>
          Provide <strong>either a résumé or a self-description</strong> — Sanctum needs a
          picture of you to draft your plan.
        </p>
      </div>

      <button
        onClick={handleGenerateReport}
        className="sanctum-btn primary generate-btn"
        disabled={loading || !jobDescription || (!selfDescription && !uploadedFileName)}
        data-testid="generate-strategy-btn"
      >
        <Sparkles size={16} strokeWidth={1.75} />
        {loading ? "Drafting your plan…" : "Draft my interview plan"}
      </button>
    </section>
  );
};

export default UserProfileSection;
