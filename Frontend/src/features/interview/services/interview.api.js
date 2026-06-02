import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
})

/**
 * 
 *@description service to geneate interview report based on user self-description, resume PDF, and job description.
 */

export const generateInterviewReport = async ({jobDescription, selfDescription, resumeFile}) => {
    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    formData.append("resume", resumeFile)

    const response = await api.post("/api/interview", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
    return response.data;
}

/**
 * 
 * @description service to get interview report by id
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return response.data;
}

/**
 * 
 * @description service to get all interview reports of the logged in user
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/");
    return response.data;
}

/**
 * 
 * @description service to delete interview report by id
 */
export const deleteInterviewReport = async (interviewId) => {
    const response = await api.delete(`/api/interview/${interviewId}`);
    return response.data;
}

/**
 * 
 * @description service to download resume pdf by interviewId
 */
export const getResumePdf = async (interviewId) => {
    const response = await api.get(`/api/interview/resume/pdf/${interviewId}`, {
        responseType: 'blob'
    });
    return response.data;
}


