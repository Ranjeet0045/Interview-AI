const mongoose = require("mongoose");
const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * Recursively parse any stringified JSON values in the AI response.
 * The Gemini model sometimes returns embedded objects as JSON strings
 * instead of actual objects, which causes Mongoose CastError on subdocuments.
 */
function deepParseStringifiedJSON(value) {
    if (typeof value === "string") {
        // Strip surrounding backticks if present (e.g. `{...}`)
        const trimmed = value.trim().replace(/^`+|`+$/g, "").trim();
        if (
            (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
            (trimmed.startsWith("[") && trimmed.endsWith("]"))
        ) {
            try {
                return deepParseStringifiedJSON(JSON.parse(trimmed));
            } catch {
                return value; // not valid JSON, return as-is
            }
        }
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(deepParseStringifiedJSON);
    }
    if (value !== null && typeof value === "object") {
        const result = {};
        for (const key of Object.keys(value)) {
            result[key] = deepParseStringifiedJSON(value[key]);
        }
        return result;
    }
    return value;
}

/**
 * Validate and transform the AI response to match the Mongoose schema.
 * The AI sometimes returns arrays of strings (e.g. field names like "question")
 * instead of arrays of objects. This function filters out any non-object entries
 * and ensures only properly structured subdocuments reach Mongoose.
 */
function validateAndTransformReport(report) {
    const validated = { ...report };

    // Helper: ensure every item in the array is a plain object with the required keys.
    // Non-object entries (strings, numbers, nulls) are discarded.
    function filterValidObjects(arr, requiredKeys) {
        if (!Array.isArray(arr)) return [];
        return arr.filter(item => {
            if (item === null || typeof item !== "object" || Array.isArray(item)) {
                return false;
            }
            // Check that at least some of the expected keys exist
            return requiredKeys.some(key => key in item);
        });
    }

    // technicalQuestions: each item must be { question, intention, answer }
    validated.technicalQuestions = filterValidObjects(
        validated.technicalQuestions,
        ["question", "intention", "answer"]
    );

    // behavioralQuestions: each item must be { question, intention, answer }
    validated.behavioralQuestions = filterValidObjects(
        validated.behavioralQuestions,
        ["question", "intention", "answer"]
    );

    // skillGaps: each item must be { skill, severity }
    validated.skillGaps = filterValidObjects(
        validated.skillGaps,
        ["skill", "severity"]
    );

    // preparationPlan: each item must be { day, focus, tasks }
    validated.preparationPlan = filterValidObjects(
        validated.preparationPlan,
        ["day", "focus", "tasks"]
    );

    // matchScore: ensure it's a number
    if (typeof validated.matchScore !== "number") {
        validated.matchScore = Number(validated.matchScore) || 0;
    }

    return validated;
}

/**
 * @description Generate a new interview report based on user self-description, resume PDF, and job description.
 */
async function generateInterviewController(req, res){

    try {
        const resumeFile = req.file;
        if (!resumeFile) {
            return res.status(400).json({
                message: "Resume file is required. Please upload a PDF file."
            });
        }

        const { selfDescription, jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({
                message: "Job description is required."
            });
        }

        const parser = new pdfParse.PDFParse({
            data: Uint8Array.from(resumeFile.buffer),
            standardFontDataUrl: "http://localhost:3000/standard_fonts/"
        });
        const resumeContent = await parser.getText();

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDeclaration: selfDescription,
            jobDescription
        });

        // Debug: log raw AI response to diagnose malformed data
        console.log("Raw AI response:", JSON.stringify(interviewReportByAi, null, 2));

        // Step 1: Parse any stringified JSON values
        const parsedReport = deepParseStringifiedJSON(interviewReportByAi);

        // Step 2: Validate and filter — remove non-object array entries
        const sanitizedReport = validateAndTransformReport(parsedReport);

        // Generate a clean, human-readable plan title from the job description.
        const generateTitle = (jobDesc = "") => {
            const text = String(jobDesc).replace(/\s+/g, " ").trim();
            if (!text) return "Interview Plan";

            // 1) Try common labelled patterns: "Role: ...", "Position: ...", "Job Title: ..."
            const labelled = text.match(
                /(?:job\s*title|role|position|title|hiring for)\s*[:\-–]\s*([^\n.,;|]{2,80})/i
            );
            if (labelled && labelled[1]) {
                return `Interview Plan · ${labelled[1].trim().replace(/[.,;|]+$/, "")}`;
            }

            // 2) Try "We're hiring a <ROLE>" / "Looking for a <ROLE>"
            const hiring = text.match(
                /(?:hiring|looking for|seeking|recruiting)\s+(?:a|an|our next)?\s*([A-Z][A-Za-z0-9 +/&\-]{3,60})/
            );
            if (hiring && hiring[1]) {
                return `Interview Plan · ${hiring[1].trim().replace(/[.,;|]+$/, "")}`;
            }

            // 3) Fallback: take a short first sentence / fragment and stop at natural boundary
            const firstFragment = text.split(/[.!?\n]/)[0] || text;
            const words = firstFragment.split(/\s+/).slice(0, 6).join(" ");
            const clipped = words.length > 42 ? words.slice(0, 42).trim() + "…" : words.trim();
            return `Interview Plan · ${clipped || "New role"}`;
        };

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            title: generateTitle(jobDescription),
            ...sanitizedReport
        });

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        });
    } catch (error) {
        console.error("Error in generateInterviewController:", error);
        res.status(500).json({
            message: "Failed to generate interview report",
            error: error.message
        });
    }
}

/**
 * @description Get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res){
    try {
        const { interviewId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(interviewId)) {
            return res.status(400).json({
                message: "Invalid interview report ID format"
            });
        }
        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            });
        }

        res.status(200).json({
            message: "Interview report fetched successfully",
            interviewReport
        });
    } catch (error) {
        console.error("Error in getInterviewReportByIdController:", error);
        res.status(500).json({
            message: "Failed to fetch interview report",
            error: error.message
        });
    }
}

/**
 * @description Get all interview reports of the logged-in user
 */
async function getAllInterviewReportsController(req, res){
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -vehavioralQuestions -skillGaps -preparationPlan"); 

    res.status(200).json({
        message: "Interview reports fetched successfully",
        interviewReports
    });
}

/**
 * @description Delete interview report by interviewId
 */
async function deleteInterviewReportController(req, res){
    const { interviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
        return res.status(400).json({
            message: "Invalid interview report ID format"
        });
    }
    
    try {
        const interviewReport = await interviewReportModel.findOneAndDelete({ 
            _id: interviewId, 
            user: req.user.id 
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            });
        }

        res.status(200).json({
            message: "Interview report deleted successfully"
        });
    } catch (error) {
        console.error("Error in deleteInterviewReportController:", error);
        res.status(500).json({
            message: "Failed to delete interview report",
            error: error.message
        });
    }
}

/**
 * @description Controller to generate resume pdf based on user self-description, resume content, and job description. This is a separate endpoint from the main interview report generation to allow users to download a nicely formatted PDF version of their resume with AI enhancements.
*/
async function generateResumePdfController(req, res) {
    try {
        const interviewId = req.params.interviewId || req.params.interviewReportId;
        if (!mongoose.Types.ObjectId.isValid(interviewId)) {
            return res.status(400).json({
                message: "Invalid interview report ID format"
            });
        }
        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            });
        }

        const { resume, selfDescription, jobDescription } = interviewReport;
        const pdfBuffer = await generateResumePdf({ resume, selfDeclaration: selfDescription, jobDescription });
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="resume.pdf"'
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error in generateResumePdfController:", error);
        res.status(500).json({
            message: "Failed to generate resume PDF",
            error: error.message
        });
    }
}

module.exports = {
    generateInterviewController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    deleteInterviewReportController,
    generateResumePdfController
};