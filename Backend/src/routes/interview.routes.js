const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");

const interviewRouter = express.Router()

/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description, resume pdf and job description
 * @access private
 */
interviewRouter.post("/", authMiddleware.authUser,upload.single("resume"), interviewController.generateInterviewController);

/**
 * @route Get /api/interview/report/:interviewId
 * @description get interview report by id
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController);

/**
 * @route Get /api/interview/
 * @description get all interview reports of the logged in user
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController);

/**
 * @route DELETE /api/interview/:interviewId
 * @description delete interview report by id
 * @access private
 */
interviewRouter.delete("/:interviewId", authMiddleware.authUser, interviewController.deleteInterviewReportController);

/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf from the given resume data, self declaration and job description
 * @access private
 */
interviewRouter.get("/resume/pdf/:interviewId", authMiddleware.authUser, interviewController.generateResumePdfController);
interviewRouter.post("/resume/pdf/:interviewId", authMiddleware.authUser, interviewController.generateResumePdfController);
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, upload.single("resume"), interviewController.generateResumePdfController);

module.exports = interviewRouter