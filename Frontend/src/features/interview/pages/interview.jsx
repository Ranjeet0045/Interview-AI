import { useState, useRef, useEffect } from 'react';
import "../style/interview.scss";
import { useInterview } from '../hooks/useInterview';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNavigate } from 'react-router';

const Interview = () => {

  const { report, loading, error, downloadResume } = useInterview()
  const { user, handleLogout } = useAuth()
  const navigate = useNavigate()
  
  const [activeSection, setActiveSection] = useState('technical');
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [mobilePanel, setMobilePanel] = useState('content');
  const profileRef = useRef();

  const handleDownloadPdf = async () => {
    if (!report || !report._id) return;
    setDownloadingPdf(true);
    setPdfError(null);
    try {
      const blobData = await downloadResume(report._id);
      const blob = new Blob([blobData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const cleanTitle = (report.title || 'resume')
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();
      
      link.setAttribute('download', `${cleanTitle}_resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setPdfError("Failed to generate resume PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Click-outside handler for profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false)
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileMenuOpen])

  const handleLogoutClick = async () => {
    try {
      await handleLogout()
      navigate('/login')
      setProfileMenuOpen(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const getQuestionsForSection = () => {
    if (!report) return [];
    return activeSection === 'technical' 
      ? report.technicalQuestions 
      : report.behavioralQuestions;
  };

  const getSeverityClass = (severity) => {
    return `badge-${severity}`;
  };

  useEffect(() => {
    const onResize = () => {
      if (!window.matchMedia('(max-width: 900px)').matches) {
        setMobilePanel('content');
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobileLayout = () =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches;

  const panelClass = (panel) =>
    isMobileLayout() && mobilePanel !== panel ? 'interview-panel-hidden' : '';

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" aria-hidden />
        <p>Loading your interview report…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interview-page-wrapper">
        <div className="interview-page">
          <div className="interview-state-message error">
            <p>Error loading report: {error}</p>
            <button className="header-back-btn" type="button" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="interview-page-wrapper">
        <div className="interview-page">
          <div className="interview-state-message">
            <p>No report data available</p>
            <button className="header-back-btn" type="button" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-page-wrapper">
      {/* Top Header Bar */}
      <header className="interview-top-header">
        <button className="header-back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <div className="header-title-area">
          <h2>📄 {report.title || 'Interview Report'}</h2>
        </div>
        {user && (
          <div className="header-profile-area" ref={profileRef}>
            <button 
              className="header-profile-btn"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              title={user.username}
            >
              <span className="header-profile-avatar">
                {user.username?.charAt(0).toUpperCase()}
              </span>
              <span className="header-profile-name">{user.username}</span>
            </button>

            {profileMenuOpen && (
              <div className="header-profile-dropdown">
                <div className="header-profile-menu">
                  <div className="header-profile-info">
                    <h4>{user.username}</h4>
                    <p>{user.email}</p>
                  </div>
                  <hr />
                  <button 
                    className="header-menu-btn"
                    onClick={() => { navigate('/profile'); setProfileMenuOpen(false); }}
                  >
                    <span>👤</span> My Profile
                  </button>
                  <button 
                    className="header-menu-btn header-logout-btn"
                    onClick={handleLogoutClick}
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="interview-page">
        <div className="interview-mobile-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={`mobile-tab ${mobilePanel === 'sidebar' ? 'active' : ''}`}
            onClick={() => setMobilePanel('sidebar')}
          >
            Score & Nav
          </button>
          <button
            type="button"
            role="tab"
            className={`mobile-tab ${mobilePanel === 'content' ? 'active' : ''}`}
            onClick={() => setMobilePanel('content')}
          >
            Questions
          </button>
          <button
            type="button"
            role="tab"
            className={`mobile-tab ${mobilePanel === 'gaps' ? 'active' : ''}`}
            onClick={() => setMobilePanel('gaps')}
          >
            Skill Gaps
          </button>
        </div>

        {/* Left Sidebar */}
        <aside className={`interview-sidebar-left ${panelClass('sidebar')}`}>
          <div className="match-score-container">
            <div className="match-score-circle">
              <span className="score-number">{report.matchScore}</span>
              <span className="score-label">Match</span>
            </div>
            <p className="match-description">Your interview match score</p>
          </div>

          <nav className="interview-nav">
            <button
              className={`nav-item ${activeSection === 'technical' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('technical');
                setExpandedQuestion(null);
                setMobilePanel('content');
              }}
            >
              <span className="nav-icon">📋</span>
              Technical questions
            </button>
            <button
              className={`nav-item ${activeSection === 'behavioral' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('behavioral');
                setExpandedQuestion(null);
                setMobilePanel('content');
              }}
            >
              <span className="nav-icon">💬</span>
              Behavioral questions
            </button>
            <button
              className={`nav-item ${activeSection === 'roadmap' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('roadmap');
                setExpandedQuestion(null);
                setMobilePanel('content');
              }}
            >
              <span className="nav-icon">🗺️</span>
              Road Map
            </button>
          </nav>

          <div className="sidebar-action-container">
            <button 
              className="download-pdf-btn" 
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? (
                <>
                  <span className="spinner"></span>
                  Generating PDF...
                </>
              ) : (
                <>
                  <span>📄</span> Download AI Resume
                </>
              )}
            </button>
            {pdfError && <p className="pdf-error-message">{pdfError}</p>}
          </div>
        </aside>

        {/* Main Content */}
        <main className={`interview-content-main ${panelClass('content')}`}>
          <div className="content-header">
            <h2>
              {activeSection === 'technical' && 'Technical Questions'}
              {activeSection === 'behavioral' && 'Behavioral Questions'}
              {activeSection === 'roadmap' && 'Interview Preparation Roadmap'}
            </h2>
            <p className="content-subtitle">
              {activeSection === 'technical' && `${report.technicalQuestions?.length || 0} questions to master`}
              {activeSection === 'behavioral' && `${report.behavioralQuestions?.length || 0} questions to practice`}
              {activeSection === 'roadmap' && `${report.preparationPlan?.length || 0}-day preparation plan`}
            </p>
          </div>

          <div className="questions-container">
            {(activeSection === 'technical' || activeSection === 'behavioral') ? (
              <div className="questions-list">
                {getQuestionsForSection().map((item, index) => (
                  <div
                    key={index}
                    className={`question-card ${expandedQuestion === index ? 'expanded' : ''}`}
                  >
                    <button
                      className="question-header"
                      onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                    >
                      <span className="question-number">Q{index + 1}</span>
                      <span className="question-text">{item.question}</span>
                      <span className="expand-icon">
                        {expandedQuestion === index ? '−' : '+'}
                      </span>
                    </button>

                    {expandedQuestion === index && (
                      <div className="question-details">
                        <div className="intention-section">
                          <h4>Interview Intention</h4>
                          <p>{item.intention}</p>
                        </div>
                        <div className="answer-section">
                          <h4>Expected Answer</h4>
                          <p>{item.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="roadmap-container">
                {report.preparationPlan?.map((day, index) => (
                  <div key={index} className="roadmap-day">
                    <div className="day-marker">Day {day.day}</div>
                    <div className="day-content">
                      <h3>{day.focus}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className={`interview-sidebar-right ${panelClass('gaps')}`}>
          <h3 className="sidebar-title">Skill Gaps</h3>
          <div className="skill-gaps-container">
            {report.skillGaps?.map((gap, index) => (
              <div key={index} className={`skill-badge ${getSeverityClass(gap.severity)}`}>
                {gap.skill}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Interview;
