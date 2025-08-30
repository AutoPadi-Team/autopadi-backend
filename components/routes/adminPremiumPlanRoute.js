const { createPremiumPlan, updatePremiumPlan, getAllPremiumPlans, getPremiumPlanById, deletePremiumPlan } = require("../controllers/adminPremiumPlanController");
const { verifyToken } = require("../middleware/authenticate");
const router = require("express").Router();

router.post("/create-premium-plan", verifyToken, createPremiumPlan); // create a new premium plan
router.put("/update-premium-plan/:id", verifyToken, updatePremiumPlan); // update a premium plan
router.get("/get-all-premium-plans", verifyToken, getAllPremiumPlans); // get all premium plans
router.get("/get-premium-plan/:id", verifyToken, getPremiumPlanById); // get a single premium plan by id
router.delete("/delete-premium-plan/:id", verifyToken, deletePremiumPlan); // delete a premium plan by id

module.exports = router;
