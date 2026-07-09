const axios = require("axios");

const EMERGENT_KEY = process.env.EMERGENT_LLM_KEY || process.env.GOOGLE_GENAI_API_KEY;
const LLM_ENDPOINT =
    (process.env.INTEGRATION_PROXY_URL || "https://integrations.emergentagent.com") +
    "/llm/chat/completions";

const CHAT_MODEL = "gemini-3-flash-preview";

async function chat({ system, user, jsonMode = false }) {
    const payload = {
        model: CHAT_MODEL,
        messages: [
            ...(system ? [{ role: "system", content: system }] : []),
            { role: "user", content: user },
        ],
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    };

    const { data } = await axios.post(LLM_ENDPOINT, payload, {
        headers: {
            Authorization: `Bearer ${EMERGENT_KEY}`,
            "Content-Type": "application/json",
        },
        timeout: 120000,
    });

    return data?.choices?.[0]?.message?.content || "";
}

function extractJson(text) {
    if (!text) return {};
    // Strip common code fences
    const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/, "")
        .trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        // Try to grab the largest {...} block
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
            try { return JSON.parse(match[0]); } catch { /* fall through */ }
        }
        return {};
    }
}

async function generateInterviewReport({ resume, selfDeclaration, jobDescription }) {
    const system =
        "You are an expert career coach and interviewer. Reply ONLY with valid JSON that matches the requested schema — no prose, no code fences.";

    const user = `Based on the candidate's resume, self-declaration, and job description, produce an interview study plan as a JSON object with exactly these keys:
{
  "matchScore": number 0-100,
  "technicalQuestions": [ { "question": string, "intention": string, "answer": string } ],
  "behavioralQuestions": [ { "question": string, "intention": string, "answer": string } ],
  "skillGaps": [ { "skill": string, "severity": "low"|"medium"|"high" } ],
  "preparationPlan": [ { "day": number, "focus": string, "tasks": [string] } ]
}

Aim for 5-8 technical questions, 3-5 behavioral, 3-6 skill gaps, and a 5-day plan.

--- RESUME ---
${resume || "(none provided)"}

--- SELF DECLARATION ---
${selfDeclaration || "(none provided)"}

--- JOB DESCRIPTION ---
${jobDescription}`;

    let raw;
    try {
        raw = await chat({ system, user, jsonMode: true });
    } catch (err) {
        const msg = err?.response?.data?.error?.message || err.message;
        throw new Error("LLM call failed: " + msg);
    }

    const parsed = extractJson(raw);

    return {
        matchScore: Number(parsed.matchScore) || 0,
        technicalQuestions: Array.isArray(parsed.technicalQuestions) ? parsed.technicalQuestions : [],
        behavioralQuestions: Array.isArray(parsed.behavioralQuestions) ? parsed.behavioralQuestions : [],
        skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : [],
        preparationPlan: Array.isArray(parsed.preparationPlan) ? parsed.preparationPlan : [],
    };
}

/**
 * Kept for API compatibility with the old interview.controller.js.
 * The frontend now generates PDFs client-side (jsPDF), so this
 * server-side path is no longer the primary flow. If invoked, it
 * still returns a minimal PDF as a plain Buffer via pdfkit.
 */
async function generateResumePdf({ resume }) {
    // Extremely small dependency-free PDF fallback: return a plain
    // text-only PDF so any legacy caller still receives a valid buffer.
    const content = (resume || "Resume").slice(0, 4000);
    return Buffer.from(minimalPdf(content), "binary");
}

function minimalPdf(text) {
    const escaped = text
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");
    const stream = `BT /F1 12 Tf 40 780 Td (${escaped.substring(0, 800)}) Tj ET`;
    const objects = [
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
        "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj",
        `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`,
        "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [];
    for (const obj of objects) {
        offsets.push(pdf.length);
        pdf += obj + "\n";
    }
    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) {
        pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return pdf;
}

module.exports = {
    generateInterviewReport,
    generateResumePdf,
};
