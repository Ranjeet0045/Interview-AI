import {useState, useRef, useCallback} from 'react';
import "../style/style.scss";
import { useInterview } from '../hooks/useInterview';
import { useAuth } from '../../auth/hooks/useAuth';
import JobDescriptionSection from '../components/UI/JobDescriptionSection';
import UserProfileSection from '../components/UI/UserProfileSection';
import { useNavigate } from 'react-router';

const Home = () => {

    const {loading, generateReport, reports, deleteReport} = useInterview()
    const {user} = useAuth()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const resumeInputRef = useRef()

    // Delete modal state
    const [deleteModal, setDeleteModal] = useState({ show: false, reportId: null, title: '' })
    const [deleting, setDeleting] = useState(false)

    // Toast state
    const [toast, setToast] = useState({ show: false, message: '', type: '' })

    const navigate = useNavigate()

    const showToast = useCallback((message, type) => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
    }, [])

    const handleGenerateReport = async () => {
        try {
            const resumeFile = resumeInputRef.current.files[0]
            const data = await generateReport({jobDescription, selfDescription, resumeFile})
            if (data && data._id) {
                navigate(`/interview/${data._id}`)
            } else {
                console.error("No interview ID returned from API")
                showToast("Error generating interview report. Please try again.", "error")
            }
        } catch (error) {
            console.error("Error:", error)
            showToast(error.response?.data?.message || error.message || 'Failed to generate interview report', "error")
        }
    }

    const openDeleteModal = (reportId, title, e) => {
        e.stopPropagation()
        setDeleteModal({ show: true, reportId, title: title || 'this report' })
    }

    const closeDeleteModal = () => {
        setDeleteModal({ show: false, reportId: null, title: '' })
    }

    const confirmDelete = async () => {
        setDeleting(true)
        try {
            await deleteReport(deleteModal.reportId)
            showToast("Report deleted successfully!", "success")
            closeDeleteModal()
        } catch (error) {
            showToast("Error deleting report: " + error.message, "error")
        } finally {
            setDeleting(false)
        }
    }

    if(loading){
        return(
            <div className='app-loading'>
                <div className='app-loading-spinner' aria-hidden />
                <p>Loading your interview plans…</p>
            </div>
        )
    }

    return (
        <div className='interview-container'>
            <div className='interview-inner'>
            <section className='home-hero animate-in'>
                <div className='home-hero-left'>
                    <div className='home-hero-kicker'>AI INTERVIEW PLANNER</div>
                    <h1>
                        Prepare, practice <span className='highlight-text'>and win</span>
                        <br />
                        your next interview
                    </h1>
                    <p className='home-hero-subtitle'>
                        Paste a job description, add your resume or a short bio, and get a tailored plan with questions,
                        expected answers, skill gaps, and a day-by-day roadmap.
                    </p>
                    <div className='home-hero-cta'>
                        <a className='home-cta-btn primary' href="#create-plan">Create plan</a>
                        <button
                            type="button"
                            className='home-cta-btn secondary'
                            onClick={() => {
                                const el = document.getElementById("recent-plans");
                                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                        >
                            View recent plans
                        </button>
                    </div>
                    <div className='home-hero-steps'>
                        <span className='step-pill'>1. Paste job</span>
                        <span className='step-pill'>2. Add resume/bio</span>
                        <span className='step-pill'>3. Generate plan</span>
                    </div>
                </div>

                <aside className='home-hero-right' aria-label="Highlights">
                    <div className='hero-card-grid'>
                        <div className='hero-mini-card animate-in-delay-1'>
                            <div className='mini-card-title'>Top features</div>
                            <div className='mini-card-list'>
                                <div className='mini-card-item'>
                                    <div className='mini-card-icon'>🎯</div>
                                    <div>
                                        <div className='mini-card-label'>Match score</div>
                                        <div className='mini-card-sub'>Role fit in seconds</div>
                                    </div>
                                </div>
                                <div className='mini-card-item'>
                                    <div className='mini-card-icon'>🧠</div>
                                    <div>
                                        <div className='mini-card-label'>Q&A packs</div>
                                        <div className='mini-card-sub'>Technical + behavioral</div>
                                    </div>
                                </div>
                                <div className='mini-card-item'>
                                    <div className='mini-card-icon'>🗺️</div>
                                    <div>
                                        <div className='mini-card-label'>Roadmap</div>
                                        <div className='mini-card-sub'>Day-by-day prep plan</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='hero-mini-card hero-mini-card--stats animate-in-delay-2'>
                            <div className='mini-card-title'>Your workspace</div>
                            <div className='mini-card-metrics'>
                                <div className='metric'>
                                    <div className='metric-value'>{reports?.length || 0}</div>
                                    <div className='metric-label'>Saved plans</div>
                                </div>
                                <div className='metric'>
                                    <div className='metric-value'>{user ? "Active" : "Guest"}</div>
                                    <div className='metric-label'>Session</div>
                                </div>
                            </div>
                            <div className='mini-card-hint'>Generate a plan below to update your dashboard.</div>
                        </div>
                    </div>
                </aside>
            </section>

            <main className='interview-content' id="create-plan">
                <div className="interview-wrapper">
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
                </div>
            </main>

            {/* Recent report list */}
            {reports && reports.length > 0 && (
                <section className='recent-reports-section' id="recent-plans">
                    <div className='recent-reports-header'>
                        <div>
                            <h2>Recent Interview Plans</h2>
                            <p>Revisit your latest AI-generated preparation plans and continue where you left off.</p>
                        </div>
                    </div>

                    <div className='recent-reports-grid'>
                        <div className='reports-card'>
                            <ul className='reports-list'>
                                {reports.map(reportItem => (
                                    <li key={reportItem._id} className='report-item' onClick={() => navigate(`/interview/${reportItem._id}`)}>
                                        <div className='report-item-left'>
                                            <span className='report-title'>{reportItem.title}</span>
                                            <span className='report-subtitle'>Click to open this plan</span>
                                        </div>
                                        <div className='report-item-right'>
                                            <span className='report-match-badge'>
                                                <span className='match-icon'>🎯</span>
                                                <span className='match-text'>{reportItem.matchScore || 0}%</span>
                                            </span>
                                            <span className='report-date'>{new Date(reportItem.createdAt).toLocaleDateString()}</span>
                                            <button 
                                                className='report-delete-btn'
                                                onClick={(e) => openDeleteModal(reportItem._id, reportItem.title, e)}
                                                title="Delete this report"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <aside className='recent-sidebar'>
                            <div className='sidebar-card'>
                                <h3>Latest Match Score</h3>
                                <p className='sidebar-value'>{reports?.[0]?.matchScore || 0}%</p>
                                <p className='sidebar-note'>Your best match from recent interviews.</p>
                            </div>
                            <div className='sidebar-card'>
                                <h3>Pro Tips</h3>
                                <ul>
                                    <li>Be specific in your self-description for better results.</li>
                                    <li>Include relevant keywords from the job description.</li>
                                    <li>Use the generated roadmap to structure your preparation.</li>
                                </ul>
                            </div>
                        </aside>
                    </div>
                </section>
            )}

            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className='modal-overlay' onClick={closeDeleteModal}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className='modal-icon'>⚠️</div>
                        <h3>Delete Report</h3>
                        <p>Are you sure you want to delete <strong>"{deleteModal.title}"</strong>? This action cannot be undone.</p>
                        <div className='modal-actions'>
                            <button className='modal-cancel-btn' onClick={closeDeleteModal} disabled={deleting}>
                                Cancel
                            </button>
                            <button className='modal-confirm-btn' onClick={confirmDelete} disabled={deleting}>
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            <div className={`home-toast ${toast.type} ${toast.show ? 'show' : ''}`}>
                <span className='toast-icon'>{toast.type === 'success' ? '✅' : '❌'}</span>
                <span>{toast.message}</span>
            </div>
        </div>
    )
}

export default Home;