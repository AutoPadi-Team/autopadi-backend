const { subscribeToServicePlan, cancelSubscription, renewSubscription, getAllSubscriptions, getUserSubscriptions, updateMaintenanceTaskStatus } = require("../controllers/ServicePlanSubscriptionController");
const { verifyToken } = require("../middleware/authenticate");
const router = require("express").Router();

router.post("/service-plan/subscribe", verifyToken, subscribeToServicePlan); // subscribe to a service plan
router.put("/service-plan/cancel-subscription/:id", verifyToken, cancelSubscription); // cancel a subscription
router.put("/service-plan/renew-subscription/:id", verifyToken, renewSubscription); // renew a subscription
router.put("/service-plan/update-maintenance-task/:id", verifyToken, updateMaintenanceTaskStatus); // update maintenance task status
router.get("/service-plan/subscriptions/driverId/:driverId/mechanicId/:mechanicId", verifyToken, getUserSubscriptions); // get subscriptions for a user
router.get("/service-plan/subscriptions", verifyToken, getAllSubscriptions); // get all subscriptions

module.exports = router;