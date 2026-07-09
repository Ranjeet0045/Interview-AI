import { BookOpen } from "lucide-react";

const JobDescriptionSection = ({ jobDescription, setJobDescription }) => {
  const charCount = jobDescription?.length || 0;
  const maxChars = 5000;

  return (
    <section className="desk-panel" data-testid="job-description-section">
      <div className="desk-panel-head">
        <div className="h-title">
          <span className="h-icon">
            <BookOpen size={18} strokeWidth={1.75} />
          </span>
          <h2>The Job — read carefully</h2>
        </div>
        <span className="h-badge">Required</span>
      </div>

      <textarea
        onChange={(e) => setJobDescription(e.target.value)}
        name="jobDescription"
        id="jobDescription"
        className="desk-notebook-textarea"
        value={jobDescription}
        maxLength={maxChars}
        aria-label="Job description"
        data-testid="job-description-textarea"
      />

      <div className="char-counter">
        {charCount.toLocaleString()} / {maxChars.toLocaleString()} characters
      </div>
    </section>
  );
};

export default JobDescriptionSection;
