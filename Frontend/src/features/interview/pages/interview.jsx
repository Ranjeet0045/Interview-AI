import { useState } from "react";
import { ChevronLeft, ChevronDown, FileDown, BookOpen, MessageSquareText, Map, Loader2 } from "lucide-react";
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview";
import { useNavigate } from "react-router";
import { jsPDF } from "jspdf";

/**
 * Aggressively cleans and truncates the plan title. Handles the case
 * where the deployed backend still stores the raw first-50 chars of the
 * job description as the title — we never want that ticker-style overflow.
 */
function cleanTitle(raw) {
  if (!raw) return "Your study plan";
  let t = String(raw)
    .replace(/^Interview\s*Plan\s*[·\-–:]\s*/i, "")
    .replace(/^interview plan/i, "")
    .replace(/[…\-·:.\s]+$/g, "")
    .trim();

  if (!t) return "Your study plan";

  // If it still looks like a raw job posting slice, cut to the first
  // clean phrase — hard-cap to 48 chars with a graceful ellipsis.
  const firstFragment = t.split(/(?:[.!?\n]|\s+·\s+)/)[0] || t;
  if (firstFragment.length < t.length) t = firstFragment.trim();

  if (t.length > 48) {
    // stop at last word boundary before 48 chars
    const trimmed = t.slice(0, 48);
    const lastSpace = trimmed.lastIndexOf(" ");
    t = (lastSpace > 20 ? trimmed.slice(0, lastSpace) : trimmed).trim() + "…";
  }
  return t;
}

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
          <h1>{cleanTitle(report.title)}</h1>
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

/* ─── Client-side PDF generation — polished serif+sans typography ─── */
function generateResumePdfClientSide(report) {
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 62;
  const marginTop = 68;
  const marginBottom = 68;
  const bottomLimit = pageHeight - marginBottom;
  const usableWidth = pageWidth - marginX * 2;

  const title = cleanTitle(report.title);
  const created = new Date(report.createdAt || Date.now()).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const INK = [30, 26, 21];
  const INK_2 = [55, 47, 36];
  const INK_3 = [102, 90, 72];
  const TERRA = [194, 91, 38];
  const RULE = [212, 201, 174];
  const RULE_SOFT = [230, 220, 198];

  const F_DISPLAY = "times";
  const F_BODY = "helvetica";

  let y = marginTop;

  const setFont = (family, size, style = "normal", color = INK) => {
    doc.setFont(family, style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };
  const newPage = () => { doc.addPage(); y = marginTop; };
  const ensureSpace = (needed) => { if (y + needed > bottomLimit) newPage(); };

  const drawWrapped = (text, {
    family = F_BODY, size = 11, style = "normal", color = INK,
    indent = 0, lh = 1.45, spaceAfter = 0,
  } = {}) => {
    if (!text && text !== 0) return;
    setFont(family, size, style, color);
    const lines = doc.splitTextToSize(String(text), usableWidth - indent);
    const lineHeight = size * lh;
    for (const line of lines) {
      if (y + lineHeight > bottomLimit) newPage();
      doc.text(line, marginX + indent, y);
      y += lineHeight;
    }
    y += spaceAfter;
  };

  const drawRule = (color = RULE, extraTop = 6, extraBottom = 14, weight = 0.5) => {
    y += extraTop;
    if (y > bottomLimit) newPage();
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(weight);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += extraBottom;
  };

  const drawSectionHead = (kicker, heading) => {
    ensureSpace(110);
    doc.setFillColor(TERRA[0], TERRA[1], TERRA[2]);
    doc.rect(marginX, y, 26, 3, "F");
    y += 18;
    setFont(F_BODY, 8.5, "bold", INK_3);
    doc.setCharSpace(1.2);
    doc.text(String(kicker).toUpperCase(), marginX, y);
    doc.setCharSpace(0);
    y += 22;
    setFont(F_DISPLAY, 22, "italic", INK);
    const headingLines = doc.splitTextToSize(heading, usableWidth);
    const lh = 22 * 1.15;
    for (const line of headingLines) {
      if (y + lh > bottomLimit) newPage();
      doc.text(line, marginX, y);
      y += lh;
    }
    drawRule(RULE_SOFT, 4, 18, 0.4);
  };

  const drawQuestion = (index, q) => {
    ensureSpace(90);
    const num = String(index + 1).padStart(2, "0");
    setFont(F_DISPLAY, 15, "italic", TERRA);
    doc.text(num, marginX, y);
    setFont(F_DISPLAY, 13, "normal", INK);
    const stemLines = doc.splitTextToSize(q.question || "", usableWidth - 34);
    const stemLh = 13 * 1.4;
    let stemY = y;
    for (const line of stemLines) {
      if (stemY + stemLh > bottomLimit) { newPage(); stemY = y; }
      doc.text(line, marginX + 30, stemY);
      stemY += stemLh;
    }
    y = stemY + 4;

    if (q.intention) {
      drawWrapped("Interviewer's intent", { family: F_BODY, size: 8, style: "bold", color: TERRA, indent: 30, lh: 1.3, spaceAfter: 4 });
      drawWrapped(q.intention, { family: F_BODY, size: 10, style: "italic", color: INK_3, indent: 30, lh: 1.55, spaceAfter: 10 });
    }
    if (q.answer) {
      drawWrapped("Model answer", { family: F_BODY, size: 8, style: "bold", color: TERRA, indent: 30, lh: 1.3, spaceAfter: 4 });
      drawWrapped(q.answer, { family: F_BODY, size: 10.5, style: "normal", color: INK_2, indent: 30, lh: 1.6, spaceAfter: 8 });
    }

    if (y + 14 > bottomLimit) newPage();
    else {
      doc.setDrawColor(RULE_SOFT[0], RULE_SOFT[1], RULE_SOFT[2]);
      doc.setLineDashPattern([2, 3], 0);
      doc.line(marginX + 30, y + 2, pageWidth - marginX - 30, y + 2);
      doc.setLineDashPattern([], 0);
      y += 18;
    }
  };

  const drawSkillGap = (skill, severity) => {
    ensureSpace(24);
    const sev = String(severity || "low").toLowerCase();
    const dot = sev === "high" ? [168, 62, 62] : sev === "medium" ? [181, 126, 26] : [90, 125, 63];
    doc.setFillColor(dot[0], dot[1], dot[2]);
    doc.circle(marginX + 5, y - 3.5, 3.2, "F");
    setFont(F_BODY, 11, "normal", INK);
    doc.text(skill || "—", marginX + 16, y);
    setFont(F_BODY, 9, "italic", INK_3);
    doc.text(sev, pageWidth - marginX, y, { align: "right" });
    y += 20;
  };

  const drawRoadmapDay = (d) => {
    const tasks = Array.isArray(d.tasks) ? d.tasks : [];
    const approxHeight = 40 + 22 + tasks.length * 18 + 14;
    ensureSpace(approxHeight);

    const tagX = marginX;
    const tagY = y - 12;
    doc.setFillColor(INK[0], INK[1], INK[2]);
    doc.roundedRect(tagX, tagY, 56, 40, 4, 4, "F");
    setFont(F_BODY, 7.5, "bold", [244, 239, 226]);
    doc.setCharSpace(1);
    doc.text("DAY", tagX + 28, tagY + 14, { align: "center" });
    doc.setCharSpace(0);
    setFont(F_DISPLAY, 17, "italic", [244, 239, 226]);
    doc.text(String(d.day || ""), tagX + 28, tagY + 32, { align: "center" });

    setFont(F_DISPLAY, 13, "normal", INK);
    const focusLines = doc.splitTextToSize(d.focus || "", usableWidth - 72);
    let localY = y;
    for (const line of focusLines) {
      doc.text(line, marginX + 70, localY);
      localY += 15;
    }
    y = Math.max(y + 32, localY + 4);

    for (const t of tasks) {
      if (y > bottomLimit) newPage();
      setFont(F_BODY, 12, "bold", TERRA);
      doc.text("·", marginX + 70, y);
      setFont(F_BODY, 10.5, "normal", INK_2);
      const taskLines = doc.splitTextToSize(t, usableWidth - 88);
      for (const line of taskLines) {
        if (y > bottomLimit) newPage();
        doc.text(line, marginX + 82, y);
        y += 15;
      }
    }
    y += 12;
  };

  /* Cover */
  doc.setFillColor(TERRA[0], TERRA[1], TERRA[2]);
  doc.rect(marginX, y, 44, 3, "F");
  y += 22;

  setFont(F_BODY, 9.5, "bold", INK_3);
  doc.setCharSpace(1.5);
  doc.text("INTERVIEW AI · YOUR STUDY DESK", marginX, y);
  doc.setCharSpace(0);
  y += 30;

  setFont(F_DISPLAY, 30, "italic", INK);
  const titleLines = doc.splitTextToSize(title, usableWidth);
  const titleLh = 30 * 1.12;
  for (const line of titleLines) {
    if (y + titleLh > bottomLimit) newPage();
    doc.text(line, marginX, y);
    y += titleLh;
  }
  y += 6;

  setFont(F_BODY, 10, "italic", INK_3);
  doc.text(`Drafted ${created}`, marginX, y);
  y += 8;
  drawRule(RULE, 4, 20);

  const score = Math.max(0, Math.min(100, Math.round(report.matchScore || 0)));
  setFont(F_BODY, 9.5, "bold", INK_3);
  doc.setCharSpace(1.5);
  doc.text("MATCH SCORE", marginX, y);
  doc.setCharSpace(0);
  setFont(F_DISPLAY, 34, "italic", TERRA);
  doc.text(`${score}%`, pageWidth - marginX, y + 4, { align: "right" });
  y += 14;
  const barY = y + 10;
  const barH = 7;
  doc.setFillColor(RULE_SOFT[0], RULE_SOFT[1], RULE_SOFT[2]);
  doc.roundedRect(marginX, barY, usableWidth, barH, 3.5, 3.5, "F");
  doc.setFillColor(TERRA[0], TERRA[1], TERRA[2]);
  const barFill = Math.max(7, (usableWidth * score) / 100);
  doc.roundedRect(marginX, barY, barFill, barH, 3.5, 3.5, "F");
  y = barY + barH + 4;

  setFont(F_DISPLAY, 11, "italic", INK_3);
  const caption =
    score >= 75 ? "A strong fit — polish and pursue."
    : score >= 50 ? "A workable fit — mind the gaps."
    : "A stretch — study before applying.";
  doc.text(caption, marginX, y + 14);
  y += 30;

  if (report.technicalQuestions?.length) {
    drawSectionHead("01 · Technical Questions", "Study your craft.");
    report.technicalQuestions.forEach((q, i) => drawQuestion(i, q));
  }
  if (report.behavioralQuestions?.length) {
    drawSectionHead("02 · Behavioral Questions", "Rehearse your voice.");
    report.behavioralQuestions.forEach((q, i) => drawQuestion(i, q));
  }
  if (report.skillGaps?.length) {
    drawSectionHead("03 · Skill Gaps", "Where to focus.");
    report.skillGaps.forEach((g) => drawSkillGap(g.skill, g.severity));
  }
  if (report.preparationPlan?.length) {
    drawSectionHead("04 · Preparation Roadmap", "A day-by-day reading list.");
    report.preparationPlan.forEach((d) => drawRoadmapDay(d));
  }

  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(RULE_SOFT[0], RULE_SOFT[1], RULE_SOFT[2]);
    doc.setLineWidth(0.4);
    doc.line(marginX, pageHeight - 40, pageWidth - marginX, pageHeight - 40);
    setFont(F_DISPLAY, 9.5, "italic", INK_3);
    doc.text("Interview AI · Your Study Desk", marginX, pageHeight - 22);
    setFont(F_BODY, 8.5, "normal", INK_3);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, pageHeight - 22, {
      align: "right",
    });
  }

  const safe = cleanTitle(report.title)
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  doc.save(`${safe || "interview_ai_plan"}.pdf`);
}

export default Interview;
