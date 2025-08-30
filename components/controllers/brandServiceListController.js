const BrandServiceList = require("../models/brandServiceListModel");

// Create brand service
exports.createBrandService = async (req, res) => {
    try {
        const { name } = req.body;

        const existingBrand = await BrandServiceList.findOne({ name: { $regex: name, $options: "i" } });
        if (existingBrand) {
            return res.status(400).json({
                success: false,
                message: "Brand already exists",
            });
        }

        const brandService = new BrandServiceList({ name });
        await brandService.save();

        res.status(201).json({
            success: true,
            message: `${brandService.name} created successfully`,
            brand: brandService,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`,
        });
    }
};

// Update brand service
exports.updateBrandService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const brandService = await BrandServiceList.findById(id);
        if (!brandService) {
            return res.status(404).json({
                success: false,
                message: "Brand service not found",
            });
        }

        brandService.name = name || brandService.name;
        await brandService.save();

        res.status(200).json({
          success: true,
          message: `${brandService.name} updated successfully`,
          brand: brandService,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`,
        });
    }
};

// Get all brand services
exports.getAllBrandServices = async (req, res) => {
    try {
        const brands = await BrandServiceList.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "Brand services retrieved successfully",
            brands,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`,
        });
    }
};

// Delete brand service
exports.deleteBrandService = async (req, res) => {
    try {
        const { id } = req.params;

        const brandService = await BrandServiceList.findByIdAndDelete(id);
        if (!brandService) {
            return res.status(404).json({
                success: false,
                message: "Brand service not found",
            });
        }

        res.status(200).json({
            success: true,
            message: `${brandService.name} deleted successfully`,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`,
        });
    }
};