const JobDescriptionSection = ({ jobDescription, setJobDescription }) => {
    const charCount = jobDescription?.length || 0;
    const maxChars = 5000;

    return (
        <section className='job-description-section'>
            <div className='section-header'>
                <div className='section-icon'>⚔️</div>
                <h2>Target Job Description</h2>
                <span className='section-badge'>Required</span>
            </div>
            
            <textarea
                onChange={(e)=>{setJobDescription(e.target.value)}}
                name="jobDescription"
                id='jobDescription'
                className='job-textarea'
                placeholder='Paste the full job description here...'
                value={jobDescription}
                maxLength={maxChars}
            />
            
            <div className='char-counter'>
                <span>{charCount} / {maxChars} chars</span>
            </div>
        </section>
    );
};

export default JobDescriptionSection;
