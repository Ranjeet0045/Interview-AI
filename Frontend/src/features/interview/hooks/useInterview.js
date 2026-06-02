import {generateInterviewReport, getAllInterviewReports, getInterviewReportById, deleteInterviewReport, getResumePdf} from "../services/interview.api";
import { InterviewContext } from "../interview.context.js";
import { useCallback, useContext, useEffect } from "react";
import { useParams } from "react-router";

export const useInterview = () => {
    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if(!context){
        throw new Error("useInterview must be used within an interviewProvider");
    }

    const {loading, setLoading, report, setReport, reports, setReports} = context;

    const generateReport = async ({jobDescription, selfDescription, resumeFile}) => {
        setLoading(true);
        try {
            const response = await generateInterviewReport({jobDescription, selfDescription, resumeFile});
            const report = response.interviewReport || response;
            setReport(report);
            return report;
        } catch (error) {
            console.error("Error generating interview report:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const getReportById = useCallback(async (interviewId) => {
        setLoading(true);
        try {
            const response = await getInterviewReportById(interviewId);
            setReport(response.interviewReport);
        } catch (error) {
            console.error("Error fetching interview report by ID:", error);
        } finally {
            setLoading(false);
        }
    }, [setLoading, setReport])

    const getReports = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllInterviewReports();
            setReports(response.interviewReports);
        } catch (error) {
            console.error("Error fetching all interview reports:", error);
        } finally {
            setLoading(false);
        }
    }, [setLoading, setReports])

    const deleteReport = useCallback(async (reportId) => {
        try {
            await deleteInterviewReport(reportId);
            // Remove the deleted report from the list
            setReports((prev) => prev.filter((r) => r._id !== reportId));
            return true;
        } catch (error) {
            console.error("Error deleting interview report:", error);
            throw error;
        }
    }, [setReports])

    const downloadResume = async (interviewId) => {
        try {
            const responseData = await getResumePdf(interviewId);
            return responseData;
        } catch (error) {
            console.error("Error fetching resume PDF blob:", error);
            throw error;
        }
    }

    useEffect(() => {
        if(interviewId){
            getReportById(interviewId)
        }
        else{
            getReports()
        }
    }, [getReportById, getReports, interviewId])

    return {loading, report, reports, generateReport, getReportById, getReports, deleteReport, downloadResume};
}