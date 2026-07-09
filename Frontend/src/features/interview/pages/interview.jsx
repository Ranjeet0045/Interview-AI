import { useState } from "react";
import { ChevronLeft, ChevronDown, FileDown, BookOpen, MessageSquareText, Map, Loader2 } from "lucide-react";
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview";
import { useNavigate } from "react-router";
import { jsPDF } from "jspdf";

const Interview = () => {
  const { report, loading, error } = useInterview();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("technical");
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [mobilePanel, setMobilePanel] = useState("content"); // content | sidebar

  const handleDownloadPdf = async () => {
    if (!report) return;
    setDownloadingPdf(true);
    setPdfError(null);
    try {
      generateResumePdfClientSide(report);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setPdfError("Could not draft the résumé PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" aria-hidden />
        <p>Turning the page…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interview-wrap">
        <div className="interview-topbar">
          <button className="back-btn" onClick={() => navigate("/")}>
            <ChevronLeft size={16} /> The Desk
          </button>
        </div>
        <p className="state-message error">Could not open plan: {error}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="interview-wrap">
        <div className="interview-topbar">
          <button className="back-btn" onClick={() => navigate("/")}>
            <ChevronLeft size={16} /> The Desk
          </button>
        </div>
        <p className="state-message">No plan on this shelf.</p>
      </div>
    );
  }

  const questions =
    activeSection === "technical"
      ? report.technicalQuestions || []
      : activeSection === "behavioral"
      ? report.behavioralQuestions || []
      : [];

  const score = Math.max(0, Math.min(100, report.matchScore || 0));

  return (
    <div className="interview-wrap" data-testid="interview-page">
      <header className="interview-topbar">
        <button className="back-btn" onClick={() => navigate("/")} data-testid="interview-back">
          <ChevronLeft size={16} strokeWidth={1.75} /> The Desk
        </button>
        <div className="title-area">
          <span className="t-kicker">Interview Plan</span>
          <h1>{report.title || "Untitled plan"}</h1>
        </div>
      </header>

      <div className="interview-page">
        {/* LEFT — score + nav + download */}
        <aside
          className={`side-left ${mobilePanel === "content" ? "mobile-hidden" : ""}`}
        >
          <div>
            <div
              className="score-ring"
              style={{ "--score": score }}
              data-testid="match-score-ring"
            >
              <div className="score-inner">
                <div className="n">{score}</div>
                <div className="l">Match</div>
              </div>
            </div>
            <p className="score-caption">
              {score >= 75
                ? "A strong fit — polish and pursue."
                : score >= 50
                ? "A workable fit — mind the gaps."
                : "A stretch — study before applying."}
            </p>
          </div>

          <nav className="section-nav">
            <button
              className={`nav-btn ${activeSection === "technical" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("technical");
                setExpandedQuestion(null);
                setMobilePanel("content");
              }}
              data-testid="nav-technical"
            >
              <BookOpen size={17} strokeWidth={1.75} />
              Technical
              <span className="nav-count">{report.technicalQuestions?.length || 0}</span>
            </button>
            <button
              className={`nav-btn ${activeSection === "behavioral" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("behavioral");
                setExpandedQuestion(null);
                setMobilePanel("content");
              }}
              data-testid="nav-behavioral"
            >
              <MessageSquareText size={17} strokeWidth={1.75} />
              Behavioral
              <span className="nav-count">{report.behavioralQuestions?.length || 0}</span>
            </button>
            <button
              className={`nav-btn ${activeSection === "roadmap" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("roadmap");
                setExpandedQuestion(null);
                setMobilePanel("content");
              }}
              data-testid="nav-roadmap"
            >
              <Map size={17} strokeWidth={1.75} />
              Roadmap
              <span className="nav-count">{report.preparationPlan?.length || 0}</span>
            </button>
          </nav>

          <div className="download-container">
            <button
              className="sanctum-btn terra download-btn"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              data-testid="download-pdf-btn"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 size={16} strokeWidth={2} className="spin-sm" />
                  Drafting PDF…
                </>
              ) : (
                <>
                  <FileDown size={16} strokeWidth={1.75} />
                  Download study plan PDF
                </>
              )}
            </button>
            {pdfError && <p className="pdf-error">{pdfError}</p>}
          </div>
        </aside>

        {/* RIGHT column: gap-banner + content */}
        <div
          className={`content-column ${mobilePanel === "sidebar" ? "mobile-hidden" : ""}`}
        >
          {/* Mobile tabs */}
          <div className="interview-tabs" role="tablist">
            <button
              className={`m-tab ${mobilePanel === "sidebar" ? "active" : ""}`}
              onClick={() => setMobilePanel("sidebar")}
            >
              Score & Nav
            </button>
            <button
              className={`m-tab ${mobilePanel === "content" ? "active" : ""}`}
              onClick={() => setMobilePanel("content")}
            >
              Content
            </button>
          </div>

          {/* Skill gaps — compact banner */}
          <section className="gap-banner" data-testid="skill-gaps">
            <span className="gb-label">Skill Gaps</span>
            {report.skillGaps?.length ? (
              <div className="gb-list">
                {report.skillGaps.map((gap, i) => (
                  <span key={i} className={`gap-chip g-${gap.severity || "low"}`}>
                    {gap.skill}
                  </span>
                ))}
              </div>
            ) : (
              <span className="gb-empty">No pressing gaps — you look ready.</span>
            )}
          </section>

          <main className="content-main" data-testid="content-main">
            <div className="content-head">
              <span className="c-kicker">
                {activeSection === "technical" && "— Technical questions"}
                {activeSection === "behavioral" && "— Behavioral questions"}
                {activeSection === "roadmap" && "— Preparation roadmap"}
              </span>
              <h2>
                {activeSection === "technical" && (<>Study your <em>craft</em></>)}
                {activeSection === "behavioral" && (<>Rehearse your <em>voice</em></>)}
                {activeSection === "roadmap" && (<>A day-by-day <em>reading list</em></>)}
              </h2>
              <p className="c-sub">
                {activeSection === "technical" &&
                  `${report.technicalQuestions?.length || 0} questions to master, with intent and model answer.`}
                {activeSection === "behavioral" &&
                  `${report.behavioralQuestions?.length || 0} questions to practise, out loud, before the day.`}
                {activeSection === "roadmap" &&
                  `A ${report.preparationPlan?.length || 0}-day plan — small, deliberate.`}
              </p>
            </div>

            {activeSection !== "roadmap" ? (
              <div className="q-list">
                {questions.map((item, index) => (
                  <div
                    key={index}
                    className={`q-card ${expandedQuestion === index ? "expanded" : ""}`}
                    data-testid={`q-card-${index}`}
                  >
                    <button
                      className="q-head"
                      onClick={() =>
                        setExpandedQuestion(expandedQuestion === index ? null : index)
                      }
                    >
                      <span className="q-num">{String(index + 1).padStart(2, "0")}.</span>
                      <span className="q-text">{item.question}</span>
                      <span className="q-toggle">
                        <ChevronDown size={16} strokeWidth={2} />
                      </span>
                    </button>

                    {expandedQuestion === index && (
                      <div className="q-body">
                        <h4>Interviewer&apos;s intent</h4>
                        <p>{item.intention}</p>
                        <h4>Model answer</h4>
                        <p>{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="roadmap-list">
                {report.preparationPlan?.map((day, index) => (
                  <div key={index} className="roadmap-day" data-testid={`roadmap-day-${index}`}>
                    <div className="day-mark">
                      <span className="day-word">Day</span>
                      <span className="day-num">{day.day}</span>
                    </div>
                    <div className="day-info">
                      <h3>{day.focus}</h3>
                      {day.tasks?.length ? (
                        <ul>
                          {day.tasks.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

/* ─── Client-side PDF generation — parchment/ink themed, safe wrapping ─── */
function generateResumePdfClientSide(report) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 54;
  const bottomLimit = pageHeight - margin - 20; // reserve room for footer
  const usableWidth = pageWidth - margin * 2;

  const title = (report.title || "Interview Study Plan").replace(/^Interview Plan - /i, "");
  const created = new Date(report.createdAt || Date.now()).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Theme colours
  const INK = [30, 26, 21];
  const INK_2 = [61, 52, 40];
  const INK_3 = [90, 79, 62];
  const TERRA = [194, 91, 38];
  const GOLD = [201, 145, 70];
  const RULE = [212, 201, 174];
  const PAPER_TINT = [240, 232, 211];

  let y = margin;

  const setFont = (size, style = "normal", color = INK) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };

  const newPage = () => {
    doc.addPage();
    y = margin;
  };

  const ensureSpace = (needed) => {
    if (y + needed > bottomLimit) newPage();
  };

  /**
   * Draws (potentially multi-line) text and advances y by the FULL height.
   * indent: left indent from margin.
   * Pages break BETWEEN wrapped lines when needed.
   */
  const drawWrapped = (text, { size = 11, style = "normal", color = INK, indent = 0, lh = 1.4, spaceAfter = 0 } = {}) => {
    if (!text) return;
    setFont(size, style, color);
    const lines = doc.splitTextToSize(String(text), usableWidth - indent);
    const lineHeight = size * lh;
    for (const line of lines) {
      if (y + lineHeight > bottomLimit) newPage();
      doc.text(line, margin + indent, y);
      y += lineHeight;
    }
    y += spaceAfter;
  };

  const drawRule = (color = RULE, extraTop = 4, extraBottom = 10) => {
    y += extraTop;
    if (y > bottomLimit) newPage();
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += extraBottom;
  };

  /**
   * Coloured section header — accepts kicker + title, keeps them together.
   */
  const drawSectionHead = (kicker, heading) => {
    // Reserve ~90pt so the head + rule + first content line don't orphan
    ensureSpace(90);
    // Small accent bar
    doc.setFillColor(TERRA[0], TERRA[1], TERRA[2]);
    doc.rect(margin, y, 22, 3, "F");
    y += 14;
    setFont(9, "bold", INK_3);
    doc.text(String(kicker).toUpperCase(), margin, y);
    y += 18;
    setFont(20, "bold", INK);
    const headingLines = doc.splitTextToSize(heading, usableWidth);
    const lh = 20 * 1.2;
    for (const line of headingLines) {
      if (y + lh > bottomLimit) newPage();
      doc.text(line, margin, y);
      y += lh;
    }
    drawRule();
  };

  /**
   * Question block — keep the question line + first answer line together where possible.
   */
  const drawQuestion = (index, q) => {
    ensureSpace(80);
    const qNumber = `Q${String(index + 1).padStart(2, "0")}.`;
    // Question label
    setFont(12, "bold", INK);
    const qText = `${qNumber}  ${q.question || ""}`;
    drawWrapped(qText, { size: 12, style: "bold", color: INK, indent: 0, lh: 1.35, spaceAfter: 6 });

    if (q.intention) {
      drawWrapped("Interviewer's intent", { size: 8, style: "bold", color: TERRA, indent: 14, lh: 1.3, spaceAfter: 3 });
      drawWrapped(q.intention, { size: 10, style: "italic", color: INK_3, indent: 14, lh: 1.5, spaceAfter: 8 });
    }
    if (q.answer) {
      drawWrapped("Model answer", { size: 8, style: "bold", color: TERRA, indent: 14, lh: 1.3, spaceAfter: 3 });
      drawWrapped(q.answer, { size: 10, style: "normal", color: INK_2, indent: 14, lh: 1.55, spaceAfter: 6 });
    }

    // Subtle separator between questions
    y += 4;
    if (y > bottomLimit) newPage();
    else {
      doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
      doc.setLineDashPattern([2, 3], 0);
      doc.line(margin + 20, y, pageWidth - margin - 20, y);
      doc.setLineDashPattern([], 0);
      y += 12;
    }
  };

  const drawSkillGap = (skill, severity) => {
    ensureSpace(22);
    const sev = (severity || "low").toLowerCase();
    // Colored dot
    const dotColor = sev === "high" ? [168, 62, 62] : sev === "medium" ? [181, 126, 26] : [90, 125, 63];
    doc.setFillColor(dotColor[0], dotColor[1], dotColor[2]);
    doc.circle(margin + 4, y - 3, 3, "F");
    setFont(11, "normal", INK);
    doc.text(skill || "—", margin + 14, y);
    setFont(9, "italic", INK_3);
    doc.text(`(${sev})`, pageWidth - margin, y, { align: "right" });
    y += 18;
  };

  const drawRoadmapDay = (d) => {
    // Approx block height so we do not split a day mid-page
    const approxTasks = (d.tasks?.length || 0);
    const approxHeight = 32 + 18 + approxTasks * 16 + 10;
    ensureSpace(approxHeight);

    // Day tag box
    doc.setFillColor(INK[0], INK[1], INK[2]);
    doc.roundedRect(margin, y - 12, 52, 34, 3, 3, "F");
    setFont(7, "bold", [244, 239, 226]);
    doc.text("DAY", margin + 26, y - 2, { align: "center" });
    setFont(14, "bold", [244, 239, 226]);
    doc.text(String(d.day || ""), margin + 26, y + 14, { align: "center" });

    // Focus title
    setFont(12, "bold", INK);
    const focusLines = doc.splitTextToSize(d.focus || "", usableWidth - 68);
    let localY = y - 2;
    for (const line of focusLines) {
      doc.text(line, margin + 64, localY);
      localY += 15;
    }

    y = Math.max(y + 26, localY + 4);

    // Tasks
    if (d.tasks?.length) {
      for (const t of d.tasks) {
        if (y > bottomLimit) newPage();
        setFont(10, "normal", INK_2);
        // Terracotta bullet
        setFont(10, "bold", TERRA);
        doc.text("·", margin + 68, y);
        setFont(10, "normal", INK_2);
        const taskLines = doc.splitTextToSize(t, usableWidth - 84);
        for (const line of taskLines) {
          if (y > bottomLimit) newPage();
          doc.text(line, margin + 78, y);
          y += 14;
        }
      }
    }
    y += 10;
  };

  /* ─── COVER / HEADER ─── */

  // Terracotta accent bar
  doc.setFillColor(TERRA[0], TERRA[1], TERRA[2]);
  doc.rect(margin, y, 40, 3, "F");
  y += 16;

  setFont(9, "bold", INK_3);
  doc.text("INTERVIEW AI · STUDY PLAN", margin, y);
  y += 22;

  // Big title (may wrap)
  setFont(24, "bold", INK);
  const titleLines = doc.splitTextToSize(title, usableWidth);
  const titleLh = 24 * 1.15;
  for (const line of titleLines) {
    if (y + titleLh > bottomLimit) newPage();
    doc.text(line, margin, y);
    y += titleLh;
  }
  y += 4;

  setFont(10, "italic", INK_3);
  doc.text(`Drafted ${created}`, margin, y);
  y += 6;
  drawRule();

  // Match score bar
  const score = Math.max(0, Math.min(100, Math.round(report.matchScore || 0)));
  setFont(9, "bold", INK_3);
  doc.text("MATCH SCORE", margin, y);
  setFont(28, "bold", TERRA);
  doc.text(`${score}%`, pageWidth - margin, y + 4, { align: "right" });
  y += 12;
  // Progress bar
  const barY = y + 8;
  const barH = 6;
  doc.setFillColor(RULE[0], RULE[1], RULE[2]);
  doc.roundedRect(margin, barY, usableWidth, barH, 3, 3, "F");
  doc.setFillColor(TERRA[0], TERRA[1], TERRA[2]);
  const barFill = Math.max(6, (usableWidth * score) / 100);
  doc.roundedRect(margin, barY, barFill, barH, 3, 3, "F");
  y = barY + barH + 4;
  drawRule();

  /* ─── SECTIONS ─── */

  if (report.technicalQuestions?.length) {
    drawSectionHead("01 · Technical Questions", "Study your craft");
    report.technicalQuestions.forEach((q, i) => drawQuestion(i, q));
  }

  if (report.behavioralQuestions?.length) {
    drawSectionHead("02 · Behavioral Questions", "Rehearse your voice");
    report.behavioralQuestions.forEach((q, i) => drawQuestion(i, q));
  }

  if (report.skillGaps?.length) {
    drawSectionHead("03 · Skill Gaps", "Where to focus");
    report.skillGaps.forEach((g) => drawSkillGap(g.skill, g.severity));
  }

  if (report.preparationPlan?.length) {
    drawSectionHead("04 · Preparation Roadmap", "A day-by-day reading list");
    report.preparationPlan.forEach((d) => drawRoadmapDay(d));
  }

  /* ─── FOOTER on every page ─── */
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 32, pageWidth - margin, pageHeight - 32);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(138, 125, 104);
    doc.text("Interview AI · Your Study Desk", margin, pageHeight - 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 18, {
      align: "right",
    });
  }

  const safe = (report.title || "interview_ai_plan")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  doc.save(`${safe || "interview_ai_plan"}.pdf`);
  // Silence unused var linter
  void PAPER_TINT;
  void GOLD;
}

export default Interview;
