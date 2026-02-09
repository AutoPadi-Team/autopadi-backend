const PremiumPayment = require("../models/premiumPaymentModel");
const PremiumPlan = require("../models/adminPremiumPlanModel");
const User = require("../models/usersModel");
const smsInfo = require("../smsSender/smsInfo")
const api = require("../axiosApi/api");

// subscribe to premium membership
exports.makePremiumPayment = async (req, res) => {
    try {
        const { userId } = req.body;

        // check for existing user
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // fetch amount from a specific user premium plan
        let subscriptionAmount = 0;
        if(user.role === "driver"){
            const driverPremiumPlan = await PremiumPlan.findOne({
              category: "driver",
            });
            subscriptionAmount = driverPremiumPlan.isDiscount 
            ? driverPremiumPlan.promotionPriceYearly 
            : driverPremiumPlan.fixedPriceYearly;
        } else {
            const mechanicPremiumPlan = await PremiumPlan.findOne({
              category: "mechanic",
            });
            subscriptionAmount = mechanicPremiumPlan.isDiscount
              ? mechanicPremiumPlan.promotionPriceYearly
              : mechanicPremiumPlan.fixedPriceYearly;
        };
    
        // Initialize Paystack transaction
        const response = await api.post(
          "https://api.paystack.co/transaction/initialize",
          {
            amount: subscriptionAmount * 100, // Convert to pesewas
            email: user.email,
            metadata: {
              custom_fields: [
                {
                  variable_name: "user_id",
                  value: userId,
                },
                {
                  variable_name: "payment_model",
                  value: "premium_member",
                },
              ]
            }
          }
        );
        // Deconstruct response data
        const { status, message, data } = response.data;
    
        res.status(201).json({
          success: status,
          message: message,
          amount: subscriptionAmount,
          authorization_url: data.authorization_url,
        });
      } catch (error) {
        res.status(500).json({ message: `Server error: ${error.response?.data?.message || error.message}` });
      }
};

// renew premium membership
exports.renewPremiumPayment = async (req, res) => {
    try {
        const { userId } = req.body;

        // check for existing user
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // fetch amount from a specific user premium plan
        let subscriptionAmount = 0;
        if(user.role === "driver"){
            const driverPremiumPlan = await PremiumPlan.findOne({
              category: "driver",
            });
            subscriptionAmount = driverPremiumPlan.isDiscount 
            ? driverPremiumPlan.promotionPriceYearly 
            : driverPremiumPlan.fixedPriceYearly;
        } else {
            const mechanicPremiumPlan = await PremiumPlan.findOne({
              category: "mechanic",
            });
            subscriptionAmount = mechanicPremiumPlan.isDiscount
              ? mechanicPremiumPlan.promotionPriceYearly
              : mechanicPremiumPlan.fixedPriceYearly;
        };
    
        // Initialize Paystack transaction
        const response = await api.post(
          "https://api.paystack.co/transaction/initialize",
          {
            amount: subscriptionAmount * 100, // Convert to pesewas
            email: user.email,
            metadata: {
              custom_fields: [
                {
                  variable_name: "user_id",
                  value: userId,
                },
                {
                  variable_name: "payment_model",
                  value: "renew_premium_member",
                },
              ]
            }
          }
        );
        // Deconstruct response data
        const { status, message, data } = response.data;
    
        res.status(201).json({
          success: status,
          message: message,
          amount: subscriptionAmount,
          authorization_url: data.authorization_url,
        });
      } catch (error) {
        res.status(500).json({ message: `Server error: ${error.response?.data?.message || error.message}` });
      }
};

// cancel premium membership
exports.cancelPremiumPayment = async (req, res) => {
    try {
        const { userId } = req.body;

        // check for existing user
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // update premium membership to false
        user.premiumMember = false;
        user.save();

        // send notice to user
        await smsInfo({
          phoneNumber: user.phoneNumber,
          msg: `Dear ${user.fullName}, we're sorry to see you go. Your premium membership with AutoPadi has been cancelled.`,
        });
    
        res.status(201).json({
          success: true,
          message: "premium cancelled successfully",
          user: {
            fullName: user.fullName,
            premiumMember: user.premiumMember,
          }
        });
      } catch (error) {
        res.status(500).json({ message: `Server error: ${error.response?.data?.message || error.message}` });
      }
};

// get user premium payments
exports.getUserPremiumPayment = async (req, res) => {
    try {
        const { userId } = req.params;

        const userPremiumPayment = await PremiumPayment.find({
          userId,
        }).populate({
          path: "userId",
          select: "fullName phoneNumber email role",
          populate: {
            path: "profileImage",
            select: "image",
          },
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "premium payment fetched successfully",
            premiumPayment: userPremiumPayment,
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`
        })
    }
};

// get all users premium payments(admin)
exports.getAllUserPremiumPayment = async (req, res) => {
    try {
        const userPremiumPayment = await PremiumPayment.find()
        .populate({
            path: "userId",
            select: "fullName phoneNumber email role",
            populate: {
                path: "profileImage",
                select: "image"
            }
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "premium payment fetched successfully",
            premiumPayment: userPremiumPayment,
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`
        })
    }
};