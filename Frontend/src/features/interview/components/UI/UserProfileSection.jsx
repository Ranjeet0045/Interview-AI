import { useState } from 'react';

const UserProfileSection = ({
    jobDescription,
    selfDescription,
    setSelfDescription,
    resumeInputRef,
    handleGenerateReport,
    loading
}) => {
    const [uploadedFileName, setUploadedFileName] = useState(null);

    return (
        <section className='user-profile-section'>
            <div className='section-header'>
                <div className='section-icon'>👤</div>
                <h2>Your Profile</h2>
            </div>

            {/* Resume Upload Section */}
            <div className='resume-upload-group'>
                <div className='upload-label'>
                    <span>Upload Resume</span>
                    <span className='highlight-pink'>*Best Result</span>
                </div>
                
                <label htmlFor='resume' className='file-upload-area'>
                    {uploadedFileName ? (
                        <>
                            <div className='upload-icon'>✅</div>
                            <p className='uploaded-file'>{uploadedFileName}</p>
                            <small>Click to change file</small>
                        </>
                    ) : (
                        <>
                            <div className='upload-icon'>📄</div>
                            <p>Click to upload or drag & drop</p>
                            <small>PDF or DOCX (Max 2MB)</small>
                        </>
                    )}
                    <input 
                        ref={resumeInputRef}
                        hidden
                        type='file'
                        name='resume'
                        id='resume'
                        accept='.pdf,.docx'
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setUploadedFileName(e.target.files[0].name);
                            }
                        }}
                    />
                </label>
            </div>

            {/* Divider */}
            <div className='upload-divider'>
                <span>OR</span>
            </div>

            {/* Self Description Section */}
            <div className='self-description-group'>
                <label htmlFor='selfDescription'>Quick Self-Description</label>
                <textarea
                    onChange={(e)=>{setSelfDescription(e.target.value)}}
                    name='selfDescription'
                    id='selfDescription'
                    className='self-description-textarea'
                    placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                />
            </div>

            {/* Validation Notice */}
            <div className='validation-notice'>
                <div className='notice-icon'>ℹ️</div>
                <p>Either a <strong>Resume</strong> or <strong>Self Description</strong> is required to generate a personalized plan.</p>
            </div>

            {/* Generate Button */}
            <button 
                onClick={handleGenerateReport}
                className='btn-generate-strategy'
                disabled={loading || (!jobDescription && !selfDescription && !uploadedFileName)}>
                {loading ? '⏳ Generating...' : '✨ Generate My Interview Strategy'}
            </button>
        </section>
    );
};

export default UserProfileSection;
