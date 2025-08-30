const router = require("express").Router();
const { createBrandService, updateBrandService, getAllBrandServices, deleteBrandService } = require("../controllers/brandServiceListController");

router.post("/create-brand-service", createBrandService); // create brand service
router.put("/update-brand-service/:id", updateBrandService); // update brand service
router.get("/get-brand-services", getAllBrandServices); // get all brand services
router.delete("/delete-brand-service/:id", deleteBrandService); // delete brand service

module.exports = router;