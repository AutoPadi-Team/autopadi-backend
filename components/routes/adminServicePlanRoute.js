const router = require("express").Router();
const {
  createServicePlan,
  updateServicePlan,
  getAllServicePlans,
  deleteServicePlan,
} = require("../controllers/adminServicePlanController");
const { verifyToken } = require("../middleware/authenticate");

router.post("/create-plans", verifyToken, createServicePlan); // create service plan route
router.put("/update-plans/:id", verifyToken, updateServicePlan); // update service plan route
router.get("/get-plans", verifyToken, getAllServicePlans); // get all service plans route
router.delete("/delete-plans/:id", verifyToken, deleteServicePlan); // delete service plan route

module.exports = router;
