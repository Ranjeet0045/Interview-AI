import { useState, useEffect } from "react";
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
  const [mobilePanel, setMobilePanel] = useState("content");

  useEffect(() => {
    const onResize = () => {
      if (!window.matchMedia("(max-width: 900px)").matches) setMobilePanel("content");
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches;

  const panelClass = (panel) => (isMobile() && mobilePanel !== panel ? "interview-hidden" : "");

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
      {/* Top bar */}
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
        {/* Mobile tabs */}
        <div className="interview-tabs" role="tablist">
          <button
            className={`m-tab ${mobilePanel === "sidebar" ? "active" : ""}`}
            onClick={() => setMobilePanel("sidebar")}
          >
            Score
          </button>
          <button
            className={`m-tab ${mobilePanel === "content" ? "active" : ""}`}
            onClick={() => setMobilePanel("content")}
          >
            Content
          </button>
          <button
            className={`m-tab ${mobilePanel === "gaps" ? "active" : ""}`}
            onClick={() => setMobilePanel("gaps")}
          >
            Gaps
          </button>
        </div>

        {/* Left */}
        <aside className={`side-left ${panelClass("sidebar")}`}>
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

        {/* Main */}
        <main className={`content-main ${panelClass("content")}`} data-testid="content-main">
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

        {/* Right — gaps */}
        <aside className={`side-right ${panelClass("gaps")}`}>
          <h3 className="side-title">Skill gaps</h3>
          <div className="gap-list" data-testid="skill-gaps">
            {report.skillGaps?.length ? (
              report.skillGaps.map((gap, index) => (
                <div key={index} className={`gap g-${gap.severity || "low"}`}>
                  {gap.skill}
                </div>
              ))
            ) : (
              <p style={{ color: "#5a4f3e", fontStyle: "italic" }}>
                No pressing gaps — you look ready.
              </p>
            )}
          </div>
        </aside>
      </div>

      <style>{`
        .spin-sm { animation: sanctum-spin 900ms linear infinite; }
      `}</style>
    </div>
  );
};

/* ─── Client-side PDF generation ─── */
function generateResumePdfClientSide(report) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const usableWidth = pageWidth - margin * 2;

  const title = (report.title || "Interview Study Plan").replace(/^Interview Plan - /i, "");
  const created = new Date(report.createdAt || Date.now()).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let y = margin;

  const setText = (size, style = "normal", color = [30, 26, 21]) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const drawText = (text, size = 11, style = "normal", color = [30, 26, 21], indent = 0) => {
    setText(size, style, color);
    const lines = doc.splitTextToSize(text || "", usableWidth - indent);
    const lineHeight = size * 1.35;
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, margin + indent, y);
      y += lineHeight;
    }
  };

  const drawRule = () => {
    ensureSpace(12);
    doc.setDrawColor(212, 201, 174);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;
  };

  const drawSectionHead = (kicker, heading) => {
    ensureSpace(46);
    setText(8, "bold", [90, 79, 62]);
    doc.text(kicker.toUpperCase(), margin, y);
    y += 14;
    setText(18, "bold", [30, 26, 21]);
    doc.text(heading, margin, y);
    y += 8;
    drawRule();
  };

  // Cover header
  setText(9, "bold", [90, 79, 62]);
  doc.text("SANCTUM · INTERVIEW STUDY PLAN", margin, y);
  y += 22;
  setText(24, "bold", [30, 26, 21]);
  doc.text(doc.splitTextToSize(title, usableWidth), margin, y);
  y += 30;

  setText(10, "italic", [90, 79, 62]);
  doc.text(`Drafted ${created}`, margin, y);
  y += 6;
  drawRule();

  // Match score
  setText(11, "normal", [90, 79, 62]);
  doc.text("Match score", margin, y);
  setText(36, "bold", [194, 91, 38]);
  const scoreText = `${Math.round(report.matchScore || 0)}%`;
  doc.text(scoreText, pageWidth - margin, y + 4, { align: "right" });
  y += 30;
  drawRule();

  // Technical questions
  if (report.technicalQuestions?.length) {
    drawSectionHead("01 · Technical Questions", "Study your craft");
    report.technicalQuestions.forEach((q, i) => {
      ensureSpace(30);
      drawText(`Q${String(i + 1).padStart(2, "0")}. ${q.question || ""}`, 12, "bold");
      y += 2;
      if (q.intention) drawText(`Intent: ${q.intention}`, 10, "italic", [90, 79, 62], 14);
      if (q.answer) drawText(`Model answer: ${q.answer}`, 10, "normal", [61, 52, 40], 14);
      y += 8;
    });
  }

  // Behavioral questions
  if (report.behavioralQuestions?.length) {
    drawSectionHead("02 · Behavioral Questions", "Rehearse your voice");
    report.behavioralQuestions.forEach((q, i) => {
      ensureSpace(30);
      drawText(`Q${String(i + 1).padStart(2, "0")}. ${q.question || ""}`, 12, "bold");
      y += 2;
      if (q.intention) drawText(`Intent: ${q.intention}`, 10, "italic", [90, 79, 62], 14);
      if (q.answer) drawText(`Model answer: ${q.answer}`, 10, "normal", [61, 52, 40], 14);
      y += 8;
    });
  }

  // Skill gaps
  if (report.skillGaps?.length) {
    drawSectionHead("03 · Skill Gaps", "Where to focus");
    report.skillGaps.forEach((g) => {
      ensureSpace(18);
      drawText(`•  ${g.skill}  (${g.severity || "n/a"})`, 11, "normal");
    });
  }

  // Roadmap
  if (report.preparationPlan?.length) {
    drawSectionHead("04 · Preparation Roadmap", "A day-by-day reading list");
    report.preparationPlan.forEach((d) => {
      ensureSpace(30);
      drawText(`Day ${d.day} — ${d.focus || ""}`, 12, "bold");
      if (d.tasks?.length) {
        d.tasks.forEach((t) => drawText(`•  ${t}`, 10, "normal", [61, 52, 40], 14));
      }
      y += 6;
    });
  }

  // Footer on every page
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    setText(8, "italic", [138, 125, 104]);
    doc.text("Sanctum · Interview Study Desk", margin, pageHeight - 18);
    doc.text(`Page ${p} / ${totalPages}`, pageWidth - margin, pageHeight - 18, {
      align: "right",
    });
  }

  const safe = (report.title || "sanctum_plan")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  doc.save(`${safe || "sanctum_plan"}.pdf`);
}

export default Interview;
