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
const mechanicServiceSubscriptionBalanceRoute = require("./components/routes/mechanicSubscriptionBalanceRoute");
const paystackWebhookRoute = require("./components/routes/paystackWebhookRoute");
const cashTransferRoute = require("./components/routes/cashTransferRoute");
const requestConnection = require("./components/routes/requestConnectionRoute");
const socketIo = require("socket.io");
const http = require("http")
const { socketStarter } = require("./components/websocket/server")
const dotenv = require("dotenv");
dotenv.config();

// Connect to the database
connectDB();

// Initialize service subscription reminders
ServiceSubscriptionReminders();


const app = express();
const port = process.env.PORT || 8080;
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

//Create server and connect to socket
const server = http.createServer(app);
socketStarter(server); // Start socket server


app.use(cors());
app.use(cookieParser());

// health check
app.use((req, res) => {
  res.status(200).json({
    status: "ok"
  })
});

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
app.use("/api", mechanicServiceSubscriptionBalanceRoute);
app.use("/api", paystackWebhookRoute);
app.use("/api", cashTransferRoute);
app.use("/api", requestConnection);


// default route
app.get("/", (req, res) => {
  res.json({ message: "AutoPadi server running successfully.." });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});
