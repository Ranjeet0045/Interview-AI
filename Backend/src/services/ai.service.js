const {GoogleGenAI} = require("@google/genai");
const puppeteer = require("puppeteer");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

/**
 * Hand-crafted JSON schema for the Gemini responseSchema config.
 * Using zodToJsonSchema was causing issues — it generates $schema, $ref,
 * and definitions wrappers that Gemini misinterprets, leading to the model
 * returning property names (e.g. "question") as string values instead of
 * actual objects.
 */
const responseSchema = {
    type: "object",
    properties: {
        matchScore: {
            type: "number",
            description: "A score between 0 to 100 indicating how well the candidate's resume matches the job description"
        },
        technicalQuestions: {
            type: "array",
            description: "A list of technical questions that can be asked in the interview based on the resume and job description",
            items: {
                type: "object",
                properties: {
                    question: {
                        type: "string",
                        description: "The technical question that can be asked in the interview"
                    },
                    intention: {
                        type: "string",
                        description: "The intention of the interviewer behind asking this question"
                    },
                    answer: {
                        type: "string",
                        description: "How to answer this question, what to cover, what approach to follow"
                    }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behavioralQuestions: {
            type: "array",
            description: "A list of behavioral questions that can be asked in the interview based on the resume and job description",
            items: {
                type: "object",
                properties: {
                    question: {
                        type: "string",
                        description: "The behavioral question that can be asked in the interview"
                    },
                    intention: {
                        type: "string",
                        description: "The intention of the interviewer behind asking this question"
                    },
                    answer: {
                        type: "string",
                        description: "How to answer this question, what to cover, what approach to follow"
                    }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGaps: {
            type: "array",
            description: "A list of skill gaps identified based on the resume and job description",
            items: {
                type: "object",
                properties: {
                    skill: {
                        type: "string",
                        description: "The skill which the candidate is lacking based on the resume and job description"
                    },
                    severity: {
                        type: "string",
                        enum: ["low", "medium", "high"],
                        description: "The severity of the skill gap"
                    }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: "array",
            description: "A day-wise preparation plan for the candidate to prepare for the interview",
            items: {
                type: "object",
                properties: {
                    day: {
                        type: "number",
                        description: "The day number in the preparation plan, starting from 1"
                    },
                    focus: {
                        type: "string",
                        description: "The focus of the preparation for that day, what topics to cover, what resources to use"
                    },
                    tasks: {
                        type: "array",
                        description: "The list of tasks to be completed on that day for preparation",
                        items: {
                            type: "string"
                        }
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        },
        title: {
            type: "string",
            description: "The title of the interview report"
        }
    },
    required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
};


async function generateInterviewReport ({resume, selfDeclaration, jobDescription}){

        const prompt = `You are an expert career coach and interviewer. Based on the candidate's resume, self declaration, and job description, generate an interview report as a JSON object with the following fields:
        - matchScore: number (0-100)
        - technicalQuestions: array of {question, intention, answer}
        - behavioralQuestions: array of {question, intention, answer}
        - skillGaps: array of {skill, severity (low|medium|high)}
        - preparationPlan: array of {day, focus, tasks (array of string)}

        Example:
        {
            "matchScore": 85,
            "technicalQuestions": [
                {"question": "What is a closure?", "intention": "Test JS knowledge", "answer": "A closure is..."}
            ],
            "behavioralQuestions": [
                {"question": "Describe a challenge...", "intention": "Test problem-solving", "answer": "I would..."}
            ],
            "skillGaps": [
                {"skill": "Docker", "severity": "medium"}
            ],
            "preparationPlan": [
                {"day": 1, "focus": "Review JS basics", "tasks": ["Read docs", "Practice problems"]}
            ]
        }

        Resume: ${resume}
        Self Declaration: ${selfDeclaration}
        Job Description: ${jobDescription}
        `;

        let response, parsed;
        try {
                response = await ai.models.generateContent({
                        model: "gemini-3-flash-preview",
                        contents: prompt,
                        config: {
                                responseMimeType: "application/json",
                                responseSchema: responseSchema
                        }
                });
                parsed = JSON.parse(response.text);
        } catch (err) {
                throw new Error("AI response could not be parsed as JSON: " + err.message);
        }

        // Fallback: Ensure all fields exist, even if empty
        return {
                matchScore: parsed.matchScore ?? 0,
                technicalQuestions: parsed.technicalQuestions ?? [],
                behavioralQuestions: parsed.behavioralQuestions ?? [],
                skillGaps: parsed.skillGaps ?? [],
                preparationPlan: parsed.preparationPlan ?? []
        };
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfBuffer;
}

async function generateResumePdf({resume, selfDeclaration, jobDescription}) {
    const responseSchema = {
        type: "object",
        properties: {
            html: {
                type: "string",
                description: "The HTML content of the resume which can be converted to PDF format using a library like Puppeteer"
            }
        },
        required: ["html"]
    };
    
    const prompt = `You are an expert career coach. Based on the candidate's resume, self declaration, and job description, generate a resume content as an HTML string that can be converted to PDF format using a library like Puppeteer. Include styling inside the HTML to make it look professional and beautiful.
    The content should be concise and highlight the candidate's strengths, skills, and experiences that are most relevant to the job description.It should not sound like AI generated it, but rather like a well-crafted resume created by a professional career coach.
    The content should be ATS friendly, meaning it should be easily parsable by Applicant Tracking Systems, which often means avoiding complex layouts, graphics, and using standard section headings like "Experience", "Education", "Skills", etc.THe resume should not be so lengthy, it should be ideally 1-2 pages long when converted to PDF format.                                       
    Resume : ${resume}
    Self Declaration: ${selfDeclaration}
    Job Description: ${jobDescription}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        }
    });

    console.log("generateResumePdf response:", response.text);
    const parsed = JSON.parse(response.text);
    const htmlContent = parsed.html || `<html><body><h1>Resume</h1><pre>${resume}</pre></body></html>`;
    const pdfBuffer = await generatePdfFromHtml(htmlContent);
    return pdfBuffer;
}

module.exports = {
    generateInterviewReport,
    generateResumePdf
};      