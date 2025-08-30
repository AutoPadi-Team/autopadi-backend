const MechanicServicePlan = require('../models/mechanicServicePlanModel');
const AdminServicePlan = require('../models/adminServicePlanModel');

// Create a new service plan
exports.createServicePlan = async (req, res) => {
    try {
        const { packageId } = req.params;
        const { mechanic, lowPrice, highPrice } = req.body;

        // check if package exists in admin service plans
        const package = await AdminServicePlan.findById(packageId);
        if (!package) {
            return res.status(404).json({
                success: false,
                message: 'Admin service plan not found',
            });
        }

        // check if package already exists for the mechanic
        const existingPlan = await MechanicServicePlan.findOne({$and: [{ package: packageId }, { mechanic }]});
        if (existingPlan) { 
            return res.status(400).json({
                success: false,
                message: `${package.title} already exists for this mechanic`,
            });
        }

        // create new mechanic service plan
        const newPlan = new MechanicServicePlan({
            mechanic,
            lowPrice,
            highPrice,
            package: package._id,
        });
        
        const savedPlan = await newPlan.save();
        res.status(201).json({
            success: true,
            message: 'Service plan created successfully',
            plan: savedPlan,
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal Server Error: ${error.message}`,
        });
    }
};

// Update an existing service plan
exports.updateServicePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { lowPrice, highPrice } = req.body;
        const updatedPlan = await MechanicServicePlan.findByIdAndUpdate(
            id,
            {
                lowPrice,
                highPrice,
            },
            { new: true }
        );

        if (!updatedPlan) {
            return res.status(404).json({
                success: false,
                message: 'Service plan not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service plan updated successfully',
            plan: updatedPlan,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal Server Error: ${error.message}`,
        });
    }
};

// get all service plans
exports.getAllServicePlans = async (req, res) => {
    try {
        const plans = await MechanicServicePlan.find().populate("package", "title lowPrice highPrice benefits").sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            plans,
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal Server Error: ${error.message}`,
        });
    }
};

// get service plans by mechanic ID
exports.getMechanicServicePlans = async (req, res) => {
    try {
        const { mechanicId } = req.params;
        const plans = await MechanicServicePlan.find({ mechanic: mechanicId }).populate("package", "title lowPrice highPrice benefits");
        if (!plans) {
            return res.status(404).json({
                success: false,
                message: "No service plans found for this mechanic",
            });
        }

        res.status(200).json({
            success: true,
            message: "Service plans fetched successfully",
            plans,
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal Server Error: ${error.message}`,
        });
    }
};