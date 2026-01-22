const CommonServiceIssue = require("../models/commonServiceIssueModel");

// create new issue
exports.createServiceIssue = async (req, res) => {
    try {
        const { name } = req.body;

        // check if issue exists
        const issue = await CommonServiceIssue.findOne({ name: { $regex: name, $options: "i" } });
        if(issue){
            return res.status(404).json({
                success: false,
                message: "Issue already exist"
            });
        };

        const newIssue = new CommonServiceIssue({
            name
        });
        const savedNewIssue = await newIssue.save();

        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            issue: savedNewIssue
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`
        });
    }
};

// edit issue
exports.updateServiceIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // check if issue exists
        const issue = await CommonServiceIssue.findById(id);
        if(!issue){
            return res.status(404).json({
                success: false,
                message: "Issue not found."
            });
        }

        const updateIssue = await CommonServiceIssue.findByIdAndUpdate(id, {
            name
        }, 
        { new: true });

        res.status(201).json({
          success: true,
          message: "Issue created successfully",
          issue: updateIssue,
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`
        });
    }
};

// delete issue
exports.deleteServiceIssue = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleteIssue = await CommonServiceIssue.findByIdAndDelete(id);
        if (!deleteIssue) {
          return res.status(404).json({
            success: false,
            message: "Issue not found.",
          });
        }
        
        res.status(201).json({
          success: true,
          message: "Issue deleted successfully",
          name: deleteIssue.name
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`
        });
    }
};

// fetch all issues
exports.getAllServiceIssue = async (req, res) => {
    try {
        const issue = await CommonServiceIssue.find().sort({ createdAt: -1 });
        res.status(201).json({
          success: true,
          message: "Issues fetched successfully",
          issue,
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`
        });
    }
};