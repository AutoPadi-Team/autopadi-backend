const { createServiceIssue, updateServiceIssue, getAllServiceIssue, deleteServiceIssue } = require("../controllers/commonServiceIssueController");
const { verifyToken } = require("../middleware/authenticate");
const router = require("express").Router();

router.post("/create-issue", verifyToken, createServiceIssue); // create new issue
router.put("/edit-issue/:id", verifyToken, updateServiceIssue); // edit issue
router.get("/fetch-issues", verifyToken, getAllServiceIssue); // fetch all issues
router.delete("/delete-issue/:id", verifyToken, deleteServiceIssue); // delete issue

module.exports = router;