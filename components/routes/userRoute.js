const {
  register,
  login,
  verifyEmail,
  resendVerificationCode,
  userRole,
  userLocation,
  getUserLocation,
  getUserDetails,
  getAllUserDetails,
  deleteUserDetails,
  generateNewToken,
  getAllInactiveUsers,
  addFingerPrintId,
} = require("../controllers/userController");

const { verifyToken } = require("../middleware/authenticate");
const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/register", register);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", login);

/**
 * @swagger
 * /api/verify-email:
 *   post:
 *     summary: Verify user email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified
 */
router.post("/verify-email", verifyEmail);

/**
 * @swagger
 * /api/resend-verification-code/{email}:
 *   post:
 *     summary: Resend verification code
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification code resent
 */
router.post(
  "/resend-verification-code/:email",
  verifyToken,
  resendVerificationCode,
);

/**
 * @swagger
 * /api/select-role/{id}:
 *   patch:
 *     summary: Select user role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated
 */
router.patch("/select-role/:id", verifyToken, userRole);

/**
 * @swagger
 * /api/add-location/{id}:
 *   patch:
 *     summary: Add user location
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location added
 */
router.patch("/add-location/:id", verifyToken, userLocation);

/**
 * @swagger
 * /api/get-location/{id}:
 *   get:
 *     summary: Get user location
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location retrieved
 */
router.get("/get-location/:id", verifyToken, getUserLocation);

/**
 * @swagger
 * /api/user-details/{id}:
 *   get:
 *     summary: Get user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved
 */
router.get("/user-details/:id", verifyToken, getUserDetails);

/**
 * @swagger
 * /api/users-details:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All users retrieved
 */
router.get("/users-details", verifyToken, getAllUserDetails);

/**
 * @swagger
 * /api/delete-user/{id}:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete("/delete-user/:id", verifyToken, deleteUserDetails);

/**
 * @swagger
 * /api/inactive-users:
 *   get:
 *     summary: Get inactive users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inactive users list
 */
router.get("/inactive-users", verifyToken, getAllInactiveUsers);

/**
 * @swagger
 * /api/refresh-token:
 *   get:
 *     summary: Generate new access token
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: New token generated
 */
router.get("/refresh-token", generateNewToken);

/**
 * @swagger
 * /api/add-fingerprint/{id}:
 *   patch:
 *     summary: Add fingerprint ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fingerprintId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fingerprint added
 */
router.patch("/add-fingerprint/:id", verifyToken, addFingerPrintId);

module.exports = router;
