const router = require('express').Router();
const { createServicePlan, updateServicePlan, getAllServicePlans, getMechanicServicePlans } = require('../controllers/mechanicServicePlanController');
const { verifyToken } = require('../middleware/authenticate');

router.post("/mechanic-create-plan/:packageId", verifyToken, createServicePlan); // create mechanic service plan route
router.put('/mechanic-update-plan/:id', verifyToken, updateServicePlan); // update mechanic service plan route
router.get('/get-all-plans', verifyToken, getAllServicePlans); // get all mechanic service plans route 
router.get('/get-mechanic-plans/:mechanicId', verifyToken, getMechanicServicePlans); // get all mechanic service plans by mechanic ID route

module.exports = router;