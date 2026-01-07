const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./components/dbconfig/dbConfig");
const userRoutes = require("./components/routes/userRoute");
const vehicleRoutes = require("./components/routes/vehicleRoute");
const profileRoute = require("./components/routes/profileRoute");
const businessProfileRoute = require("./components/routes/businessProfileRoute");
const connectRoute = require("./components/routes/connectRoute");
const adminServicePlanRoute = require("./components/routes/adminServicePlanRoute");
const mechanicServicePlanRoute = require("./components/routes/mechanicServicePlanRoute");
const adminPremiumPlanRoute = require("./components/routes/adminPremiumPlanRoute");
const brandServiceListRoute = require("./components/routes/brandServiceListRoute");
const locationRoute = require("./components/routes/locationRoute");
const servicePlanSubscriptionRoute = require("./components/routes/ServicePlanSubscriptionRoute");
const ServiceSubscriptionReminders = require("./components/reminders/ServiceSubscriptionReminders");
const servicePlanPaymentRoute = require("./components/routes/servicePlanPaymentRoute");
const dotenv = require("dotenv");
dotenv.config();

// Connect to the database
connectDB();

// Initialize service subscription reminders
ServiceSubscriptionReminders();

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Use user routes
app.use("/api", userRoutes);
app.use("/api", vehicleRoutes);
app.use("/api", profileRoute);
app.use("/api", businessProfileRoute);
app.use("/api", connectRoute);
app.use("/api", adminServicePlanRoute);
app.use("/api", adminPremiumPlanRoute);
app.use("/api", mechanicServicePlanRoute);
app.use("/api", brandServiceListRoute);
app.use("/api", locationRoute);
app.use("/api", servicePlanSubscriptionRoute);
app.use("/api", servicePlanPaymentRoute);

// Redirect HTTP to HTTPS
// app.use((req, res, next) => {
//   if (req.headers["x-forwarded-proto"] !== "https") {
//     return res.redirect(301, `https://${req.headers.host}${req.url}`);
//   }
//   next();
// });

// const cron = require("node-cron");
// const task = () => {
//   console.log("Running a task every day " + new Date());
//   let data = [
//     { date: new Date("2026-01-02T00:00:00.00+00:00"), event: "Event 1" },
//     { date: new Date("2026-01-02T00:00:00.00+00:00"), event: "Event 2" },
//     { date: new Date("2026-01-02T00:00:00.00+00:00"), event: "Event 3" },
//     { date: new Date("2026-01-02T00:00:00.00+00:00"), event: "Event 4" },
//     { date: new Date("2026-01-04T00:00:00.00+00:00"), event: "Event 5" },
//     { date: new Date("2026-01-04T00:00:00.00+00:00"), event: "Event 6" },
//     { date: new Date("2026-01-04T00:00:00.00+00:00"), event: "Event 7" },
//     { date: new Date("2026-01-04T00:00:00.00+00:00"), event: "Event 8" },
//   ];

//   for (let dataItem of data) {
//     const daysLeft = Math.floor(
//       new Date(dataItem.date - Date.now()) / (1000 * 60 * 60 * 24)
//     );
//     if (daysLeft === 3) {
//       console.log(`Less than ${daysLeft} days remaining until target date for event ${dataItem.event}.`);
//     }
//   }
// };
// cron.schedule("*/5 * * * * *", task);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "AutoPadi server running successfully.." });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
