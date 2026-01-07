const router = require("express").Router();
const { createBrandService, updateBrandService, getAllBrandServices, deleteBrandService } = require("../controllers/brandServiceListController");
const { verifyToken } = require("../middleware/authenticate");

router.post("/create-brand-service", verifyToken, createBrandService); // create brand service
router.put("/update-brand-service/:id", verifyToken, updateBrandService); // update brand service
router.get("/get-brand-services", verifyToken, getAllBrandServices); // get all brand services
router.delete("/delete-brand-service/:id", verifyToken, deleteBrandService); // delete brand service

module.exports = router;